import React, { useState, useEffect } from 'react';
import ErrorBoundary from '../components/ErrorBoundary.jsx';
// Demo data for a ~$60k/year household
const DEMO_INCOME = [
  { id: 1, source: 'Job (Primary)', amount: 4200, frequency: 'Monthly' },
  { id: 2, source: 'Job (Spouse)', amount: 800, frequency: 'Monthly' },
  { id: 3, source: 'Child Tax Credit', amount: 300, frequency: 'Monthly' },
];
const DEMO_EXPENSES = [
  { id: 1, category: 'Rent/Mortgage', amount: 1500, frequency: 'Monthly' },
  { id: 2, category: 'Utilities', amount: 250, frequency: 'Monthly' },
  { id: 3, category: 'Groceries', amount: 600, frequency: 'Monthly' },
  { id: 4, category: 'Transportation', amount: 300, frequency: 'Monthly' },
  { id: 5, category: 'Insurance', amount: 400, frequency: 'Monthly' },
  { id: 6, category: 'Childcare', amount: 350, frequency: 'Monthly' },
  { id: 7, category: 'Other', amount: 200, frequency: 'Monthly' },
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
  useEffect(() => {
    console.log('App mounted');
    console.log('Income state:', income);
    console.log('Expenses state:', expenses);
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
    <div style={{ fontFamily: 'Segoe UI, Arial, sans-serif', background: '#f4f6fb', minHeight: '100vh', padding: '2rem' }}>
      <h1 style={{ color: '#2d3a4a' }}>Financial Assistance Dashboard</h1>
      {isOffline && (
        <div style={{ background: '#ffe0e0', color: '#a94442', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center', fontWeight: 'bold', boxShadow: '0 2px 8px #e0e6ed' }}>
          You are currently offline. Some features may be unavailable.
        </div>
      )}
      <div style={{ display: 'flex', gap: '2rem' }}>
        <nav style={{ minWidth: '200px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px #e0e6ed', padding: '1rem' }}>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '1rem' }}><b>Overview</b></li>
            <li style={{ marginBottom: '1rem' }}>Income</li>
            <li style={{ marginBottom: '1rem' }}>Expenses</li>
            <li style={{ marginBottom: '1rem' }}>Assistance</li>
            <li>Settings</li>
          </ul>
        </nav>
        <section style={{ flex: 1, background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px #e0e6ed', padding: '2rem' }}>
          <h2>Dashboard Tabs</h2>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <button>Tab 1</button>
            <button>Tab 2</button>
            <button>Tab 3</button>
          </div>
          <div>
            <h3>Subtabs</h3>
            <button>Subtab A</button>
            <button>Subtab B</button>
          </div>
          {/* Income/Expenses Overview */}
          <div style={{ marginTop: '2rem', marginBottom: '2rem', padding: '1rem', background: '#f9fafc', borderRadius: '8px', boxShadow: '0 1px 4px #e0e6ed' }}>
            <h3 style={{ color: '#2d3a4a' }}>Income</h3>
            {income.length === 0 ? (
              <div style={{ color: '#a94442', marginBottom: '1rem' }}>No income data found.</div>
            ) : (
              <table style={{ width: '100%', marginBottom: '1rem', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#e0e6ed' }}>
                    <th style={{ textAlign: 'left', padding: '0.5rem' }}>Source</th>
                    <th style={{ textAlign: 'right', padding: '0.5rem' }}>Amount</th>
                    <th style={{ textAlign: 'left', padding: '0.5rem' }}>Frequency</th>
                  </tr>
                </thead>
                <tbody>
                  {income.map((item) => (
                    <tr key={item.id}>
                      <td style={{ padding: '0.5rem' }}>{item.source}</td>
                      <td style={{ padding: '0.5rem', textAlign: 'right' }}>${item.amount.toLocaleString()}</td>
                      <td style={{ padding: '0.5rem' }}>{item.frequency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <h3 style={{ color: '#2d3a4a' }}>Expenses</h3>
            {expenses.length === 0 ? (
              <div style={{ color: '#a94442', marginBottom: '1rem' }}>No expenses data found.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#e0e6ed' }}>
                    <th style={{ textAlign: 'left', padding: '0.5rem' }}>Category</th>
                    <th style={{ textAlign: 'right', padding: '0.5rem' }}>Amount</th>
                    <th style={{ textAlign: 'left', padding: '0.5rem' }}>Frequency</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((item) => (
                    <tr key={item.id}>
                      <td style={{ padding: '0.5rem' }}>{item.category}</td>
                      <td style={{ padding: '0.5rem', textAlign: 'right' }}>${item.amount.toLocaleString()}</td>
                      <td style={{ padding: '0.5rem' }}>{item.frequency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {/* Debug output for troubleshooting */}
            <div style={{ marginTop: '1rem', fontSize: '0.9em', color: '#888', background: '#fffbe6', padding: '0.5rem', borderRadius: '4px' }}>
              <b>Debug:</b>
              <div>Income: <pre style={{ display: 'inline', color: '#333' }}>{JSON.stringify(income, null, 2)}</pre></div>
              <div>Expenses: <pre style={{ display: 'inline', color: '#333' }}>{JSON.stringify(expenses, null, 2)}</pre></div>
            </div>
          </div>
          {/* Update Section */}
          <div style={{ marginTop: '2rem', padding: '1rem', background: '#f9fafc', borderRadius: '8px', boxShadow: '0 1px 4px #e0e6ed' }}>
            <h3 style={{ color: '#2d3a4a' }}>App Updates</h3>
            <button
              onClick={checkForUpdates}
              disabled={isOffline || updateStatus === 'checking' || updateStatus === 'downloading'}
              style={{ marginRight: '1rem', padding: '0.5rem 1.5rem', background: isOffline ? '#aaa' : '#2d3a4a', color: '#fff', border: 'none', borderRadius: '4px', cursor: isOffline ? 'not-allowed' : 'pointer' }}
            >
              {updateStatus === 'checking' ? 'Checking...' : 'Check for Updates'}
            </button>
            {updateStatus === 'available' && (
              <button
                onClick={updateNow}
                disabled={isOffline}
                style={{ padding: '0.5rem 1.5rem', background: isOffline ? '#aaa' : '#1e7e34', color: '#fff', border: 'none', borderRadius: '4px', cursor: isOffline ? 'not-allowed' : 'pointer' }}
              >
                Update Now
              </button>
            )}
            {updateStatus === 'downloaded' && (
              <button
                onClick={() => window.electronAPI && window.electronAPI.restartToInstall()}
                style={{ marginTop: '1rem', padding: '0.5rem 1.5rem', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Restart to Install
              </button>
            )}
            <button
              onClick={() => setShowUpdateHelp(true)}
              style={{ marginLeft: '1rem', padding: '0.5rem 1.5rem', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Update Help
            </button>
            {updateMessage && <div style={{ marginTop: '1rem', color: '#2d3a4a' }}>{updateMessage}</div>}
            {showUpdateHelp && (
              <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ background: '#fff', borderRadius: '8px', padding: '2rem', minWidth: '350px', maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 4px 24px #0002' }}>
                  <button onClick={() => setShowUpdateHelp(false)} style={{ float: 'right', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#2d3a4a' }}>&times;</button>
                  <UpdateHelp />
                </div>
              </div>
            )}
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
