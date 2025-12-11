import React, { useState, useEffect } from 'react';
import { lightTheme, darkTheme } from './theme';
import DashboardCard from './DashboardCard';
import ErrorBoundary from '../components/ErrorBoundary.jsx';
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
import UpdateHelp from '../components/UpdateHelp.jsx';

const App = () => {
  // Month-to-date spending state
  const [monthToDateSpending, setMonthToDateSpending] = useState(null);

  // Fetch month-to-date spending from backend
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
      {updateBanner}
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
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ color: theme.accent, fontWeight: 700, fontSize: '1.2rem', marginBottom: '1rem', textAlign: 'center', letterSpacing: '0.01em' }}>Summary Metrics</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '2rem',
              justifyContent: 'center',
              alignItems: 'stretch',
            }}>
              {/* Highlight Available Spending Money as first and larger card */}
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
