
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

function getBalances(db) {
  // Returns array of account balances
  const accounts = db.prepare('SELECT * FROM accounts').all();
  return accounts.map(acc => ({ id: acc.id, name: acc.name, type: acc.type, balance: acc.balance }));
}

function getTotalIncome(db, firstDay, lastDay) {
  // Returns total income for the given period
  const incomeStmt = db.prepare('SELECT SUM(amount) as totalIncome FROM transactions WHERE date >= ? AND date <= ? AND amount > 0');
  const incomeResult = incomeStmt.get(firstDay, lastDay);
  return incomeResult.totalIncome || 0;
}

function getTotalExpenses(db, firstDay, lastDay) {
  // Returns total expenses for the given period
  const expenseStmt = db.prepare('SELECT SUM(amount) as totalExpenses FROM transactions WHERE date >= ? AND date <= ? AND amount < 0');
  const expenseResult = expenseStmt.get(firstDay, lastDay);
  return Math.abs(expenseResult.totalExpenses || 0);
}

function getTrends(db, now, months = 6) {
  // Returns array of income/expenses for last N months
  const trends = [];
  const year = now.getFullYear();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(year, now.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const start = `${y}-${m.toString().padStart(2, '0')}-01`;
    const end = `${y}-${m.toString().padStart(2, '0')}-31`;
    const inc = db.prepare('SELECT SUM(amount) as inc FROM transactions WHERE date >= ? AND date <= ? AND amount > 0').get(start, end).inc || 0;
    const exp = Math.abs(db.prepare('SELECT SUM(amount) as exp FROM transactions WHERE date >= ? AND date <= ? AND amount < 0').get(start, end).exp || 0);
    trends.push({ month: `${y}-${m.toString().padStart(2, '0')}`, income: inc, expenses: exp });
  }
  return trends;
}

function getRecommendations(totalIncome, totalExpenses) {
  // Returns array of recommendations based on income/expenses
  const recommendations = [];
  // Calculate spending ratio
  const spendingRatio = totalIncome > 0 ? totalExpenses / totalIncome : 1;
  // Priority assignment logic
  if (totalIncome === 0) {
    recommendations.push({
      title: 'No Income Detected',
      message: 'No income has been recorded for this month. Add your income sources to get accurate recommendations.',
      priority: 'Critical',
      impact: 'High',
      timeline: 'Immediate',
      impactEstimate: 0,
      actions: ['Add your income sources in the Income section.']
    });
  } else if (totalIncome < totalExpenses) {
    recommendations.push({
      title: 'Spending Exceeds Income',
      message: 'Your expenses are higher than your income this month. Consider reducing discretionary spending.',
      priority: 'Critical',
      impact: 'High',
      timeline: 'Immediate',
      impactEstimate: totalExpenses - totalIncome,
      actions: ['Review your largest expense categories.', 'Set a budget for next month.']
    });
  } else if (spendingRatio > 0.95) {
    recommendations.push({
      title: 'Severe Budget Risk',
      message: 'You are spending more than 95% of your income. Immediate action is required to avoid overdraft.',
      priority: 'Urgent',
      impact: 'High',
      timeline: 'Immediate',
      impactEstimate: totalIncome - totalExpenses,
      actions: ['Freeze discretionary spending.', 'Review all upcoming bills.']
    });
  } else if (spendingRatio > 0.85) {
    recommendations.push({
      title: 'High Spending Rate',
      message: 'You are spending more than 85% of your income. Try to save at least 15% if possible.',
      priority: 'High',
      impact: 'Medium',
      timeline: 'This Month',
      impactEstimate: totalIncome * 0.15,
      actions: ['Identify areas to cut back.', 'Automate savings transfers.']
    });
  } else if (spendingRatio > 0.7) {
    recommendations.push({
      title: 'Moderate Spending',
      message: 'You are spending more than 70% of your income. Consider increasing your savings rate if possible.',
      priority: 'Medium',
      impact: 'Medium',
      timeline: 'This Month',
      impactEstimate: totalIncome * 0.3,
      actions: ['Review your savings goals.', 'Look for small expenses to reduce.']
    });
  } else if (spendingRatio > 0.5) {
    recommendations.push({
      title: 'Healthy Spending',
      message: 'Your spending is within a healthy range for your income. Keep up the good work and consider increasing savings.',
      priority: 'Low',
      impact: 'Low',
      timeline: 'Ongoing',
      impactEstimate: totalIncome * 0.5,
      actions: ['Continue monitoring your finances.', 'Increase savings if possible.']
    });
  } else {
    recommendations.push({
      title: 'Excellent Financial Health',
      message: 'Your spending is well below your income. Great job! Consider investing or increasing your savings goals.',
      priority: 'Positive',
      impact: 'Low',
      timeline: 'Ongoing',
      impactEstimate: 0,
      actions: ['Continue your current habits.', 'Review investment opportunities.']
    });
  }
  return recommendations;
}

