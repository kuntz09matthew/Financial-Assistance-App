
const { ipcMain, BrowserWindow } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs = require('fs');
const os = require('os');
const Database = require('better-sqlite3');

// Handler to get all transactions for a given month (YYYY-MM)
ipcMain.handle('get-transactions-for-month', async (event, month) => {
  try {
    const appName = 'Financial Assistance App';
    const userDataDir = path.join(os.homedir(), 'AppData', 'Roaming', appName);
    const userDbPath = path.join(userDataDir, 'data.db');
    const packagedDbPath = path.join(__dirname, '../../assets/data.db');
    if (!fs.existsSync(userDataDir)) {
      fs.mkdirSync(userDataDir, { recursive: true });
    }
    if (!fs.existsSync(userDbPath)) {
      fs.copyFileSync(packagedDbPath, userDbPath);
    }
    const db = new Database(userDbPath, { readonly: true });
    // Get all transactions for the given month
    const stmt = db.prepare(`SELECT date, amount, category, description FROM transactions WHERE strftime('%Y-%m', date) = ? ORDER BY date ASC`);
    const rows = stmt.all(month);
    db.close();
    return { transactions: rows };
  } catch (err) {
    return { error: err.message };
  }
});

function setupIPC() {
  // Upcoming Bill Reminders (next 7 days)
  ipcMain.handle('get-upcoming-bill-reminders', async () => {
    try {
      const appName = 'Financial Assistance App';
      const userDataDir = path.join(os.homedir(), 'AppData', 'Roaming', appName);
      const userDbPath = path.join(userDataDir, 'data.db');
      const packagedDbPath = path.join(__dirname, '../../assets/data.db');
      if (!fs.existsSync(userDataDir)) {
        fs.mkdirSync(userDataDir, { recursive: true });
      }
      if (!fs.existsSync(userDbPath)) {
        fs.copyFileSync(packagedDbPath, userDbPath);
      }
      const db = new Database(userDbPath, { readonly: true });
      const today = new Date();
      const todayStr = today.toISOString().slice(0, 10);
      const sevenDaysLater = new Date(today);
      sevenDaysLater.setDate(today.getDate() + 7);
      const sevenDaysStr = sevenDaysLater.toISOString().slice(0, 10);
      // Fetch all bills (negative transactions) due in next 7 days
      const bills = db.prepare(`
        SELECT id, date, amount, category, description, paid, auto_pay
        FROM transactions
        WHERE date > ? AND date <= ? AND amount < 0
        ORDER BY date ASC
      `).all(todayStr, sevenDaysStr);
      // Group by urgency
      const grouped = { urgent: [], soon: [], upcoming: [] };
      let totalDue = 0, unpaidCount = 0, autoPayCount = 0;
      for (const bill of bills) {
        const dueDate = new Date(bill.date);
        const daysAway = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
        let urgency = '';
        if (daysAway <= 2) urgency = 'urgent';
        else if (daysAway <= 5) urgency = 'soon';
        else urgency = 'upcoming';
        // Paid/unpaid status
        const isPaid = bill.paid === 1 || bill.paid === true;
        // Auto-pay badge
        const isAutoPay = bill.auto_pay === 1 || bill.auto_pay === true;
        grouped[urgency].push({
          ...bill,
          isPaid,
          isAutoPay,
          daysAway
        });
        if (!isPaid) {
          totalDue += Math.abs(bill.amount);
          unpaidCount++;
        }
        if (isAutoPay) autoPayCount++;
      }
      db.close();
      return {
        grouped,
        stats: {
          totalDue,
          unpaidCount,
          autoPayCount
        }
      };
    } catch (err) {
      return { error: err.message };
    }
  });
  // Dashboard: Month-over-month summary for last N months
  ipcMain.handle('get-monthly-summary', async (event, months = 6) => {
    try {
      const appName = 'Financial Assistance App';
      const userDataDir = path.join(os.homedir(), 'AppData', 'Roaming', appName);
      const userDbPath = path.join(userDataDir, 'data.db');
      const packagedDbPath = path.join(__dirname, '../../assets/data.db');
      if (!fs.existsSync(userDataDir)) {
        fs.mkdirSync(userDataDir, { recursive: true });
      }
      if (!fs.existsSync(userDbPath)) {
        fs.copyFileSync(packagedDbPath, userDbPath);
      }
      const db = new Database(userDbPath, { readonly: true });
      // Get last N months summary (including current)
      const stmt = db.prepare(`
        SELECT
          strftime('%Y-%m', date) as month,
          SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as totalIncome,
          ABS(SUM(CASE WHEN amount < 0 THEN amount ELSE 0 END)) as totalSpending
        FROM transactions
        WHERE date >= date('now', ?)
        GROUP BY month
        ORDER BY month DESC
        LIMIT ?
      `);
      // e.g., '-5 months' to include current and previous 5 months
      const offset = `-${months - 1} months`;
      const rows = stmt.all(offset, months);
      // Add netSavings and ensure all months are present (fill missing months with zeros)
      const now = new Date();
      const result = [];
      for (let i = months - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = d.toISOString().slice(0, 7);
        const found = rows.find(r => r.month === key);
        result.push({
          month: key,
          totalIncome: found ? found.totalIncome : 0,
          totalSpending: found ? found.totalSpending : 0,
          netSavings: found ? (found.totalIncome - found.totalSpending) : 0
        });
      }
      db.close();
      return { monthlySummary: result };
    } catch (err) {
      return { error: err.message };
    }
  });
  // Budget Health Score (0-100)
  ipcMain.handle('get-budget-health-score', async () => {
    try {
      const appName = 'Financial Assistance App';
      const userDataDir = path.join(os.homedir(), 'AppData', 'Roaming', appName);
      const userDbPath = path.join(userDataDir, 'data.db');
      const packagedDbPath = path.join(__dirname, '../../assets/data.db');
      if (!fs.existsSync(userDataDir)) {
        fs.mkdirSync(userDataDir, { recursive: true });
      }
      if (!fs.existsSync(userDbPath)) {
        fs.copyFileSync(packagedDbPath, userDbPath);
      }
      const db = new Database(userDbPath, { readonly: true });
      // Get all accounts and balances
      const accounts = db.prepare('SELECT * FROM accounts').all();
      // Get this month's total income and expenses
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const firstDay = `${year}-${month.toString().padStart(2, '0')}-01`;
      const lastDay = `${year}-${month.toString().padStart(2, '0')}-31`;
      // Income: sum of positive transactions in current month
      const incomeStmt = db.prepare('SELECT SUM(amount) as totalIncome FROM transactions WHERE date >= ? AND date <= ? AND amount > 0');
      const incomeResult = incomeStmt.get(firstDay, lastDay);
      const totalIncome = incomeResult.totalIncome || 0;
      // Expenses: sum of negative transactions in current month
      const expenseStmt = db.prepare('SELECT SUM(amount) as totalExpenses FROM transactions WHERE date >= ? AND date <= ? AND amount < 0');
      const expenseResult = expenseStmt.get(firstDay, lastDay);
      const totalExpenses = Math.abs(expenseResult.totalExpenses || 0);
      // Net savings = income - expenses
      const netSavings = totalIncome - totalExpenses;
      // Available balance = sum of all account balances
      const availableBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
      // Health score logic (simple version):
      // 100 = Net savings >= 20% of income, no negative balances
      // 80-99 = Net savings 10-20% of income, no negative balances
      // 60-79 = Net savings 0-10% of income, no negative balances
      // 40-59 = Net savings <0, but available balance positive
      // 20-39 = Net savings <0, available balance <0 but not deeply negative
      // 0-19 = Deeply negative available balance or net savings
      let score = 100;
      if (totalIncome <= 0) {
        score = 10;
      } else if (netSavings >= 0.2 * totalIncome && availableBalance >= 0) {
        score = 100;
      } else if (netSavings >= 0.1 * totalIncome && availableBalance >= 0) {
        score = 90;
      } else if (netSavings >= 0 && availableBalance >= 0) {
        score = 75;
      } else if (netSavings < 0 && availableBalance >= 0) {
        score = 55;
      } else if (availableBalance < 0 && availableBalance > -1000) {
        score = 30;
      } else {
        score = 10;
      }
      db.close();
      return { budgetHealthScore: score };
    } catch (err) {
      return { error: err.message };
    }
  });
  // Month-to-date spending summary handler
  // Days until next paycheck handler (demo: biweekly on Fridays)
  ipcMain.handle('get-days-until-next-paycheck', async () => {
    try {
      // For demo: assume next paycheck is the next Friday (biweekly)
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0=Sun, 5=Fri
      let daysUntilFriday = (5 - dayOfWeek + 7) % 7;
      if (daysUntilFriday === 0) daysUntilFriday = 7; // Always future, not today
      // TODO: Replace with DB-driven logic when paycheck schedule is stored
      const nextPaycheckDate = new Date(now);
      nextPaycheckDate.setDate(now.getDate() + daysUntilFriday);
      return {
        daysUntilNextPaycheck: daysUntilFriday,
        nextPaycheckDate: nextPaycheckDate.toISOString().slice(0, 10)
      };
    } catch (err) {
      return { error: err.message };
    }
  });
  ipcMain.handle('get-month-to-date-spending', async () => {
    try {
      const path = require('path');
      const fs = require('fs');
      const os = require('os');
      const Database = require('better-sqlite3');
      const appName = 'Financial Assistance App';
      const userDataDir = path.join(os.homedir(), 'AppData', 'Roaming', appName);
      const userDbPath = path.join(userDataDir, 'data.db');
      const packagedDbPath = path.join(__dirname, '../../assets/data.db');
      if (!fs.existsSync(userDataDir)) {
        fs.mkdirSync(userDataDir, { recursive: true });
      }
      if (!fs.existsSync(userDbPath)) {
        fs.copyFileSync(packagedDbPath, userDbPath);
      }
      const db = new Database(userDbPath, { readonly: true });
      // Get the first and last day of the current month
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const firstDay = `${year}-${month.toString().padStart(2, '0')}-01`;
      const lastDay = `${year}-${month.toString().padStart(2, '0')}-31`;
      // Sum all negative (spending) transactions for this month
      const stmt = db.prepare(`SELECT SUM(amount) as totalSpending FROM transactions WHERE date >= ? AND date <= ? AND amount < 0`);
      const result = stmt.get(firstDay, lastDay);
      db.close();
      return { monthToDateSpending: Math.abs(result.totalSpending || 0) };
    } catch (err) {
      return { error: err.message };
    }
  });

  // Spending velocity (average daily spending for current month)
  // Projected end-of-month balance handler
  ipcMain.handle('get-projected-end-of-month-balance', async () => {
    try {
      console.log('[IPC] get-projected-end-of-month-balance called');
      const appName = 'Financial Assistance App';
      const userDataDir = path.join(os.homedir(), 'AppData', 'Roaming', appName);
      const userDbPath = path.join(userDataDir, 'data.db');
      const packagedDbPath = path.join(__dirname, '../../assets/data.db');
      if (!fs.existsSync(userDataDir)) {
        fs.mkdirSync(userDataDir, { recursive: true });
      }
      if (!fs.existsSync(userDbPath)) {
        fs.copyFileSync(packagedDbPath, userDbPath);
      }
      const db = new Database(userDbPath, { readonly: true });
      // Get all accounts and balances
      const accounts = db.prepare('SELECT * FROM accounts').all();
      const availableBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
      // Get this month's total income and expenses
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const firstDay = `${year}-${month.toString().padStart(2, '0')}-01`;
      const lastDay = `${year}-${month.toString().padStart(2, '0')}-31`;
      // Income: sum of positive transactions in current month
      const incomeStmt = db.prepare('SELECT SUM(amount) as totalIncome FROM transactions WHERE date >= ? AND date <= ? AND amount > 0');
      const incomeResult = incomeStmt.get(firstDay, lastDay);
      const totalIncome = incomeResult.totalIncome || 0;
      // Expenses: sum of negative transactions in current month
      const expenseStmt = db.prepare('SELECT SUM(amount) as totalExpenses FROM transactions WHERE date >= ? AND date <= ? AND amount < 0');
      const expenseResult = expenseStmt.get(firstDay, lastDay);
      const totalExpenses = Math.abs(expenseResult.totalExpenses || 0);
      // Get all future-dated income (remaining paychecks this month)
      const today = now.toISOString().slice(0, 10);
      const futureIncomeStmt = db.prepare('SELECT SUM(amount) as futureIncome FROM transactions WHERE date > ? AND date <= ? AND amount > 0');
      const futureIncomeResult = futureIncomeStmt.get(today, lastDay);
      const futureIncome = futureIncomeResult.futureIncome || 0;
      // Get all future-dated bills (remaining expenses this month)
      const futureBillsStmt = db.prepare('SELECT SUM(amount) as futureBills FROM transactions WHERE date > ? AND date <= ? AND amount < 0');
      const futureBillsResult = futureBillsStmt.get(today, lastDay);
      const futureBills = Math.abs(futureBillsResult.futureBills || 0);
      // Estimate variable spending for rest of month (spending velocity * days left)
      const daysInMonth = new Date(year, month, 0).getDate();
      const currentDay = now.getDate();
      const daysLeft = daysInMonth - currentDay;
      // Calculate average daily spending so far
      const daysElapsed = currentDay;
      const avgDailySpending = daysElapsed > 0 ? totalExpenses / daysElapsed : 0;
      const projectedVariableSpending = Math.round(avgDailySpending * daysLeft);
      // Projected end-of-month balance calculation
      const projectedBalance = availableBalance + futureIncome - futureBills - projectedVariableSpending;
      // Health status
      let status = 'healthy';
      if (projectedBalance < 0) status = 'critical';
      else if (projectedBalance < 200) status = 'warning';
      else if (projectedBalance < 500) status = 'caution';
      // Insights
      let insight = '';
      if (status === 'critical') insight = 'Warning: You are projected to run out of money by month end.';
      else if (status === 'warning') insight = 'Caution: Your projected balance is very low. Consider reducing spending.';
      else if (status === 'caution') insight = 'Monitor your spending to avoid a negative balance.';
      else insight = 'You are on track for a healthy month.';
      db.close();
      const result = {
        projectedBalance,
        status,
        insight,
        breakdown: {
          availableBalance,
          futureIncome,
          futureBills,
          projectedVariableSpending,
          daysLeft,
          avgDailySpending,
          totalIncome,
          totalExpenses
        }
      };
      console.log('[IPC] Projected balance result:', result);
      return result;
    } catch (err) {
      console.error('[IPC] Error in get-projected-end-of-month-balance:', err);
      return { error: err.message };
    }
  });
  ipcMain.handle('get-spending-velocity', async () => {
    try {
      const path = require('path');
      const fs = require('fs');
      const os = require('os');
      const Database = require('better-sqlite3');
      const appName = 'Financial Assistance App';
      const userDataDir = path.join(os.homedir(), 'AppData', 'Roaming', appName);
      const userDbPath = path.join(userDataDir, 'data.db');
      const packagedDbPath = path.join(__dirname, '../../assets/data.db');
      if (!fs.existsSync(userDataDir)) {
        fs.mkdirSync(userDataDir, { recursive: true });
      }
      if (!fs.existsSync(userDbPath)) {
        fs.copyFileSync(packagedDbPath, userDbPath);
      }
      const db = new Database(userDbPath, { readonly: true });
      // Get the first and last day of the current month
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const firstDay = `${year}-${month.toString().padStart(2, '0')}-01`;
      const lastDay = `${year}-${month.toString().padStart(2, '0')}-31`;
      // Sum all negative (spending) transactions for this month
      const stmt = db.prepare(`SELECT SUM(amount) as totalSpending FROM transactions WHERE date >= ? AND date <= ? AND amount < 0`);
      const result = stmt.get(firstDay, lastDay);
      // Calculate days elapsed in current month (including today)
      const daysElapsed = now.getDate();
      const avgDailySpending = daysElapsed > 0 ? Math.abs((result.totalSpending || 0) / daysElapsed) : 0;
      db.close();
      return { spendingVelocity: avgDailySpending };
    } catch (err) {
      return { error: err.message };
    }
  });
  const path = require('path');
  const fs = require('fs');
  const os = require('os');
  const Database = require('better-sqlite3');
  const appName = 'Financial Assistance App';
  const userDataDir = path.join(os.homedir(), 'AppData', 'Roaming', appName);
  const userDbPath = path.join(userDataDir, 'data.db');
  const packagedDbPath = path.join(__dirname, '../../assets/data.db');
  if (!fs.existsSync(userDataDir)) {
    fs.mkdirSync(userDataDir, { recursive: true });
  }
  if (!fs.existsSync(userDbPath)) {
    fs.copyFileSync(packagedDbPath, userDbPath);
  }
  ipcMain.handle('get-accounts-data', async () => {
    try {
      const db = new Database(userDbPath, { readonly: true });
      const rows = db.prepare('SELECT * FROM accounts').all();
      db.close();
      return rows;
    } catch (err) {
      return { error: err.message };
    }
  });
  ipcMain.on('restart-to-install', () => {
    autoUpdater.quitAndInstall();
  });
  ipcMain.on('renderer-to-main', (event, arg) => {
    console.log('Received from renderer:', arg);
    event.reply('main-to-renderer', 'Message received by main process');
  });
  ipcMain.on('check-for-updates', (event) => {
    autoUpdater.checkForUpdates();
    event.reply('update-status', { status: 'checking', message: 'Checking for updates...' });
  });
  ipcMain.on('download-update', (event) => {
    autoUpdater.downloadUpdate();
    event.reply('update-status', { status: 'downloading', message: 'Downloading update...' });
  });
  autoUpdater.on('update-available', (info) => {
    BrowserWindow.getAllWindows().forEach(win => {
      win.webContents.send('update-status', { status: 'available', message: 'A new update is available!' });
    });
  });
  autoUpdater.on('update-not-available', (info) => {
    BrowserWindow.getAllWindows().forEach(win => {
      win.webContents.send('update-status', { status: 'up-to-date', message: 'You are up to date.' });
    });
  });
  autoUpdater.on('download-progress', (progress) => {
    BrowserWindow.getAllWindows().forEach(win => {
      win.webContents.send('update-status', { status: 'downloading', message: `Downloading update... (${Math.round(progress.percent)}%)` });
    });
  });
  autoUpdater.on('update-downloaded', (info) => {
    BrowserWindow.getAllWindows().forEach(win => {
      win.webContents.send('update-status', { status: 'downloaded', message: 'Update downloaded. Restart to install.' });
    });
  });
  autoUpdater.on('error', (err) => {
    BrowserWindow.getAllWindows().forEach(win => {
      win.webContents.send('update-status', { status: 'error', message: err == null ? 'unknown' : (err.stack || err).toString() });
    });
  });
}

module.exports = { setupIPC };
