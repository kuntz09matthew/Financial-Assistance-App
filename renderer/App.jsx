import React, { useState, useEffect } from 'react';
import { lightTheme, darkTheme } from './theme';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import AppNav from './AppNav';
import DashboardPage from './DashboardPage';
import BillsPage from './BillsPage';
import ErrorBoundary from '../components/ErrorBoundary.jsx';
import UpdateHelp from '../components/UpdateHelp.jsx';
import MonthDetailModal from './MonthDetailModal';

// Simple bar chart for month-over-month comparison
export function MonthComparisonChart({ data, theme, onMonthClick }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map(d => Math.max(d.totalIncome, d.totalSpending)));
  return (
    <div style={{ margin: '2rem 0', padding: '1.5rem', background: theme.background, borderRadius: '12px', boxShadow: `0 2px 8px ${theme.border}` }}>
      <h4 style={{ color: theme.accent, marginBottom: '1rem', textAlign: 'center', fontWeight: 700 }}>Month-over-Month Comparison</h4>
      <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', alignItems: 'flex-end', minHeight: 180 }}>
        {data.map((d, i) => (
          <div key={d.month} style={{ cursor: onMonthClick ? 'pointer' : 'default', flex: 1, minWidth: 40 }} onClick={() => onMonthClick && onMonthClick(d.month)}>
            <div style={{ height: 120, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center' }}>
              <div style={{ height: `${(d.totalIncome / max) * 100}%`, width: 18, background: theme.success, borderRadius: 4, marginBottom: 2 }} title={`Income: $${d.totalIncome.toLocaleString()}`}></div>
              <div style={{ height: `${(d.totalSpending / max) * 100}%`, width: 18, background: theme.error, borderRadius: 4 }} title={`Spending: $${d.totalSpending.toLocaleString()}`}></div>
            </div>
            <div style={{ fontSize: '0.95rem', color: theme.subtext, textAlign: 'center', marginTop: 4 }}>{d.month}</div>
            <div style={{ fontSize: '0.9rem', color: theme.text, textAlign: 'center', fontWeight: 600 }}>
              Net: ${d.netSavings.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProjectedBalanceModal({ open, onClose, data, theme }) {
  if (!open || !data) return null;
  const { projectedBalance, status, insight, breakdown } = data;
  const color = status === 'healthy' ? theme.success : status === 'caution' ? theme.warning : status === 'warning' ? theme.warning : theme.error;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.32)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ background: theme.card, borderRadius: 16, boxShadow: `0 4px 32px ${theme.border}`, padding: 32, minWidth: 340, maxWidth: 420, color: theme.text, position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: theme.subtext, fontSize: 22, cursor: 'pointer' }} aria-label="Close">×</button>
        <h2 style={{ color, fontWeight: 800, fontSize: '1.4rem', marginBottom: 8 }}>Projected End-of-Month Balance</h2>
        <div style={{ fontSize: '2.1rem', fontWeight: 700, color, marginBottom: 8 }}>
          ${projectedBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div style={{ fontSize: '1.05rem', marginBottom: 12 }}>{insight}</div>
        <div style={{ marginBottom: 10, fontWeight: 600, color: theme.accent }}>Breakdown:</div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '1rem' }}>
          <li><b>Current Balance:</b> ${breakdown.availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</li>
          <li><b>Expected Income (rest of month):</b> ${breakdown.futureIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}</li>
          <li><b>Unpaid Bills (rest of month):</b> ${breakdown.futureBills.toLocaleString(undefined, { minimumFractionDigits: 2 })}</li>
          <li><b>Projected Variable Spending:</b> ${breakdown.projectedVariableSpending.toLocaleString(undefined, { minimumFractionDigits: 2 })}</li>
          <li><b>Days Left in Month:</b> {breakdown.daysLeft}</li>
          <li><b>Avg Daily Spending:</b> ${breakdown.avgDailySpending.toLocaleString(undefined, { minimumFractionDigits: 2 })}</li>
        </ul>
        <div style={{ marginTop: 16, color: theme.subtext, fontSize: '0.98rem' }}>
          <b>Calculation:</b> Current Balance + Expected Income - Unpaid Bills - Projected Variable Spending
        </div>
      </div>
    </div>
  );
}


function App() {
  // Dashboard sub-tab state
  const [dashboardTab, setDashboardTab] = useState('overview');
  // Upcoming Bill Reminders state
  const [billReminders, setBillReminders] = useState(null);
  const [billRemindersError, setBillRemindersError] = useState('');
  useEffect(() => {
    if (window.electronAPI && window.electronAPI.getUpcomingBillReminders) {
      window.electronAPI.getUpcomingBillReminders().then((res) => {
        console.log('getUpcomingBillReminders result:', res); // DEBUG LOG
        if (res && res.grouped && res.stats) {
          setBillReminders(res);
        } else {
          setBillRemindersError(res && res.error ? res.error : 'Unknown error');
        }
      });
    }
  }, []);
  // Projected End-of-Month Balance state
  const [projectedBalanceData, setProjectedBalanceData] = useState(null);
  const [projectedBalanceError, setProjectedBalanceError] = useState('');
  const [projectedModalOpen, setProjectedModalOpen] = useState(false);
  // ...existing code...

  // Demo data for a ~$60k/year household
  const DEMO_INCOME = [
    { id: 1, source: 'Job (Primary)', amount: 4200, frequency: 'Monthly' },
    { id: 2, source: 'Job (Spouse)', amount: 800, frequency: 'Monthly' },
    { id: 3, source: 'Child Tax Credit', amount: 300, frequency: 'Monthly' },
    { id: 4, source: 'Freelance Work', amount: 150, frequency: 'Monthly' },
    { id: 5, source: 'Interest Income', amount: 25, frequency: 'Monthly' },
    { id: 6, source: 'Side Hustle', amount: 100, frequency: 'Monthly' },
    { id: 7, source: 'Tax Refund (Annual)', amount: 1200, frequency: 'Annual' },
    { id: 8, source: 'Gift', amount: 200, frequency: 'Annual' },
  ];
  const DEMO_EXPENSES = [
    { id: 1, category: 'Rent/Mortgage', amount: 1500, frequency: 'Monthly', type: 'Fixed' },
    { id: 2, category: 'Utilities', amount: 250, frequency: 'Monthly', type: 'Fixed' },
    { id: 3, category: 'Groceries', amount: 600, frequency: 'Monthly', type: 'Variable' },
    { id: 4, category: 'Transportation', amount: 300, frequency: 'Monthly', type: 'Variable' },
    { id: 5, category: 'Insurance', amount: 400, frequency: 'Monthly', type: 'Fixed' },
    { id: 6, category: 'Childcare', amount: 350, frequency: 'Monthly', type: 'Fixed' },
    { id: 7, category: 'Internet', amount: 80, frequency: 'Monthly', type: 'Fixed' },
    { id: 8, category: 'Phone', amount: 90, frequency: 'Monthly', type: 'Fixed' },
    { id: 9, category: 'Streaming Services', amount: 45, frequency: 'Monthly', type: 'Fixed' },
    { id: 10, category: 'Other', amount: 200, frequency: 'Monthly', type: 'Variable' },
  ];

  // Utility functions for localStorage persistence
  function loadData(key, fallback) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  function saveData(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch {}
  }

  // Handler for month click in MonthComparisonChart
  const handleMonthClick = (month) => {
    setSelectedMonth(month);
    setModalOpen(true);
    // Fetch transactions for the selected month
    if (window.electronAPI && window.electronAPI.getTransactionsForMonth) {
      window.electronAPI.getTransactionsForMonth(month).then((res) => {
    const [dashboardTab, setDashboardTab] = useState('overview');
    const dashboardTabs = [
      { key: 'overview', label: 'Overview' },
      { key: 'alerts', label: 'Alerts & Warnings' },
      { key: 'insights', label: 'Insights' },
    ];
      });
    } else {
      setMonthTransactions([]);
    }
  };

  // Modal state for month detail popup
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [monthTransactions, setMonthTransactions] = useState([]);
  // Month-over-month summary state
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [monthlySummaryError, setMonthlySummaryError] = useState('');
  useEffect(() => {
    if (window.electronAPI && window.electronAPI.getMonthlySummary) {
      window.electronAPI.getMonthlySummary(6).then((res) => {
        if (res && Array.isArray(res.monthlySummary)) {
          setMonthlySummary(res.monthlySummary);
        } else if (res && res.monthlySummary) {
          setMonthlySummary(res.monthlySummary);
        } else {
          setMonthlySummaryError(res && res.error ? res.error : 'Unknown error');
        }
      });
    }
  }, []);

  // Budget Health Score state
  const [budgetHealthScore, setBudgetHealthScore] = useState(null);
  useEffect(() => {
    if (window.electronAPI && window.electronAPI.getBudgetHealthScore) {
      window.electronAPI.getBudgetHealthScore().then((res) => {
        if (res && typeof res.budgetHealthScore === 'number') {
          setBudgetHealthScore(res.budgetHealthScore);
        } else {
          setBudgetHealthScore('Error');
        }
      });
    }
  }, []);

  // Month-to-date spending state
  const [monthToDateSpending, setMonthToDateSpending] = useState(null);
  // Spending velocity state
  const [spendingVelocity, setSpendingVelocity] = useState(null);

  // Fetch month-to-date spending, velocity, and next paycheck countdown from backend
  const [daysUntilNextPaycheck, setDaysUntilNextPaycheck] = useState(null);
  const [nextPaycheckDate, setNextPaycheckDate] = useState(null);
  useEffect(() => {
    if (window.electronAPI && window.electronAPI.getMonthToDateSpending) {
      window.electronAPI.getMonthToDateSpending().then((res) => {
        if (res && typeof res.monthToDateSpending === 'number') {
          setMonthToDateSpending(res.monthToDateSpending);
        } else {
          setMonthToDateSpending('Error');
        }
      });
    }
    if (window.electronAPI && window.electronAPI.getSpendingVelocity) {
      window.electronAPI.getSpendingVelocity().then((res) => {
        if (res && typeof res.spendingVelocity === 'number') {
          setSpendingVelocity(res.spendingVelocity);
        } else {
          setSpendingVelocity('Error');
        }
      });
    }
    if (window.electronAPI && window.electronAPI.getDaysUntilNextPaycheck) {
      window.electronAPI.getDaysUntilNextPaycheck().then((res) => {
        if (res && typeof res.daysUntilNextPaycheck === 'number') {
          setDaysUntilNextPaycheck(res.daysUntilNextPaycheck);
          setNextPaycheckDate(res.nextPaycheckDate);
        } else {
          setDaysUntilNextPaycheck('Error');
        }
      });
    }
  }, []);

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(true);
  const theme = isDarkMode ? darkTheme : lightTheme;

  // Theme toggle button
  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  // Listen for menu toggle (to be wired to Electron menu)
  useEffect(() => {
    // --- UPDATE TEST BANNER ---
    // ...existing code...
    const handler = () => setIsDarkMode((prev) => !prev);
    window.addEventListener('theme-toggle', handler);
    if (window.electronAPI && window.electronAPI.onThemeToggle) {
      window.electronAPI.onThemeToggle((mode) => setIsDarkMode(mode === 'dark'));
    }
    if (window.electronAPI && window.electronAPI.getAccountsData) {
      window.electronAPI.getAccountsData();
    }
    if (window.electron && window.electron.ipcRenderer) {
      window.electron.ipcRenderer.on('theme-toggle', handler);
    }
    if (window && window.addEventListener) {
      window.addEventListener('theme-toggle', handler);
    }
    return () => {
      window.removeEventListener('theme-toggle', handler);
      if (window.electron && window.electron.ipcRenderer) {
        window.electron.ipcRenderer.removeListener('theme-toggle', handler);
      }
    };
  }, []);

  useEffect(() => {
    // ...existing code...
  }, []);

  // Account balances state
  const [accounts, setAccounts] = useState([]);
  const [accountsError, setAccountsError] = useState('');
  useEffect(() => {
    async function loadAccounts() {
      if (window.electronAPI && window.electronAPI.getAccountsData) {
        try {
          const result = await window.electronAPI.getAccountsData();
          if (result && result.error) throw new Error(result.error);
          setAccounts(result);
        } catch (err) {
          setAccountsError(err.message);
        }
      } else {
        setAccountsError('Account API not available');
      }
    }
    loadAccounts();
  }, []);

  const [updateStatus, setUpdateStatus] = useState('idle');
  const [updateMessage, setUpdateMessage] = useState('');
  const [showUpdateHelp, setShowUpdateHelp] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [income, setIncome] = useState(() => loadData('income', DEMO_INCOME));
  const [expenses, setExpenses] = useState(() => loadData('expenses', DEMO_EXPENSES));
  useEffect(() => { saveData('income', income); }, [income]);
  useEffect(() => { saveData('expenses', expenses); }, [expenses]);
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // IPC integration
  const checkForUpdates = () => {
    if (window.electronAPI) {
      window.electronAPI.checkForUpdates();
    } else {
      setUpdateStatus('error');
      setUpdateMessage('Update system not available.');
    }
  };

  const updateNow = () => {
    if (window.electronAPI) {
      window.electronAPI.downloadUpdate();
    } else {
      setUpdateStatus('error');
      setUpdateMessage('Update system not available.');
    }
  };

  useEffect(() => {
    if (window.electronAPI && window.electronAPI.onUpdateStatus) {
      window.electronAPI.onUpdateStatus((data) => {
        setUpdateStatus(data.status);
        setUpdateMessage(data.message);
      });
    }
  }, []);

  // Fetch projected end-of-month balance
  useEffect(() => {
    if (window.electronAPI && window.electronAPI.invoke) {
      window.electronAPI.invoke('get-projected-end-of-month-balance').then((res) => {
        if (res && typeof res.projectedBalance === 'number') {
          setProjectedBalanceData(res);
        } else {
          setProjectedBalanceError(res && res.error ? res.error : 'Unknown error');
        }
      });
    }
  }, []);

  return (
    <Router>
      <div style={{ fontFamily: 'Segoe UI, Arial, sans-serif', background: theme.background, minHeight: '100vh', padding: '2rem' }}>
        {/* Overdraft Warning Alert */}
        {accounts && accounts.some(acc => acc.type === 'Checking' && acc.balance < 0) && (
          <div style={{
            background: theme.warning,
            color: theme.error,
            border: `2px solid ${theme.error}`,
            borderRadius: '10px',
            padding: '1.2rem',
            marginBottom: '1.5rem',
            fontWeight: 700,
            fontSize: '1.15rem',
            boxShadow: `0 2px 8px ${theme.border}`,
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}>
            <span style={{ fontSize: '2rem', lineHeight: 1 }}>🚨</span>
            <span>
              <b>Overdraft Warning:</b> Your checking account is overdrawn!<br />
              Please deposit funds as soon as possible to avoid fees or declined payments.
            </span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ color: theme.header, fontWeight: 800, fontSize: '2.2rem', letterSpacing: '0.02em', margin: 0 }}>Kuntz Family Budget App</h1>
          <button
            onClick={toggleTheme}
            style={{
              background: theme.card,
              color: theme.text,
              border: `1px solid ${theme.border}`,
              borderRadius: '8px',
              padding: '0.5rem 1rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: `0 2px 8px ${theme.border}`,
              marginLeft: '1rem',
            }}
            aria-label="Toggle light/dark mode"
          >
            {isDarkMode ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </button>
        </div>
        {isOffline && (
          <div style={{ background: theme.warning, color: theme.error, padding: '1rem', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center', fontWeight: 'bold', boxShadow: `0 2px 8px ${theme.border}` }}>
            You are currently offline. Some features may be unavailable.
          </div>
        )}
        <div style={{ display: 'flex', gap: '2rem' }}>
          <AppNav isDarkMode={isDarkMode} />
          <section style={{ flex: 1, background: theme.card, borderRadius: '8px', boxShadow: `0 2px 8px ${theme.border}`, padding: '2rem', maxWidth: '900px', margin: '0 auto', position: 'relative' }}>
            <Routes>
              <Route path="/" element={
                <DashboardPage
                  theme={theme}
                  isDarkMode={isDarkMode}
                  accounts={accounts}
                  accountsError={accountsError}
                  expenses={expenses}
                  income={income}
                  daysUntilNextPaycheck={daysUntilNextPaycheck}
                  nextPaycheckDate={nextPaycheckDate}
                  budgetHealthScore={budgetHealthScore}
                  monthToDateSpending={monthToDateSpending}
                  spendingVelocity={spendingVelocity}
                  monthlySummary={monthlySummary}
                  monthlySummaryError={monthlySummaryError}
                  modalOpen={modalOpen}
                  setModalOpen={setModalOpen}
                  selectedMonth={selectedMonth}
                  setSelectedMonth={setSelectedMonth}
                  monthTransactions={monthTransactions}
                  setMonthTransactions={setMonthTransactions}
                  handleMonthClick={handleMonthClick}
                  projectedBalanceData={projectedBalanceData}
                  projectedBalanceError={projectedBalanceError}
                  projectedModalOpen={projectedModalOpen}
                  setProjectedModalOpen={setProjectedModalOpen}
                  dashboardTab={dashboardTab}
                  setDashboardTab={setDashboardTab}
                  billReminders={billReminders}
                  billRemindersError={billRemindersError}
                />
              } />
              <Route path="/bills" element={
                <BillsPage
                  theme={theme}
                  isDarkMode={isDarkMode}
                  /* billReminders and billRemindersError removed: Upcoming Bills now in Dashboard Alerts & Warnings */
                />
              } />
            </Routes>
          </section>
        </div>
      </div>
    </Router>
  );
}

// Wrap App in ErrorBoundary for export
const WrappedApp = () => (
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

export default WrappedApp;