function setupIPC() {
  // Financial Analysis Engine: Aggregate/analyze user data for recommendations
  ipcMain.handle('get-financial-analysis', async () => {
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
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const firstDay = `${year}-${month.toString().padStart(2, '0')}-01`;
      const lastDay = `${year}-${month.toString().padStart(2, '0')}-31`;

      // Modular aggregation
      const balances = getBalances(db);
      const totalIncome = getTotalIncome(db, firstDay, lastDay);
      const totalExpenses = getTotalExpenses(db, firstDay, lastDay);
      const trends = getTrends(db, now, 6);
      const recommendations = getRecommendations(totalIncome, totalExpenses);

      db.close();
      return {
        balances,
        totalIncome,
        totalExpenses,
        trends,
        recommendations
      };
    } catch (err) {
      return { error: err.message };
    }
  });
  // Money Left Per Day Calculator
    ipcMain.handle('get-money-left-per-day', async () => {
      // Returns: { safeToSpend, daysLeft, perDay, alert }
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
      // Available balance = sum of all account balances (checking + savings)
      const availableBalance = accounts
        .filter(acc => acc.type === 'Checking' || acc.type === 'Savings')
        .reduce((sum, acc) => sum + acc.balance, 0);
      // Remaining safe-to-spend = available balance (or income - expenses if more accurate)
      const safeToSpend = availableBalance;
      // Days left in month (including today)
      const today = now.getDate();
      const daysInMonth = new Date(year, month, 0).getDate();
      const daysLeft = daysInMonth - today + 1;
      // Money left per day
      const moneyLeftPerDay = daysLeft > 0 ? safeToSpend / daysLeft : 0;
      // Month-to-date spending (already spent)
      const daysElapsed = today;
      const avgSpentPerDay = daysElapsed > 0 ? totalExpenses / daysElapsed : 0;
      // Alert if average spent per day > money left per day
      const alert = avgSpentPerDay > moneyLeftPerDay;
      db.close();
      return {
        safeToSpend,
        daysLeft,
        moneyLeftPerDay,
        avgSpentPerDay,
        alert
      };
    } catch (err) {
      return { error: err.message };
    }
  });
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


