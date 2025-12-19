
const { ipcMain, BrowserWindow } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs = require('fs');
const os = require('os');
const Database = require('better-sqlite3');

// --- Financial Goals Table Migration ---
function migrateGoalsTable(db) {
  const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='goals';").get();
  if (!tableExists) {
    db.prepare(`CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL, -- 'savings', 'debt', 'life', etc.
      target_amount REAL NOT NULL,
      current_amount REAL NOT NULL DEFAULT 0,
      start_date TEXT NOT NULL,
      target_date TEXT,
      notes TEXT
    );`).run();
    // Insert example/test goals (for migration)
    const insert = db.prepare('INSERT INTO goals (name, type, target_amount, current_amount, start_date, target_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)');
    insert.run('Emergency Fund', 'savings', 9000, 1200, '2025-01-01', '2026-01-01', '3-6 months of expenses');
    insert.run('Pay Off Credit Card', 'debt', 3500, 500, '2025-06-01', '2026-06-01', 'High interest, pay ASAP');
    insert.run('Vacation Fund', 'savings', 2500, 400, '2025-03-01', '2025-12-01', 'Family trip to the beach');
  }
}

// --- Income Sources Table Migration ---
function migrateIncomeSourcesTable(db) {
  const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='income_sources';").get();
  if (!tableExists) {
    db.prepare(`CREATE TABLE IF NOT EXISTS income_sources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL, -- 'salary', 'freelance', 'investment', etc.
      earner TEXT,
      frequency TEXT NOT NULL, -- 'weekly', 'bi-weekly', 'monthly', 'annual'
      expected_amount REAL NOT NULL,
      notes TEXT
    );`).run();
    // Insert example/test income sources (for migration)
    const insert = db.prepare('INSERT INTO income_sources (name, type, earner, frequency, expected_amount, notes) VALUES (?, ?, ?, ?, ?, ?)');
    insert.run('Primary Salary', 'salary', 'Alex', 'bi-weekly', 1800, 'Main household earner');
    insert.run('Secondary Salary', 'salary', 'Jamie', 'monthly', 1200, 'Second earner');
    insert.run('Freelance Work', 'freelance', 'Alex', 'monthly', 400, 'Side income');
  }
}

// --- Debts Table Migration ---
function migrateDebtsTable(db) {
  const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='debts';").get();
  if (!tableExists) {
    db.prepare(`CREATE TABLE IF NOT EXISTS debts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL, -- 'credit card', 'loan', etc.
      balance REAL NOT NULL,
      apr REAL NOT NULL,
      min_payment REAL NOT NULL,
      due_date TEXT,
      notes TEXT
    );`).run();
    // Insert example/test debts (for migration)
    const insert = db.prepare('INSERT INTO debts (name, type, balance, apr, min_payment, due_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)');
    insert.run('Visa Card', 'credit card', 3200, 22.99, 85, '2025-12-25', 'Main family credit card');
    insert.run('Auto Loan', 'loan', 7800, 5.5, 250, '2025-12-20', 'Car loan, 36 months left');
  }
}

