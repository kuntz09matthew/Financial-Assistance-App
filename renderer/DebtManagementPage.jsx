import React, { useEffect, useState } from 'react';
import DebtCard from './DebtCard';

function DebtPayoffCalculator({ debt, theme }) {
  const [extraPayment, setExtraPayment] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const calculate = () => {
    setError('');
    setResult(null);
    window.electronAPI.invoke('calculate-debt-payoff', {
      balance: debt.balance,
      apr: debt.apr,
      min_payment: debt.min_payment,
      extra_payment: Number(extraPayment) || 0,
    }).then(res => {
      if (res && !res.error) {
        setResult(res);
      } else {
        setError(res?.error || 'Calculation error');
      }
    });
  };

  return (
    <div style={{ background: theme.subtle || theme.card, borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: `0 2px 8px ${theme.border}` }}>
      <div style={{ marginBottom: 8, fontWeight: 700, color: theme.text }}>Payoff Calculator</div>
      <div style={{ marginBottom: 8, color: theme.text }}>
        <label style={{ color: theme.text }}>Extra Monthly Payment: $
          <input
            type="number"
            min="0"
            value={extraPayment}
            onChange={e => setExtraPayment(e.target.value)}
            style={{
              width: 80,
              marginLeft: 8,
              background: theme.card,
              color: theme.text,
              border: `1.5px solid ${theme.border}`,
              borderRadius: 4,
              padding: '2px 6px',
              fontSize: '1rem',
            }}
          />
        </label>
        <button
          onClick={calculate}
          style={{
            marginLeft: 12,
            background: theme.accent,
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '4px 12px',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '1rem',
            boxShadow: '0 1px 4px #0004',
          }}
        >Calculate</button>
      </div>
      {error && <div style={{ color: theme.error }}>{error}</div>}
      {result && (
        <div style={{ color: theme.text, fontSize: '0.98rem' }}>
          <div><b>Months to Payoff:</b> {result.months}</div>
          <div><b>Total Interest:</b> ${result.totalInterest.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </div>
      )}
    </div>
  );
}

export default function DebtManagementPage({ theme = {
  background: '#181c24',
  card: '#23283a',
  accent: '#7c5cff',
  text: '#f4f6fb',
  border: '#353a4a',
  success: '#4caf50',
  error: '#ff5c5c',
  subtext: '#b0b8d1',
  warning: '#ff9800',
  subtle: '#23283a',
  shadow: '0 4px 24px #000a',
} }) {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newDebt, setNewDebt] = useState({ name: '', type: 'credit card', balance: '', apr: '', min_payment: '', due_date: '', notes: '' });

  useEffect(() => {
    fetchDebts();
  }, []);

  const fetchDebts = () => {
    setLoading(true);
    window.electronAPI.invoke('get-debts').then(res => {
      if (res && res.debts) {
        setDebts(res.debts);
        setError('');
      } else {
        setError(res?.error || 'Failed to load debts');
      }
      setLoading(false);
    });
  };

  const handleAddDebt = (e) => {
    e.preventDefault();
    if (!newDebt.name || !newDebt.balance || !newDebt.apr || !newDebt.min_payment) {
      setError('Name, balance, APR, and minimum payment are required.');
      return;
    }
    setError('');
    window.electronAPI.invoke('add-debt', {
      ...newDebt,
      balance: parseFloat(newDebt.balance),
      apr: parseFloat(newDebt.apr),
      min_payment: parseFloat(newDebt.min_payment),
    }).then(res => {
      if (res && res.id) {
        setShowAdd(false);
        setNewDebt({ name: '', type: 'credit card', balance: '', apr: '', min_payment: '', due_date: '', notes: '' });
        fetchDebts();
      } else {
        setError(res?.error || 'Failed to add debt');
      }
    });
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1rem', background: theme.background, minHeight: '100vh', boxShadow: theme.shadow }}>
      <h2 style={{ color: theme.accent, fontWeight: 900, marginBottom: 8, textShadow: '0 2px 8px #000a' }}>Debt Management</h2>
      <div style={{ color: theme.subtext, marginBottom: 24, fontWeight: 600 }}>Track your credit cards and loans, calculate payoff timelines, and see interest savings.</div>
      {error && <div style={{ color: theme.error, marginBottom: 16 }}>{error}</div>}
      <button onClick={() => setShowAdd(s => !s)} style={{ background: theme.accent, color: '#fff', border: 'none', borderRadius: 8, padding: '0.6rem 1.2rem', fontWeight: 700, marginBottom: 24, cursor: 'pointer', boxShadow: '0 2px 8px #0006', letterSpacing: 0.5 }}>{showAdd ? 'Cancel' : 'Add New Debt'}</button>
      {showAdd && (
        <form onSubmit={handleAddDebt} style={{ background: theme.card, borderRadius: 14, padding: 22, marginBottom: 32, boxShadow: theme.shadow, border: `1.5px solid ${theme.border}` }}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontWeight: 600 }}>Name: <input required value={newDebt.name} onChange={e => setNewDebt(d => ({ ...d, name: e.target.value }))} style={{ marginLeft: 8, padding: 4, borderRadius: 4, border: `1px solid ${theme.border}` }} /></label>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontWeight: 600 }}>Type: <select value={newDebt.type} onChange={e => setNewDebt(d => ({ ...d, type: e.target.value }))} style={{ marginLeft: 8, padding: 4, borderRadius: 4, border: `1px solid ${theme.border}` }}>
              <option value="credit card">Credit Card</option>
              <option value="loan">Loan</option>
            </select></label>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontWeight: 600 }}>Balance: <input required type="number" min="0" value={newDebt.balance} onChange={e => setNewDebt(d => ({ ...d, balance: e.target.value }))} style={{ marginLeft: 8, padding: 4, borderRadius: 4, border: `1px solid ${theme.border}` }} /></label>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontWeight: 600 }}>APR (%): <input required type="number" min="0" step="0.01" value={newDebt.apr} onChange={e => setNewDebt(d => ({ ...d, apr: e.target.value }))} style={{ marginLeft: 8, padding: 4, borderRadius: 4, border: `1px solid ${theme.border}` }} /></label>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontWeight: 600 }}>Minimum Payment: <input required type="number" min="0" value={newDebt.min_payment} onChange={e => setNewDebt(d => ({ ...d, min_payment: e.target.value }))} style={{ marginLeft: 8, padding: 4, borderRadius: 4, border: `1px solid ${theme.border}` }} /></label>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontWeight: 600 }}>Due Date: <input type="date" value={newDebt.due_date} onChange={e => setNewDebt(d => ({ ...d, due_date: e.target.value }))} style={{ marginLeft: 8, padding: 4, borderRadius: 4, border: `1px solid ${theme.border}` }} /></label>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontWeight: 600 }}>Notes: <input value={newDebt.notes} onChange={e => setNewDebt(d => ({ ...d, notes: e.target.value }))} style={{ marginLeft: 8, padding: 4, borderRadius: 4, border: `1px solid ${theme.border}` }} /></label>
          </div>
          <button type="submit" style={{ background: theme.success, color: theme.card, border: 'none', borderRadius: 8, padding: '0.5rem 1.2rem', fontWeight: 700, cursor: 'pointer' }}>Add Debt</button>
        </form>
      )}
      {loading ? (
        <div style={{ color: theme.subtext }}>Loading debts...</div>
      ) : debts.length === 0 ? (
        <div style={{ color: theme.subtext }}>No debts found.</div>
      ) : (
        <div style={{ marginTop: 16 }}>
          {debts.map(debt => (
            <DebtCard key={debt.id} debt={debt} theme={theme}>
              <DebtPayoffCalculator debt={debt} theme={theme} />
            </DebtCard>
          ))}
        </div>
      )}
    </div>
  );
}