// Spending Pattern Alerts (4-6 months analysis)
ipcMain.handle('get-spending-pattern-alerts', async (event, months = 6) => {
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
    // Get all transactions for the last N months
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
    const startStr = startDate.toISOString().slice(0, 10);
    const rows = db.prepare(`SELECT date, amount, category FROM transactions WHERE date >= ? AND amount < 0`).all(startStr);
    db.close();
    // Group by category and week number
    const byCategory = {};
    for (const tx of rows) {
      const d = new Date(tx.date);
      const year = d.getFullYear();
      const month = d.getMonth();
      // Week of month (1-5)
      const week = Math.floor((d.getDate() - 1) / 7) + 1;
      const cat = tx.category || 'Uncategorized';
      if (!byCategory[cat]) byCategory[cat] = { weeks: {}, months: {} };
      // By week
      const weekKey = `${year}-${(month+1).toString().padStart(2,'0')}-W${week}`;
      if (!byCategory[cat].weeks[weekKey]) byCategory[cat].weeks[weekKey] = 0;
      byCategory[cat].weeks[weekKey] += Math.abs(tx.amount);
      // By month
      const monthKey = `${year}-${(month+1).toString().padStart(2,'0')}`;
      if (!byCategory[cat].months[monthKey]) byCategory[cat].months[monthKey] = 0;
      byCategory[cat].months[monthKey] += Math.abs(tx.amount);
    }
    // Analyze for current week and month
    const alerts = [];
    const today = new Date();
    const thisYear = today.getFullYear();
    const thisMonth = today.getMonth() + 1;
    const thisMonthKey = `${thisYear}-${thisMonth.toString().padStart(2,'0')}`;
    const thisWeek = Math.floor((today.getDate() - 1) / 7) + 1;
    const thisWeekKey = `${thisYear}-${thisMonth.toString().padStart(2,'0')}-W${thisWeek}`;
    for (const [cat, data] of Object.entries(byCategory)) {
      // --- Weekly pattern ---
      const weekVals = Object.entries(data.weeks)
        .filter(([k]) => k !== thisWeekKey)
        .map(([,v]) => v);
      const weekAvg = weekVals.length ? weekVals.reduce((a,b)=>a+b,0)/weekVals.length : 0;
      const thisWeekSpend = data.weeks[thisWeekKey] || 0;
      if (weekAvg > 0) {
        const diff = thisWeekSpend - weekAvg;
        const pct = diff / weekAvg;
        if (Math.abs(pct) >= 0.3) {
          // Assign priority based on severity and direction
          let priority = 'Medium';
          if (pct > 0.7) priority = 'Critical';
          else if (pct > 0.5) priority = 'Urgent';
          else if (pct > 0.3) priority = 'High';
          else if (pct < -0.7) priority = 'Positive';
          else if (pct < -0.5) priority = 'Positive';
          else if (pct < -0.3) priority = 'Positive';
          else priority = 'Medium';
          alerts.push({
            category: cat,
            period: 'week',
            current: thisWeekSpend,
            average: weekAvg,
            variance: pct,
            severity: Math.abs(pct) > 0.5 ? 'High' : 'Medium',
            priority,
            positive: pct < 0,
            message: pct > 0
              ? `Spending in ${cat} is ${Math.round(pct*100)}% higher than usual this week.`
              : `Spending in ${cat} is ${Math.abs(Math.round(pct*100))}% lower than usual this week. Great job!`,
            recommendation: pct > 0
              ? `Consider reviewing your ${cat} spending for possible savings.`
              : `Keep up the good work controlling your ${cat} spending.`
          });
        }
      }
      // --- Monthly pattern ---
      const monthVals = Object.entries(data.months)
        .filter(([k]) => k !== thisMonthKey)
        .map(([,v]) => v);
      const monthAvg = monthVals.length ? monthVals.reduce((a,b)=>a+b,0)/monthVals.length : 0;
      const thisMonthSpend = data.months[thisMonthKey] || 0;
      if (monthAvg > 0) {
        const diff = thisMonthSpend - monthAvg;
        const pct = diff / monthAvg;
        if (Math.abs(pct) >= 0.3) {
          let priority = 'Medium';
          if (pct > 0.7) priority = 'Critical';
          else if (pct > 0.5) priority = 'Urgent';
          else if (pct > 0.3) priority = 'High';
          else if (pct < -0.7) priority = 'Positive';
          else if (pct < -0.5) priority = 'Positive';
          else if (pct < -0.3) priority = 'Positive';
          else priority = 'Medium';
          alerts.push({
            category: cat,
            period: 'month',
            current: thisMonthSpend,
            average: monthAvg,
            variance: pct,
            severity: Math.abs(pct) > 0.5 ? 'High' : 'Medium',
            priority,
            positive: pct < 0,
            message: pct > 0
              ? `Spending in ${cat} is ${Math.round(pct*100)}% higher than usual this month.`
              : `Spending in ${cat} is ${Math.abs(Math.round(pct*100))}% lower than usual this month. Great job!`,
            recommendation: pct > 0
              ? `Review your ${cat} expenses for possible savings opportunities.`
              : `Excellent! Keep your ${cat} spending in check.`
          });
        }
      }
    }
    return { alerts };
  } catch (err) {
    return { error: err.message };
  }
});

module.exports = { setupIPC };