// Handler to get financial wisdom & tips (rules, seasonal advice)
ipcMain.handle('get-wisdom-tips', async (event) => {
  try {
    const appName = 'Financial Assistance App';
    const userDataDir = path.join(os.homedir(), 'AppData', 'Roaming', appName);
    const userDbPath = path.join(userDataDir, 'data.db');
    const packagedDbPath = path.join(__dirname, '../../assets/data.db');

    // Ensure userDbPath exists: if not, copy from packagedDbPath
    if (!fs.existsSync(userDbPath)) {
      fs.mkdirSync(userDataDir, { recursive: true });
      if (fs.existsSync(packagedDbPath)) {
        fs.copyFileSync(packagedDbPath, userDbPath);
        console.log('[DB MIGRATION] Copied data.db to userData directory:', userDbPath);
      } else {
        console.error('[DB MIGRATION] Packaged data.db not found:', packagedDbPath);
      }
    }

    // --- Wisdom Tips Table Migration ---
    // Ensure wisdom_tips table exists in userDbPath, create and populate if missing
    const migrateWisdomTipsTable = (db) => {
      const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='wisdom_tips';").get();
      if (!tableExists) {
        db.prepare(`CREATE TABLE IF NOT EXISTS wisdom_tips (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          message TEXT NOT NULL,
          type TEXT,
          season TEXT,
          month INTEGER
        );`).run();
        // Insert test data (id will auto-increment)
        const tips = [
          { message: 'Always pay yourself first: set aside savings before spending on anything else.', type: 'rule', season: null, month: null },
          { message: 'Review your insurance coverage at the start of each year to ensure adequate protection.', type: 'seasonal', season: 'Winter', month: 1 },
          { message: 'Plan for holiday expenses early in the fall to avoid debt in December.', type: 'seasonal', season: 'Fall', month: 10 },
          { message: 'Check your credit report every spring to catch errors or fraud.', type: 'seasonal', season: 'Spring', month: 4 },
          { message: 'Summer is a great time to review your utility bills and look for ways to save on energy.', type: 'seasonal', season: 'Summer', month: 7 },
          { message: 'Automate bill payments to avoid late fees and protect your credit score.', type: 'rule', season: null, month: null },
          { message: 'Track every dollar you spend for one month to discover hidden leaks in your budget.', type: 'rule', season: null, month: null },
          { message: 'Set a realistic grocery budget and stick to it, especially during back-to-school season.', type: 'seasonal', season: 'Fall', month: 9 },
          { message: 'Start a holiday savings fund in January to spread out costs.', type: 'seasonal', season: 'Winter', month: 1 },
          { message: 'Revisit your financial goals at mid-year to stay on track.', type: 'seasonal', season: 'Summer', month: 6 },
        ];
        const insert = db.prepare('INSERT INTO wisdom_tips (message, type, season, month) VALUES (@message, @type, @season, @month)');
        const insertMany = db.transaction((tips) => {
          for (const tip of tips) insert.run(tip);
        });
        insertMany(tips);
      }
    };

    // Ensure wisdom_tips table exists in both user and packaged DBs (for dev/packaged scenarios)
    try {
      const Database = require('better-sqlite3');
      const userDb = new Database(userDbPath);
      migrateWisdomTipsTable(userDb);
      migrateGoalsTable(userDb);
      migrateDebtsTable(userDb);
        migrateIncomeSourcesTable(userDb);
      userDb.close();
    } catch (e) {
      // Log but don't crash
      console.error('Could not migrate wisdom_tips table in userDbPath:', e);
    }
    try {
      const Database = require('better-sqlite3');
      const packagedDb = new Database(packagedDbPath);
      migrateWisdomTipsTable(packagedDb);
      migrateGoalsTable(packagedDb);
      migrateDebtsTable(packagedDb);
        migrateIncomeSourcesTable(packagedDb);
      packagedDb.close();
    } catch (e) {
      // Log but don't crash
      console.error('Could not migrate wisdom_tips table in packagedDbPath:', e);
    }

  // --- Income Sources IPC Handlers ---
  ipcMain.handle('get-income-sources', async () => {
    try {
      const db = new Database(userDbPath);
      const rows = db.prepare('SELECT * FROM income_sources').all();
      db.close();
      return rows;
    } catch (e) {
      return { error: e.message };
    }
  });

  ipcMain.handle('add-income-source', async (event, source) => {
    try {
      const db = new Database(userDbPath);
      const stmt = db.prepare('INSERT INTO income_sources (name, type, earner, frequency, expected_amount, notes) VALUES (?, ?, ?, ?, ?, ?)');
      const info = stmt.run(source.name, source.type, source.earner, source.frequency, source.expected_amount, source.notes);
      db.close();
      return { id: info.lastInsertRowid };
    } catch (e) {
      return { error: e.message };
    }
  });

  ipcMain.handle('update-income-source', async (event, source) => {
    try {
      const db = new Database(userDbPath);
      const stmt = db.prepare('UPDATE income_sources SET name = ?, type = ?, earner = ?, frequency = ?, expected_amount = ?, notes = ? WHERE id = ?');
      stmt.run(source.name, source.type, source.earner, source.frequency, source.expected_amount, source.notes, source.id);
      db.close();
      return { success: true };
    } catch (e) {
      return { error: e.message };
    }
  });

  ipcMain.handle('delete-income-source', async (event, id) => {
    try {
      const db = new Database(userDbPath);
      const stmt = db.prepare('DELETE FROM income_sources WHERE id = ?');
      stmt.run(id);
      db.close();
      return { success: true };
    } catch (e) {
      return { error: e.message };
    }
  });
      const dbPath = path.join(__dirname, '../../assets/data.db');
      const db = new Database(dbPath);
      const stmt = db.prepare('DELETE FROM income_sources WHERE id = ?');
      stmt.run(id);
      db.close();
      return { success: true };
    } catch (e) {
      return { error: e.message };
    }
  });
    // --- Debt Management IPC Handlers ---
    // Get all debts
    ipcMain.handle('get-debts', async () => {
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
        const stmt = db.prepare('SELECT * FROM debts');
        const debts = stmt.all();
        db.close();
        return { debts };
      } catch (err) {
        return { error: err.message };
      }
    });

    // Add a new debt
    ipcMain.handle('add-debt', async (event, debt) => {
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
        const db = new Database(userDbPath);
        const insert = db.prepare('INSERT INTO debts (name, type, balance, apr, min_payment, due_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)');
        const result = insert.run(debt.name, debt.type, debt.balance, debt.apr, debt.min_payment, debt.due_date, debt.notes);
        db.close();
        return { id: result.lastInsertRowid };
      } catch (err) {
        return { error: err.message };
      }
    });

    // Update a debt
    ipcMain.handle('update-debt', async (event, { id, ...fields }) => {
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
        const db = new Database(userDbPath);
        const keys = Object.keys(fields);
        const setClause = keys.map(k => `${k} = ?`).join(', ');
        const values = keys.map(k => fields[k]);
        values.push(id);
        const update = db.prepare(`UPDATE debts SET ${setClause} WHERE id = ?`);
        update.run(...values);
        db.close();
        return { success: true };
      } catch (err) {
        return { error: err.message };
      }
    });

    // Delete a debt
    ipcMain.handle('delete-debt', async (event, id) => {
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
        const db = new Database(userDbPath);
        const del = db.prepare('DELETE FROM debts WHERE id = ?');
        del.run(id);
        db.close();
        return { success: true };
      } catch (err) {
        return { error: err.message };
      }
    });

    // Calculate payoff and interest savings for a debt
    ipcMain.handle('calculate-debt-payoff', async (event, { balance, apr, min_payment, extra_payment = 0 }) => {
      try {
        // Simple payoff calculation (amortization)
        let months = 0;
        let totalInterest = 0;
        let currentBalance = balance;
        const monthlyRate = apr / 100 / 12;
        const payment = min_payment + extra_payment;
        if (payment <= currentBalance * monthlyRate) {
          return { error: 'Payment too low to cover interest.' };
        }
        while (currentBalance > 0 && months < 600) { // 50 years max
          const interest = currentBalance * monthlyRate;
          totalInterest += interest;
          currentBalance = currentBalance + interest - payment;
          if (currentBalance < 0) currentBalance = 0;
          months++;
        }
        return { months, totalInterest: Number(totalInterest.toFixed(2)) };
      } catch (err) {
        return { error: err.message };
      }
    });
    // IPC handler to get all goals
    ipcMain.handle('get-goals', async () => {
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
        const stmt = db.prepare('SELECT * FROM goals');
        const goals = stmt.all();
        db.close();
        return { goals };
      } catch (err) {
        return { error: err.message };
      }
    });

    // IPC handler to add a new goal
    ipcMain.handle('add-goal', async (event, goal) => {
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
        const db = new Database(userDbPath);
        const insert = db.prepare('INSERT INTO goals (name, type, target_amount, current_amount, start_date, target_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)');
        const result = insert.run(goal.name, goal.type, goal.target_amount, goal.current_amount, goal.start_date, goal.target_date, goal.notes);
        db.close();
        return { id: result.lastInsertRowid };
      } catch (err) {
        return { error: err.message };
      }
    });

    // IPC handler to update a goal's progress
    ipcMain.handle('update-goal-progress', async (event, { id, current_amount }) => {
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
        const db = new Database(userDbPath);
        const update = db.prepare('UPDATE goals SET current_amount = ? WHERE id = ?');
        update.run(current_amount, id);
        db.close();
        return { success: true };
      } catch (err) {
        return { error: err.message };
      }
    });

    // IPC handler to calculate timeline projection for a goal
    ipcMain.handle('get-goal-projection', async (event, goalId) => {
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
        const goal = db.prepare('SELECT * FROM goals WHERE id = ?').get(goalId);
        if (!goal) {
          db.close();
          return { error: 'Goal not found' };
        }
        // Estimate monthly contribution rate (simple: (current_amount - start_amount) / months elapsed)
        const start = new Date(goal.start_date);
        const now = new Date();
        const monthsElapsed = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
        let monthlyRate = 0;
        if (monthsElapsed > 0) {
          monthlyRate = (goal.current_amount) / monthsElapsed;
        }
        // Projected months to completion
        const remaining = goal.target_amount - goal.current_amount;
        let monthsToComplete = null;
        let projectedDate = null;
        if (monthlyRate > 0) {
          monthsToComplete = Math.ceil(remaining / monthlyRate);
          const projected = new Date(now);
          projected.setMonth(projected.getMonth() + monthsToComplete);
          projectedDate = projected.toISOString().slice(0, 10);
        }
        db.close();
        return {
          goalId,
          monthlyRate,
          monthsToComplete,
          projectedDate,
          remaining
        };
      } catch (err) {
        return { error: err.message };
      }
    });
    if (!fs.existsSync(userDataDir)) {
      fs.mkdirSync(userDataDir, { recursive: true });
    }
    if (!fs.existsSync(userDbPath)) {
      fs.copyFileSync(packagedDbPath, userDbPath);
    }
    const db = new Database(userDbPath, { readonly: true });
    // Get current month and season
    const now = new Date();
    const month = now.getMonth() + 1;
    const seasons = [
      { name: 'Winter', months: [12, 1, 2] },
      { name: 'Spring', months: [3, 4, 5] },
      { name: 'Summer', months: [6, 7, 8] },
      { name: 'Fall', months: [9, 10, 11] }
    ];
    const season = seasons.find(s => s.months.includes(month))?.name;
    // Query for rules (always show) and relevant seasonal tips
    const stmt = db.prepare(`SELECT * FROM wisdom_tips WHERE type = 'rule' OR (type = 'seasonal' AND (season = ? OR month = ?))`);
    const tips = stmt.all(season, month);
    db.close();
    return { tips };
  } catch (err) {
    return { error: err.message };
  }
});

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

