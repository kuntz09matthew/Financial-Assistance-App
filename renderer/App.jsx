// Simple bar chart for month-over-month comparison
function MonthComparisonChart({ data, theme }) {
  // data: [{ month, totalIncome, totalSpending, netSavings }]
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map(d => Math.max(d.totalIncome, d.totalSpending)));
  return (
    <div style={{ margin: '2rem 0', padding: '1.5rem', background: theme.background, borderRadius: '12px', boxShadow: `0 2px 8px ${theme.border}` }}>
      <h4 style={{ color: theme.accent, marginBottom: '1rem', textAlign: 'center', fontWeight: 700 }}>Month-over-Month Comparison</h4>
      <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', alignItems: 'flex-end', minHeight: 180 }}>
        {data.map((d, i) => (
          <div key={d.month} style={{ flex: 1, minWidth: 60, textAlign: 'center' }}>
            <div style={{ marginBottom: 6, fontSize: '0.95rem', color: theme.subtext }}>{d.month.slice(5, 7) + '/' + d.month.slice(2, 4)}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', height: 140 }}>
              {/* Income bar */}
              <div style={{
                height: `${(d.totalIncome / max) * 100 || 2}%`,
                width: 18,
                background: theme.success,
                borderRadius: 4,
                marginBottom: 2,
                opacity: 0.85,
                transition: 'height 0.3s',
              }} title={`Income: $${d.totalIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}></div>
              {/* Spending bar */}
              <div style={{
                height: `${(d.totalSpending / max) * 100 || 2}%`,
                width: 18,
                background: theme.error,
                borderRadius: 4,
                opacity: 0.7,
                transition: 'height 0.3s',
              }} title={`Spending: $${d.totalSpending.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}></div>
            </div>
            <div style={{ fontSize: '0.85rem', color: d.netSavings >= 0 ? theme.success : theme.error, fontWeight: 600, marginTop: 4 }}>
              {d.netSavings >= 0 ? '+' : ''}${d.netSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
          </div>
        ))}
      </div>
      <div style={{ textAlign: 'center', marginTop: 12, color: theme.subtext, fontSize: '0.95rem' }}>
        <span style={{ color: theme.success, fontWeight: 600 }}>Green</span> = Income, <span style={{ color: theme.error, fontWeight: 600 }}>Red</span> = Spending, Net = Income - Spending
      </div>
    </div>
  );
}
// ...existing code...
import React, { useState, useEffect } from 'react';
import { lightTheme, darkTheme } from './theme';
import DashboardCard from './DashboardCard';
import ErrorBoundary from '../components/ErrorBoundary.jsx';
import UpdateHelp from '../components/UpdateHelp.jsx';
import MonthDetailModal from './MonthDetailModal';

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

const App = () => {
  // Handler for month click in MonthComparisonChart
  const handleMonthClick = (month) => {
    setSelectedMonth(month);
    setModalOpen(true);
    // Fetch transactions for the selected month
    if (window.electronAPI && window.electronAPI.getTransactionsForMonth) {
      window.electronAPI.getTransactionsForMonth(month).then((res) => {
        setMonthTransactions(res && Array.isArray(res.transactions) ? res.transactions : []);
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
    const updateBanner = (
      <div style={{ background: '#ffe066', color: '#333', padding: '8px', textAlign: 'center', fontWeight: 'bold', fontSize: '1.1em' }}>
        v1.0.25 Update Test: If you see this banner, the update system works!
      </div>
    );
    // Listen for theme-toggle event from main process
    const handler = () => setIsDarkMode((prev) => !prev);
    window.addEventListener('theme-toggle', handler);
    if (window.electronAPI && window.electronAPI.onThemeToggle) {
      window.electronAPI.onThemeToggle((mode) => setIsDarkMode(mode === 'dark'));
    }
    // Listen for direct IPC event
    if (window.electronAPI && window.electronAPI.getAccountsData) {
      window.electronAPI.getAccountsData(); // Just to ensure preload is loaded
    }
    // Listen for Electron IPC event
    if (window.electron && window.electron.ipcRenderer) {
      window.electron.ipcRenderer.on('theme-toggle', handler);
    }
    // Listen for direct window event from Electron
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
    console.log('App mounted');
    console.log('Income state:', income);
    console.log('Expenses state:', expenses);
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
  const [updateStatus, setUpdateStatus] = useState('idle'); // idle, checking, available, downloading, downloaded, error, up-to-date
  const [updateMessage, setUpdateMessage] = useState('');
  const [showUpdateHelp, setShowUpdateHelp] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [income, setIncome] = useState(() => loadData('income', DEMO_INCOME));
  const [expenses, setExpenses] = useState(() => loadData('expenses', DEMO_EXPENSES));
  // Persist income/expenses changes
  useEffect(() => { saveData('income', income); }, [income]);
  useEffect(() => { saveData('expenses', expenses); }, [expenses]);
  // Listen for online/offline events
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

  return (
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
        <nav style={{
          minWidth: '200px',
          background: isDarkMode ? theme.nav : theme.card,
          borderRadius: '8px',
          boxShadow: `0 2px 8px ${theme.border}`,
          padding: '1rem',
          color: isDarkMode ? theme.text : theme.text,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
        }}>
          <button
            style={{
              marginBottom: '1rem',
              color: theme.accent,
              fontWeight: 700,
              background: isDarkMode ? theme.nav : theme.card,
              borderRadius: '6px',
              padding: '0.75rem',
              border: `1px solid ${theme.border}`,
      cursor: 'pointer',
      fontSize: '1rem',
      transition: 'background 0.2s',
            }}
            onClick={() => {/* future navigation logic here */}}
            aria-label="Go to Dashboard"
          >
            Dashboard
          </button>
        </nav>
  <section style={{ flex: 1, background: theme.card, borderRadius: '8px', boxShadow: `0 2px 8px ${theme.border}`, padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ color: theme.text, fontWeight: 700, fontSize: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>Account Balances</h2>
          {/* Real-time Account Balances Table */}
          <div style={{ background: theme.background, borderRadius: '12px', padding: '1.2rem', marginBottom: '2rem', boxShadow: `0 2px 8px ${theme.border}` }}>
            {accountsError && (
              <div style={{ color: theme.error, marginBottom: '1rem' }}>Error loading accounts: {accountsError}</div>
            )}
            {!accountsError && accounts.length === 0 && (
              <div style={{ color: theme.subtext, marginBottom: '1rem' }}>No account data found.</div>
            )}
            {!accountsError && accounts.length > 0 && (
              <table style={{ width: '100%', borderCollapse: 'collapse', background: theme.card, borderRadius: '8px', overflow: 'hidden' }}>
                <thead>
                  <tr style={{ background: isDarkMode ? theme.nav : theme.card, color: theme.accent }}>
                    <th style={{ textAlign: 'left', padding: '0.75rem' }}>Account</th>
                    <th style={{ textAlign: 'left', padding: '0.75rem' }}>Type</th>
                    <th style={{ textAlign: 'left', padding: '0.75rem' }}>Institution</th>
                    <th style={{ textAlign: 'right', padding: '0.75rem' }}>Balance</th>
                    <th style={{ textAlign: 'left', padding: '0.75rem' }}>Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((acc) => (
                    <tr key={acc.id} style={{ background: theme.background, color: theme.text }}>
                      <td style={{ padding: '0.75rem' }}>{acc.name}</td>
                      <td style={{ padding: '0.75rem' }}>{acc.type}</td>
                      <td style={{ padding: '0.75rem' }}>{acc.institution}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', color: acc.balance < 0 ? theme.error : theme.text, fontWeight: 'bold' }}>
                        {acc.type === 'Credit Card' ? '-' : ''}${Math.abs(acc.balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '0.75rem' }}>{new Date(acc.lastUpdated).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {/* Dashboard Summary Metrics Section */}
          {/* Month-over-Month Comparison Section */}
          <div style={{ marginBottom: '2rem' }}>
            {monthlySummaryError && <div style={{ color: theme.error, marginBottom: 8 }}>Error: {monthlySummaryError}</div>}
            {monthlySummary && monthlySummary.length > 0 && <MonthComparisonChart data={monthlySummary} theme={theme} onMonthClick={handleMonthClick} />}
            <MonthDetailModal open={modalOpen} onClose={() => setModalOpen(false)} month={selectedMonth || ''} transactions={monthTransactions} />
          </div>
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ color: theme.accent, fontWeight: 700, fontSize: '1.2rem', marginBottom: '1rem', textAlign: 'center', letterSpacing: '0.01em' }}>Summary Metrics</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '2rem',
              justifyContent: 'center',
              alignItems: 'stretch',
            }}>
              {/* Budget Health Score Card */}
              <DashboardCard
                label="Budget Health Score"
                value={
                  budgetHealthScore === null
                    ? 'Loading...'
                    : budgetHealthScore === 'Error'
                    ? 'Error'
                    : `${budgetHealthScore} / 100`
                }
                icon="health"
                theme={theme}
                border={`2px solid ${(() => {
                  if (budgetHealthScore === null || budgetHealthScore === 'Error') return theme.subtle;
                  if (budgetHealthScore < 50) return theme.error;
                  if (budgetHealthScore < 80) return theme.warning;
                  return theme.success;
                })()}`}
              >
                <div style={{ fontSize: '0.95rem', color: theme.subtext, marginTop: '0.5rem' }}>
                  <span>
                    <b>How healthy is your budget?</b>
                  </span>
                  <br />
                  <span>
                    <b>Tip:</b> Keep net savings positive and avoid negative balances for a high score.
                  </span>
                </div>
              </DashboardCard>
              <div style={{ gridColumn: 'span 2', minWidth: '220px' }}>
                <DashboardCard
                  label="Available Spending Money"
                  value={accounts.length === 0 ? 'Loading...' : `$${(() => {
                    const checking = accounts.filter(acc => acc.type === 'Checking').reduce((sum, acc) => sum + acc.balance, 0);
                    const savings = accounts.filter(acc => acc.type === 'Savings').reduce((sum, acc) => sum + acc.balance, 0);
                    const credit = accounts.filter(acc => acc.type === 'Credit Card').reduce((sum, acc) => sum + acc.balance, 0);
                    const totalFixed = expenses.filter(e => e.type === 'Fixed').reduce((sum, e) => sum + e.amount, 0);
                    return (checking + savings + credit - totalFixed);
                  })().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  icon="success"
                  theme={theme}
                  border={`2px solid ${(() => {
                    const checking = accounts.filter(acc => acc.type === 'Checking').reduce((sum, acc) => sum + acc.balance, 0);
                    const savings = accounts.filter(acc => acc.type === 'Savings').reduce((sum, acc) => sum + acc.balance, 0);
                    const credit = accounts.filter(acc => acc.type === 'Credit Card').reduce((sum, acc) => sum + acc.balance, 0);
                    const totalFixed = expenses.filter(e => e.type === 'Fixed').reduce((sum, e) => sum + e.amount, 0);
                    const availableSpending = (checking + savings + credit - totalFixed);
                    return availableSpending < 0 ? theme.error : theme.success;
                  })()}`}
                >
                  <div style={{ fontSize: '0.95rem', color: theme.subtext, marginTop: '0.5rem' }}>
                    <span>
                      <b>Formula:</b> (Checking + Savings + Credit) - Fixed Expenses
                    </span>
                    <br />
                    <span>
                      <b>Tip:</b> This is your real "safe to spend" after bills. If negative, review your budget!
                    </span>
                  </div>
                </DashboardCard>
              </div>
              {/* Money Left Per Day Card */}
              <DashboardCard
                label="Money Left Per Day"
                value={(function() {
                  // Calculate available spending money
                  const checking = accounts.filter(acc => acc.type === 'Checking').reduce((sum, acc) => sum + acc.balance, 0);
                  const savings = accounts.filter(acc => acc.type === 'Savings').reduce((sum, acc) => sum + acc.balance, 0);
                  const credit = accounts.filter(acc => acc.type === 'Credit Card').reduce((sum, acc) => sum + acc.balance, 0);
                  const totalFixed = expenses.filter(e => e.type === 'Fixed').reduce((sum, e) => sum + e.amount, 0);
                  const availableSpending = checking + savings + credit - totalFixed;
                  // Use daysUntilNextPaycheck from state
                  if (accounts.length === 0 || daysUntilNextPaycheck === null || daysUntilNextPaycheck === 'Error') return 'Loading...';
                  if (daysUntilNextPaycheck <= 0) return 'N/A';
                  const perDay = availableSpending / daysUntilNextPaycheck;
                  return `$${perDay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / day`;
                })()}
                icon="calendar_today"
                theme={theme}
                border={`2px solid ${(() => {
                  // Color code: green if > $20/day, yellow if $5-20, red if < $5
                  const checking = accounts.filter(acc => acc.type === 'Checking').reduce((sum, acc) => sum + acc.balance, 0);
                  const savings = accounts.filter(acc => acc.type === 'Savings').reduce((sum, acc) => sum + acc.balance, 0);
                  const credit = accounts.filter(acc => acc.type === 'Credit Card').reduce((sum, acc) => sum + acc.balance, 0);
                  const totalFixed = expenses.filter(e => e.type === 'Fixed').reduce((sum, e) => sum + e.amount, 0);
                  const availableSpending = checking + savings + credit - totalFixed;
                  if (accounts.length === 0 || daysUntilNextPaycheck === null || daysUntilNextPaycheck === 'Error' || daysUntilNextPaycheck <= 0) return theme.subtle;
                  const perDay = availableSpending / daysUntilNextPaycheck;
                  if (perDay < 5) return theme.error;
                  if (perDay < 20) return theme.warning;
                  return theme.success;
                })()}`}
              >
                <div style={{ fontSize: '0.95rem', color: theme.subtext, marginTop: '0.5rem' }}>
                  <span>
                    <b>How much you can safely spend per day until your next paycheck.</b>
                  </span>
                  <br />
                  <span>
                    <b>Formula:</b> Available Spending Money ÷ Days Until Next Paycheck
                  </span>
                  <br />
                  <span>
                    <b>Tip:</b> Try to keep this above $20/day for a healthy budget.
                  </span>
                </div>
              </DashboardCard>
              <DashboardCard
                label="Month-to-Date Spending"
                value={
                  monthToDateSpending === null
                    ? 'Loading...'
                    : monthToDateSpending === 'Error'
                    ? 'Error'
                    : `$${monthToDateSpending.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                }
                icon="expenses"
                theme={theme}
              />
              <DashboardCard
                label="Days Until Next Paycheck"
                value={
                  daysUntilNextPaycheck === null
                    ? 'Loading...'
                    : daysUntilNextPaycheck === 'Error'
                    ? 'Error'
                    : `${daysUntilNextPaycheck} day${daysUntilNextPaycheck === 1 ? '' : 's'}`
                }
                icon="success"
                theme={theme}
              >
                <div style={{ fontSize: '0.95rem', color: theme.subtext, marginTop: '0.5rem' }}>
                  {nextPaycheckDate && daysUntilNextPaycheck !== 'Error' && (
                    <span>
                      <b>Next Paycheck Date:</b> {new Date(nextPaycheckDate).toLocaleDateString()}
                    </span>
                  )}
                  {!nextPaycheckDate && daysUntilNextPaycheck !== 'Error' && (
                    <span>Paycheck date not available.</span>
                  )}
                  {daysUntilNextPaycheck === 'Error' && (
                    <span>Could not calculate next paycheck.</span>
                  )}
                </div>
              </DashboardCard>
              <DashboardCard
                label="Spending Velocity"
                value={
                  spendingVelocity === null
                    ? 'Loading...'
                    : spendingVelocity === 'Error'
                    ? 'Error'
                    : `$${spendingVelocity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / day`
                }
                icon="trending_down"
                theme={theme}
              >
                <div style={{ fontSize: '0.95rem', color: theme.subtext, marginTop: '0.5rem' }}>
                  <span>
                    <b>How fast you're spending this month (average per day).</b>
                  </span>
                </div>
              </DashboardCard>
              <DashboardCard
                label="Total Monthly Income"
                value={`$${income
                  .reduce((sum, i) => sum + (i.frequency === 'Annual' ? i.amount / 12 : i.amount), 0)
                  .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                icon="total"
                theme={theme}
              />
              <DashboardCard
                label="Total Fixed Expenses"
                value={`$${expenses
                  .filter(e => e.type === 'Fixed')
                  .reduce((sum, e) => sum + e.amount, 0)
                  .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                icon="fixed"
                theme={theme}
              />
              <DashboardCard
                label="Total Expenses"
                value={`$${expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                icon="expenses"
                theme={theme}
              />
              <DashboardCard label="Net Savings" value={`$${(
                 income.reduce((sum, i) => sum + (i.frequency === 'Annual' ? i.amount / 12 : i.amount), 0) - expenses.reduce((sum, e) => sum + e.amount, 0)
               ).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon="savingsNet" theme={theme} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

// Wrap App in ErrorBoundary for export
const WrappedApp = () => (
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);


export default WrappedApp;
