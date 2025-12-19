
import React, { useState, useEffect } from 'react';

const defaultSource = {
  name: '',
  type: 'salary',
  earner: '',
  frequency: 'monthly',
  expected_amount: '',
  notes: ''
};


export default function IncomePage() {
  const [sources, setSources] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultSource);
  const [error, setError] = useState('');
  const [incomeTx, setIncomeTx] = useState([]);
  const [selectedSource, setSelectedSource] = useState(null);
  // Theme detection (inherits from parent)
  const isDarkMode = document.body.classList.contains('dark') || window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = {
    background: isDarkMode ? '#232533' : '#f7f7fa',
    card: isDarkMode ? '#292b3d' : '#fff',
    border: isDarkMode ? '#35364a' : '#e0e0e0',
    accent: isDarkMode ? '#6fc3df' : '#1976d2',
    text: isDarkMode ? '#f7f7fa' : '#232533',
    subtext: isDarkMode ? '#b0b3c6' : '#555',
    header: isDarkMode ? '#6fc3df' : '#1976d2',
    success: isDarkMode ? '#4caf50' : '#388e3c',
    error: isDarkMode ? '#e57373' : '#d32f2f',
    warning: isDarkMode ? '#ffb74d' : '#ffa726',
  };

  // Fetch income sources
  useEffect(() => {
    window.electronAPI.invoke('get-income-sources').then((data) => {
      if (Array.isArray(data)) setSources(data);
    });
    // Fetch current month income transactions
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    window.electronAPI.invoke('get-transactions-for-month', month).then((res) => {
      if (res && Array.isArray(res.transactions)) {
        setIncomeTx(res.transactions.filter(tx => tx.amount > 0));
      }
    });
  }, [modalOpen]);
  // Calculate actual income for a source (by name, type, earner)
  const getActualIncome = (src) => {
    // Match by name, type, and earner (if available)
    return incomeTx
      .filter(tx => {
        // Try to match by description or category containing name/type/earner
        const desc = (tx.description || '').toLowerCase();
        const cat = (tx.category || '').toLowerCase();
        return (
          desc.includes((src.name || '').toLowerCase()) ||
          cat.includes((src.name || '').toLowerCase()) ||
          (src.earner && desc.includes(src.earner.toLowerCase()))
        );
      })
      .reduce((sum, tx) => sum + Number(tx.amount), 0);
  };

  // Calculate variance percentage and amount
  const getVariance = (expected, actual) => {
    if (!expected) return { pct: 0, amt: 0 };
    const amt = actual - expected;
    const pct = (amt / expected) * 100;
    return { pct, amt };
  };

  const openModal = (source = null) => {
    setEditing(source);
    setForm(source ? { ...source } : defaultSource);
    setError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setForm(defaultSource);
    setError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!form.name.trim()) return 'Name is required.';
    if (!form.type.trim()) return 'Type is required.';
    if (!form.earner.trim()) return 'Earner is required.';
    if (!form.frequency.trim()) return 'Frequency is required.';
    if (!form.expected_amount || isNaN(form.expected_amount)) return 'Expected amount must be a number.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return setError(err);
    if (editing) {
      const res = await window.electronAPI.invoke('update-income-source', { ...form, id: editing.id });
      if (res.error) return setError(res.error);
    } else {
      const res = await window.electronAPI.invoke('add-income-source', form);
      if (res.error) return setError(res.error);
    }
    closeModal();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this income source?')) {
      await window.electronAPI.invoke('delete-income-source', id);
      setSources(sources.filter(s => s.id !== id));
    }
  };

  // Icon rendering function for income types
  const renderTypeIcon = (type) => {
    const size = 22;
    switch (type) {
      case 'salary':
        return <span title="Salary" style={{marginRight:6}}><svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill={theme.accent}/><text x="12" y="16" textAnchor="middle" fontSize="14" fill={theme.card} fontWeight="bold">$</text></svg></span>;
      case 'freelance':
        return <span title="Freelance" style={{marginRight:6}}><svg width={size} height={size} viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="4" fill={theme.warning}/><text x="12" y="16" textAnchor="middle" fontSize="14" fill={theme.card} fontWeight="bold">F</text></svg></span>;
      case 'investment':
        return <span title="Investment" style={{marginRight:6}}><svg width={size} height={size} viewBox="0 0 24 24" fill="none"><ellipse cx="12" cy="12" rx="10" ry="7" fill={theme.success}/><text x="12" y="16" textAnchor="middle" fontSize="14" fill={theme.card} fontWeight="bold">I</text></svg></span>;
      case 'rental':
        return <span title="Rental" style={{marginRight:6}}><svg width={size} height={size} viewBox="0 0 24 24" fill="none"><rect x="4" y="8" width="16" height="10" rx="3" fill={theme.header}/><rect x="8" y="4" width="8" height="6" rx="2" fill={theme.accent}/></svg></span>;
      case 'other':
      default:
        return <span title="Other" style={{marginRight:6}}><svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill={theme.subtext}/><text x="12" y="16" textAnchor="middle" fontSize="14" fill={theme.card} fontWeight="bold">?</text></svg></span>;
    }
  };

  // Helper to calculate monthly equivalent
  const getMonthlyEquivalent = (amount, frequency) => {
    const amt = Number(amount);
    if (!amt || amt <= 0) return 0;
    switch (frequency) {
      case 'weekly':
        return amt * 52 / 12;
      case 'bi-weekly':
        return amt * 26 / 12;
      case 'monthly':
        return amt;
      case 'annual':
        return amt / 12;
      default:
        return amt;
    }
  };

  return (
    <div style={{ background: theme.background, borderRadius: '16px', boxShadow: `0 4px 32px ${theme.border}`, padding: '2rem', maxWidth: 1100, margin: '2rem auto', color: theme.text }}>
      <h2 style={{ color: theme.header, fontWeight: 800, fontSize: '2rem', marginBottom: '1.5rem', letterSpacing: '0.01em' }}>Income Sources</h2>
      <button
        onClick={() => openModal()}
        style={{ background: theme.accent, color: theme.card, border: 'none', borderRadius: 8, padding: '0.7rem 1.4rem', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', marginBottom: '1.5rem', boxShadow: `0 2px 8px ${theme.border}` }}
      >
        Add Income Source
      </button>
      <div style={{ marginTop: '1rem', background: theme.card, borderRadius: '12px', boxShadow: `0 2px 8px ${theme.border}`, padding: '1.2rem', minHeight: 180, overflowX: 'auto' }}>
        {sources.length === 0 ? (
          <p style={{ color: theme.subtext, fontSize: '1.1rem' }}>No income sources found.</p>
        ) : (
          <table style={{ minWidth: 900, width: '100%', borderCollapse: 'collapse', fontSize: '0.98rem', tableLayout: 'auto' }}>
            <thead>
              <tr style={{ color: theme.header, fontWeight: 700, fontSize: '1rem', background: theme.background }}>
                <th style={{ padding: '0.4rem 0.3rem', textAlign: 'left', minWidth: 90 }}>Name</th>
                <th style={{ padding: '0.4rem 0.3rem', textAlign: 'left', minWidth: 70 }}>Type</th>
                <th style={{ padding: '0.4rem 0.3rem', textAlign: 'left', minWidth: 70 }}>Earner</th>
                <th style={{ padding: '0.4rem 0.3rem', textAlign: 'left', minWidth: 70 }}>Frequency</th>
                <th style={{ padding: '0.4rem 0.3rem', textAlign: 'right', minWidth: 80 }}>Expected</th>
                <th style={{ padding: '0.4rem 0.3rem', textAlign: 'right', minWidth: 80 }}>Actual</th>
                <th style={{ padding: '0.4rem 0.3rem', textAlign: 'right', minWidth: 90 }}>Variance</th>
                <th style={{ padding: '0.4rem 0.3rem', textAlign: 'right', minWidth: 90 }}>Monthly Eq.</th>
                <th style={{ padding: '0.4rem 0.3rem', textAlign: 'left', minWidth: 100 }}>Notes</th>
                <th style={{ padding: '0.4rem 0.3rem', textAlign: 'center', minWidth: 80 }}>Actions</th>
                <th style={{ padding: '0.4rem 0.3rem', textAlign: 'center', minWidth: 70 }}>History</th>
              </tr>
            </thead>
            <tbody>
              {sources.map((src) => {
                const actual = getActualIncome(src);
                const expected = getMonthlyEquivalent(src.expected_amount, src.frequency);
                const variance = getVariance(expected, actual);
                return (
                  <tr key={src.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                    <td style={{ padding: '0.4rem 0.3rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 120 }}>{src.name}</td>
                    <td style={{ padding: '0.4rem 0.3rem', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>{renderTypeIcon(src.type)}{src.type.charAt(0).toUpperCase() + src.type.slice(1)}</td>
                    <td style={{ padding: '0.4rem 0.3rem', whiteSpace: 'nowrap' }}>{src.earner}</td>
                    <td style={{ padding: '0.4rem 0.3rem', whiteSpace: 'nowrap' }}>{src.frequency}</td>
                    <td style={{ padding: '0.4rem 0.3rem', textAlign: 'right', whiteSpace: 'nowrap' }}>${Number(src.expected_amount).toLocaleString()}</td>
                    <td style={{ padding: '0.4rem 0.3rem', color: theme.success, fontWeight: 600, textAlign: 'right', whiteSpace: 'nowrap' }}>${actual.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                    <td style={{ padding: '0.4rem 0.3rem', color: variance.amt < 0 ? theme.error : theme.success, fontWeight: 600, textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {variance.amt >= 0 ? '+' : ''}${variance.amt.toLocaleString(undefined, { maximumFractionDigits: 2 })} ({variance.pct >= 0 ? '+' : ''}{variance.pct.toLocaleString(undefined, { maximumFractionDigits: 1 })}%)
                    </td>
                    <td style={{ padding: '0.4rem 0.3rem', color: theme.success, fontWeight: 600, textAlign: 'right', whiteSpace: 'nowrap' }}>${expected.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                    <td style={{ padding: '0.4rem 0.3rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 120 }}>{src.notes}</td>
                    <td style={{ padding: '0.4rem 0.3rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <button
                        onClick={() => openModal(src)}
                        style={{ background: theme.accent, color: theme.card, border: 'none', borderRadius: 6, padding: '0.3rem 0.7rem', fontWeight: 600, marginRight: 6, cursor: 'pointer', boxShadow: `0 1px 4px ${theme.border}`, fontSize: '0.95em' }}
                      >Edit</button>
                      <button
                        onClick={() => handleDelete(src.id)}
                        style={{ background: theme.error, color: theme.card, border: 'none', borderRadius: 6, padding: '0.3rem 0.7rem', fontWeight: 600, cursor: 'pointer', boxShadow: `0 1px 4px ${theme.border}`, fontSize: '0.95em' }}
                      >Delete</button>
                    </td>
                    <td style={{ padding: '0.4rem 0.3rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <button
                        onClick={() => setSelectedSource(selectedSource === src.id ? null : src.id)}
                        style={{ background: theme.background, color: theme.accent, border: `1px solid ${theme.accent}`, borderRadius: 6, padding: '0.2rem 0.7rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.95em' }}
                      >History</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Payment History Modal */}
      {selectedSource && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.32)', zIndex: 2100, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto' }}>
          <div style={{ background: theme.card, borderRadius: 16, boxShadow: `0 4px 32px ${theme.border}`, padding: 32, minWidth: 340, maxWidth: 500, color: theme.text, position: 'relative', textAlign: 'center', pointerEvents: 'auto' }}>
            <h3 style={{ color: theme.header, fontWeight: 800, fontSize: '1.2rem', marginBottom: 8 }}>Payment History</h3>
            <button onClick={() => setSelectedSource(null)} style={{ position: 'absolute', top: 12, right: 16, background: 'none', border: 'none', color: theme.error, fontWeight: 700, fontSize: 20, cursor: 'pointer' }}>×</button>
            <div style={{ marginTop: 16, maxHeight: 320, overflowY: 'auto', textAlign: 'left' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '1rem' }}>
                <thead>
                  <tr style={{ color: theme.header, fontWeight: 700 }}>
                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>Date</th>
                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>Amount</th>
                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {incomeTx.filter(tx => {
                    const src = sources.find(s => s.id === selectedSource);
                    if (!src) return false;
                    const desc = (tx.description || '').toLowerCase();
                    const cat = (tx.category || '').toLowerCase();
                    return (
                      desc.includes((src.name || '').toLowerCase()) ||
                      cat.includes((src.name || '').toLowerCase()) ||
                      (src.earner && desc.includes(src.earner.toLowerCase()))
                    );
                  }).map((tx, i) => (
                    <tr key={i}>
                      <td style={{ padding: '0.5rem' }}>{tx.date}</td>
                      <td style={{ padding: '0.5rem', color: theme.success }}>${Number(tx.amount).toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                      <td style={{ padding: '0.5rem' }}>{tx.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.32)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto' }}>
          <div style={{ background: theme.card, borderRadius: 16, boxShadow: `0 4px 32px ${theme.border}`, padding: 32, minWidth: 320, maxWidth: 400, color: theme.text, position: 'relative', textAlign: 'center', pointerEvents: 'auto' }}>
            <h3 style={{ color: theme.header, fontWeight: 800, fontSize: '1.2rem', marginBottom: 8 }}>{editing ? 'Edit Income Source' : 'Add Income Source'}</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: 12, pointerEvents: 'auto' }}>
              <input name="name" value={form.name} onChange={handleChange} required placeholder="Name" style={{ padding: '0.6rem', borderRadius: 8, border: `1px solid ${theme.border}`, fontSize: '1rem', background: theme.background, color: theme.text, pointerEvents: 'auto' }} />
              <select name="type" value={form.type} onChange={handleChange} required style={{ padding: '0.6rem', borderRadius: 8, border: `1px solid ${theme.border}`, fontSize: '1rem', background: theme.background, color: theme.text, pointerEvents: 'auto' }}>
                <option value="salary">Salary</option>
                <option value="freelance">Freelance</option>
                <option value="investment">Investment</option>
                <option value="rental">Rental</option>
                <option value="other">Other</option>
              </select>
              <input name="earner" value={form.earner} onChange={handleChange} required placeholder="Earner" style={{ padding: '0.6rem', borderRadius: 8, border: `1px solid ${theme.border}`, fontSize: '1rem', background: theme.background, color: theme.text, pointerEvents: 'auto' }} />
              <select name="frequency" value={form.frequency} onChange={handleChange} required style={{ padding: '0.6rem', borderRadius: 8, border: `1px solid ${theme.border}`, fontSize: '1rem', background: theme.background, color: theme.text, pointerEvents: 'auto' }}>
                <option value="weekly">Weekly</option>
                <option value="bi-weekly">Bi-Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="annual">Annual</option>
              </select>
              <input name="expected_amount" type="number" value={form.expected_amount} onChange={handleChange} required placeholder="Expected Amount" style={{ padding: '0.6rem', borderRadius: 8, border: `1px solid ${theme.border}`, fontSize: '1rem', background: theme.background, color: theme.text, pointerEvents: 'auto' }} />
              <input name="notes" value={form.notes} onChange={handleChange} placeholder="Notes" style={{ padding: '0.6rem', borderRadius: 8, border: `1px solid ${theme.border}`, fontSize: '1rem', background: theme.background, color: theme.text, pointerEvents: 'auto' }} />
              {error && <div style={{ color: theme.error, fontWeight: 600, marginTop: 4 }}>{error}</div>}
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: 8, pointerEvents: 'auto' }}>
                <button type="submit" style={{ background: theme.accent, color: theme.card, border: 'none', borderRadius: 8, padding: '0.6rem 1.2rem', fontWeight: 700, cursor: 'pointer', pointerEvents: 'auto' }}>{editing ? 'Update' : 'Add'}</button>
                <button type="button" onClick={closeModal} style={{ background: theme.border, color: theme.text, border: 'none', borderRadius: 8, padding: '0.6rem 1.2rem', fontWeight: 700, cursor: 'pointer', pointerEvents: 'auto' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