function getRecommendations(db, totalIncome, totalExpenses, balances, now) {
  // Returns array of recommendations based on income/expenses, balances, bills, and velocity
  const recommendations = [];

  // --- Data Completeness Tracking ---
  // Check for missing core data: accounts, income, bills, savings, goals
  const missing = [];
  // Accounts
  const accountCount = balances.length;
  if (accountCount === 0) missing.push('Add at least one account (Checking, Savings, Credit Card, or Loan)');
  // Income
  const incomeRows = db.prepare('SELECT COUNT(*) as cnt FROM transactions WHERE amount > 0').get();
  if (incomeRows.cnt === 0) missing.push('Add at least one income source');
  // Bills
  const billRows = db.prepare('SELECT COUNT(*) as cnt FROM transactions WHERE amount < 0').get();
  if (billRows.cnt === 0) missing.push('Add at least one bill or expense');
  // Savings
  const savingsAccounts = balances.filter(acc => acc.type === 'Savings');
  if (savingsAccounts.length === 0) missing.push('Add a savings account');
  // Goals
  let goalsCount = 0;
  try {
    const goals = db.prepare('SELECT COUNT(*) as cnt FROM goals').get();
    goalsCount = goals.cnt;
  } catch (e) {
    // Table may not exist yet
  }
  if (goalsCount === 0) missing.push('Set up at least one financial goal');
  if (missing.length > 0) {
    recommendations.push({
      title: 'Complete Your Profile',
      message: 'Some important information is missing. Complete your profile for the best recommendations.',
      priority: 'Critical',
      impact: 'High',
      timeline: 'Immediate',
      impactEstimate: 0,
      actions: missing
    });
  }
    // --- Account Diversification Suggestions ---
    // Analyze account types: Checking, Savings, Credit Card, Loan, Retirement, Investment
    const accountTypes = balances.map(acc => acc.type);
    const hasChecking = accountTypes.includes('Checking');
    const hasSavings = accountTypes.includes('Savings');
    const hasRetirement = accountTypes.some(type => type.toLowerCase().includes('retirement'));
    const hasInvestment = accountTypes.some(type => type.toLowerCase().includes('investment'));

    // Suggest adding missing core accounts
    if (!hasChecking) {
      recommendations.push({
        title: 'Add a Checking Account',
        message: 'A checking account is essential for managing daily transactions and bill payments. Consider adding one for better money management.',
        priority: 'High',
        impact: 'High',
        timeline: 'Immediate',
        impactEstimate: 0,
        actions: ['Open a checking account at your preferred bank.']
      });
    }
    if (!hasSavings) {
      recommendations.push({
        title: 'Add a Savings Account',
        message: 'A savings account helps you set aside money for emergencies and future goals. Consider opening a high-yield savings account.',
        priority: 'High',
        impact: 'High',
        timeline: 'Immediate',
        impactEstimate: 0,
        actions: ['Open a high-yield savings account.', 'Set up automatic transfers from checking.']
      });
    }
    if (!hasRetirement) {
      recommendations.push({
        title: 'Add a Retirement Account',
        message: 'Retirement accounts (like 401k or IRA) are important for long-term financial security. Consider adding one to start saving for retirement.',
        priority: 'Medium',
        impact: 'High',
        timeline: 'This Year',
        impactEstimate: 0,
        actions: ['Open a retirement account (401k, IRA, etc.).', 'Contribute regularly for long-term growth.']
      });
    }
    if (!hasInvestment) {
      recommendations.push({
        title: 'Add an Investment Account',
        message: 'Investment accounts can help grow your wealth over time. Consider opening a brokerage or investment account to diversify your assets.',
        priority: 'Medium',
        impact: 'Medium',
        timeline: 'This Year',
        impactEstimate: 0,
        actions: ['Open a brokerage or investment account.', 'Research low-cost index funds or ETFs.']
      });
    }
  const spendingRatio = totalIncome > 0 ? totalExpenses / totalIncome : 1;
  // Overdraft/insufficient funds check
  const availableBalance = balances.filter(acc => acc.type === 'Checking' || acc.type === 'Savings').reduce((sum, acc) => sum + acc.balance, 0);
  // 1. Overdraft prevention (projected negative balance)
  if (availableBalance < 0) {
    recommendations.push({
      title: 'Overdraft Risk',
      message: 'Your available balance is negative. Immediate action is required to avoid overdraft fees.',
      priority: 'Critical',
      impact: 'High',
      timeline: 'Immediate',
      impactEstimate: availableBalance,
      actions: ['Transfer funds to checking.', 'Reduce spending immediately.', 'Contact your bank if needed.']
    });
  } else if (availableBalance < 100) {
    recommendations.push({
      title: 'Low Balance Warning',
      message: 'Your available balance is very low. Monitor your spending to avoid overdraft.',
      priority: 'High',
      impact: 'Medium',
      timeline: 'This Week',
      impactEstimate: availableBalance,
      actions: ['Delay non-essential purchases.', 'Review upcoming bills.']
    });
  }

  // 2. Insufficient funds for upcoming bills (next 7 days)
  const today = now.toISOString().slice(0, 10);
  const sevenDaysLater = new Date(now);
  sevenDaysLater.setDate(now.getDate() + 7);
  const sevenDaysStr = sevenDaysLater.toISOString().slice(0, 10);
  const bills = db.prepare(`SELECT id, date, amount, category, description, paid, auto_pay FROM transactions WHERE date > ? AND date <= ? AND amount < 0 ORDER BY date ASC`).all(today, sevenDaysStr);
  let totalUpcomingBills = 0;
  let urgentBills = [];
  for (const bill of bills) {
    if (!bill.paid) {
      totalUpcomingBills += Math.abs(bill.amount);
      const dueDate = new Date(bill.date);
      const daysAway = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
      if (daysAway <= 2) urgentBills.push(bill);
    }
  }
  if (totalUpcomingBills > 0 && availableBalance < totalUpcomingBills) {
    recommendations.push({
      title: 'Insufficient Funds for Bills',
      message: `You have $${totalUpcomingBills.toLocaleString(undefined, {minimumFractionDigits:2})} in bills due in the next 7 days, but your available balance is only $${availableBalance.toLocaleString(undefined, {minimumFractionDigits:2})}.`,
      priority: 'Critical',
      impact: 'High',
      timeline: 'Next 7 Days',
      impactEstimate: availableBalance - totalUpcomingBills,
      actions: ['Deposit funds ASAP.', 'Contact billers to request extensions.', 'Prioritize essential bills.']
    });
  }
  // 3. Urgent bill alerts (due in 2 days)
  if (urgentBills.length > 0) {
    urgentBills.forEach(bill => {
      recommendations.push({
        title: `Urgent Bill Due: ${bill.category}`,
        message: `A bill for $${Math.abs(bill.amount).toLocaleString(undefined, {minimumFractionDigits:2})} (${bill.description}) is due on ${bill.date}.`,
        priority: 'Urgent',
        impact: 'High',
        timeline: 'Within 2 Days',
        impactEstimate: bill.amount,
        actions: ['Pay this bill immediately.', 'Set up auto-pay if possible.']
      });
    });
  }

  // 4. Autopay Optimization Recommendation
  // Find recurring, unpaid, non-autopay bills
  const recurringBills = db.prepare(`SELECT id, date, amount, category, description, paid, auto_pay, recurrence FROM transactions WHERE amount < 0 AND recurrence IS NOT NULL AND recurrence != '' AND (auto_pay IS NULL OR auto_pay = 0) AND (paid IS NULL OR paid = 0)`).all();
  if (recurringBills.length > 0) {
    const billList = recurringBills.map(bill => `${bill.category}: ${bill.description} ($${Math.abs(bill.amount).toLocaleString(undefined, {minimumFractionDigits:2})})`).join(', ');
    recommendations.push({
      title: 'Optimize Bill Payments with Autopay',
      message: `You have ${recurringBills.length} recurring bill(s) not set to autopay: ${billList}. Setting up autopay for these can help avoid late fees and missed payments.`,
      priority: 'High',
      impact: 'Medium',
      timeline: 'This Month',
      impactEstimate: 0,
      actions: ['Review these bills and enable autopay for those you trust.', 'Set reminders to monitor your account for successful payments.']
    });
  }

  // 5. Spending velocity and budget overrun
  // Calculate average daily spending so far this month
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const firstDay = `${year}-${month.toString().padStart(2, '0')}-01`;
  const lastDay = `${year}-${month.toString().padStart(2, '0')}-31`;
  const daysElapsed = now.getDate();
  const avgDailySpending = daysElapsed > 0 ? totalExpenses / daysElapsed : 0;
  const daysInMonth = new Date(year, month, 0).getDate();
  const projectedSpending = avgDailySpending * daysInMonth;
  if (totalIncome > 0 && projectedSpending > totalIncome) {
    recommendations.push({
      title: 'Budget Overrun Projected',
      message: `At your current spending rate ($${avgDailySpending.toLocaleString(undefined, {minimumFractionDigits:2})}/day), you are projected to exceed your income by $${(projectedSpending-totalIncome).toLocaleString(undefined, {minimumFractionDigits:2})} this month.`,
      priority: 'High',
      impact: 'High',
      timeline: 'This Month',
      impactEstimate: projectedSpending - totalIncome,
      actions: ['Reduce discretionary spending.', 'Track your daily expenses.', 'Adjust your budget.']
    });
  }

  // 5. Standard spending ratio recommendations (existing logic)
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
  // Emergency Fund Recommendation
  // Calculate 3-6 months of average expenses
  const expenseHistory = db.prepare('SELECT amount FROM transactions WHERE amount < 0 AND date >= date(?, \'-6 months\')').all(now.toISOString().slice(0, 10));
  const monthlyExpenses = [];
  let monthSum = 0, lastMonth = null;
  for (const row of expenseHistory) {
    // Group by month
    // For simplicity, just sum all expenses in last 6 months
    monthSum += Math.abs(row.amount);
  }
  const avgMonthlyExpenses = expenseHistory.length > 0 ? monthSum / 6 : 0;
  const emergencyFundTarget = avgMonthlyExpenses * 3;
  const savingsBalance = balances.filter(acc => acc.type === 'Savings').reduce((sum, acc) => sum + acc.balance, 0);
  if (savingsBalance < emergencyFundTarget && avgMonthlyExpenses > 0) {
    recommendations.push({
      title: 'Emergency Fund Below Target',
      message: `Your emergency fund is below the recommended 3 months of expenses ($${emergencyFundTarget.toLocaleString(undefined, {minimumFractionDigits:2})}). Try to build your savings for better security.`,
      priority: 'High',
      impact: 'High',
      timeline: 'Ongoing',
      impactEstimate: emergencyFundTarget - savingsBalance,
      actions: ['Set up automatic transfers to savings.', 'Reduce discretionary spending.', 'Review your budget for savings opportunities.']
    });
  }

  // Debt Payoff Recommendation
  // Find credit card or loan accounts with negative balances
  const debtAccounts = balances.filter(acc => (acc.type === 'Credit Card' || acc.type === 'Loan') && acc.balance < 0);
  if (debtAccounts.length > 0) {
    const totalDebt = debtAccounts.reduce((sum, acc) => sum + Math.abs(acc.balance), 0);
    recommendations.push({
      title: 'Debt Payoff Opportunity',
      message: `You have $${totalDebt.toLocaleString(undefined, {minimumFractionDigits:2})} in outstanding debt. Consider making extra payments to reduce interest costs.`,
      priority: 'Medium',
      impact: 'Medium',
      timeline: 'Ongoing',
      impactEstimate: totalDebt,
      actions: ['Make extra payments on high-interest debt.', 'Review your debt payoff plan.', 'Avoid new debt if possible.']
    });
  }

  // Savings Optimization Recommendation
  if (savingsBalance > emergencyFundTarget && totalIncome > 0) {
    recommendations.push({
      title: 'Savings Opportunity',
      message: 'You have savings above your emergency fund target. Consider moving excess funds to a high-yield account or investments.',
      priority: 'Positive',
      impact: 'Low',
      timeline: 'Ongoing',
      impactEstimate: savingsBalance - emergencyFundTarget,
      actions: ['Research high-yield savings accounts.', 'Consider investing for long-term growth.']
    });
  }


  // Enhanced Category Intelligence: Top 5 Spending Categories & Reduction Strategies
  // Find top 5 categories with highest spending this month
  const catRows = db.prepare('SELECT category, SUM(amount) as total FROM transactions WHERE date >= ? AND date <= ? AND amount < 0 GROUP BY category ORDER BY total ASC LIMIT 5').all(firstDay, lastDay);
  const categoryTips = {
    'Groceries': [
      'Try meal planning and shopping with a list.',
      'Buy in bulk for non-perishables.',
      'Use store brands and coupons.'
    ],
    'Dining Out': [
      'Limit restaurant visits to once a week.',
      'Look for happy hour specials or discounts.',
      'Try cooking new recipes at home.'
    ],
    'Entertainment': [
      'Review and cancel unused subscriptions.',
      'Look for free or low-cost local events.',
      'Bundle streaming services or share with family.'
    ],
    'Transportation': [
      'Carpool or use public transit when possible.',
      'Plan trips to reduce fuel usage.',
      'Keep up with vehicle maintenance for efficiency.'
    ],
    'Utilities': [
      'Turn off lights and unplug devices when not in use.',
      'Adjust thermostat for energy savings.',
      'Compare providers for better rates.'
    ],
    'Shopping': [
      'Delay non-essential purchases by 24 hours.',
      'Track sales and use price comparison tools.',
      'Set a monthly shopping budget.'
    ],
    'Other': [
      'Review these expenses for one-time or recurring charges.',
      'See if any can be reduced or eliminated.'
    ]
  };
  for (const cat of catRows) {
    const catName = cat.category || 'Other';
    const tips = categoryTips[catName] || categoryTips['Other'];
    recommendations.push({
      title: `Top Spending Category: ${catName}`,
      message: `You have spent $${Math.abs(cat.total).toLocaleString(undefined, {minimumFractionDigits:2})} on ${catName} this month. Here are some ways to reduce spending in this category:`,
      priority: 'Medium',
      impact: 'Medium',
      timeline: 'This Month',
      impactEstimate: Math.abs(cat.total),
      actions: tips
    });
  }

  // Bill Payment Recommendation (overdue bills)
  const overdueBills = db.prepare('SELECT id, date, amount, category, description FROM transactions WHERE date < ? AND amount < 0 AND paid = 0').all(today);
  for (const bill of overdueBills) {
    recommendations.push({
      title: `Overdue Bill: ${bill.category}`,
      message: `A bill for $${Math.abs(bill.amount).toLocaleString(undefined, {minimumFractionDigits:2})} (${bill.description}) was due on ${bill.date} and is still unpaid.`,
      priority: 'Critical',
      impact: 'High',
      timeline: 'Immediate',
      impactEstimate: Math.abs(bill.amount),
      actions: ['Pay this bill as soon as possible.', 'Contact the biller if you need an extension.']
    });
  }

  // --- Behavioral & Contextual Insights ---
  // 1. Weekend vs. Weekday Spending Habit
  const txRows = db.prepare('SELECT date, amount, category FROM transactions WHERE amount < 0 AND date >= date(?, \'-6 months\')').all(now.toISOString().slice(0, 10));
  let weekendTotal = 0, weekendCount = 0, weekdayTotal = 0, weekdayCount = 0;
  let paydaySpike = 0, paydaySpikeCount = 0, nonPaydayTotal = 0, nonPaydayCount = 0;
  let decSpending = 0, decCount = 0, otherMonthTotal = 0, otherMonthCount = 0;
  let familyGroceryTotal = 0, familyGroceryCount = 0;
  const paydays = db.prepare('SELECT DISTINCT date FROM transactions WHERE amount > 0 AND date >= date(?, \'-6 months\')').all(now.toISOString().slice(0, 10)).map(r => r.date);
  for (const tx of txRows) {
    const d = new Date(tx.date);
    const day = d.getDay(); // 0=Sun, 6=Sat
    if (day === 0 || day === 6) {
      weekendTotal += Math.abs(tx.amount); weekendCount++;
    } else {
      weekdayTotal += Math.abs(tx.amount); weekdayCount++;
    }
    // Time-of-month: spike after payday (within 2 days)
    if (paydays.some(pd => Math.abs((new Date(pd) - d) / (1000*60*60*24)) <= 2)) {
      paydaySpike += Math.abs(tx.amount); paydaySpikeCount++;
    } else {
      nonPaydayTotal += Math.abs(tx.amount); nonPaydayCount++;
    }
    // Seasonal: December spending
    if (d.getMonth() === 11) { decSpending += Math.abs(tx.amount); decCount++; }
    else { otherMonthTotal += Math.abs(tx.amount); otherMonthCount++; }
    // Family: grocery category
    if ((tx.category || '').toLowerCase().includes('grocery')) {
      familyGroceryTotal += Math.abs(tx.amount); familyGroceryCount++;
    }
  }
  // Weekend vs. Weekday
  if (weekendCount > 10 && weekdayCount > 10) {
    const avgWeekend = weekendTotal / weekendCount;
    const avgWeekday = weekdayTotal / weekdayCount;
    if (avgWeekend > avgWeekday * 1.3) {
      recommendations.push({
        title: 'Weekend Spending Habit',
        message: `You typically spend ${Math.round((avgWeekend/avgWeekday-1)*100)}% more on weekends than weekdays. Consider planning ahead to avoid overspending on weekends.`,
        priority: 'Medium',
        impact: 'Medium',
        timeline: 'Recurring',
        impactEstimate: Math.round(avgWeekend - avgWeekday),
        actions: ['Set a weekend budget.', 'Plan low-cost weekend activities.']
      });
    }
  }
  // Payday spike
  if (paydaySpikeCount > 5 && nonPaydayCount > 10) {
    const avgPayday = paydaySpike / paydaySpikeCount;
    const avgNonPayday = nonPaydayTotal / nonPaydayCount;
    if (avgPayday > avgNonPayday * 1.3) {
      recommendations.push({
        title: 'Spending Spike After Payday',
        message: `Spending increases by ${Math.round((avgPayday/avgNonPayday-1)*100)}% in the days right after payday. Try to pace your spending throughout the month.`,
        priority: 'Medium',
        impact: 'Medium',
        timeline: 'After Payday',
        impactEstimate: Math.round(avgPayday - avgNonPayday),
        actions: ['Delay large purchases until later in the month.', 'Review your post-payday expenses.']
      });
    }
  }
  // December/seasonal spike
  if (decCount > 5 && otherMonthCount > 10) {
    const avgDec = decSpending / decCount;
    const avgOther = otherMonthTotal / otherMonthCount;
    if (avgDec > avgOther * 1.3) {
      recommendations.push({
        title: 'Seasonal Spending: December',
        message: `Your average spending in December is ${Math.round((avgDec/avgOther-1)*100)}% higher than other months. Plan ahead for holiday expenses.`,
        priority: 'Medium',
        impact: 'Medium',
        timeline: 'December',
        impactEstimate: Math.round(avgDec - avgOther),
        actions: ['Start a holiday fund early.', 'Track December expenses closely.']
      });
    }
  }
  // Family grocery trend
  if (familyGroceryCount > 10) {
    const avgGrocery = familyGroceryTotal / familyGroceryCount;
    if (avgGrocery > 150) {
      recommendations.push({
        title: 'Family Grocery Spending',
        message: `Your average grocery transaction is $${avgGrocery.toFixed(2)}. Consider meal planning or bulk buying to save.`,
        priority: 'Low',
        impact: 'Low',
        timeline: 'Ongoing',
        impactEstimate: Math.round(avgGrocery),
        actions: ['Try meal planning.', 'Look for grocery deals and coupons.']
      });
    }
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
  const recommendations = getRecommendations(db, totalIncome, totalExpenses, balances, now);

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
