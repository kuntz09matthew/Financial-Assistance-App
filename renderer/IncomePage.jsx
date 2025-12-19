
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

  useEffect(() => {
    window.electronAPI.invoke('get-income-sources').then((data) => {
      if (Array.isArray(data)) setSources(data);
    });
  }, [modalOpen]);

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
    <div style={{ background: theme.background, borderRadius: '16px', boxShadow: `0 4px 32px ${theme.border}`, padding: '2.5rem', maxWidth: 900, margin: '2rem auto', color: theme.text }}>
      <h2 style={{ color: theme.header, fontWeight: 800, fontSize: '2rem', marginBottom: '1.5rem', letterSpacing: '0.01em' }}>Income Sources</h2>
      <button
        onClick={() => openModal()}
        style={{ background: theme.accent, color: theme.card, border: 'none', borderRadius: 8, padding: '0.7rem 1.4rem', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', marginBottom: '1.5rem', boxShadow: `0 2px 8px ${theme.border}` }}
      >
        Add Income Source
      </button>
      <div style={{ marginTop: '1rem', background: theme.card, borderRadius: '12px', boxShadow: `0 2px 8px ${theme.border}`, padding: '2rem', minHeight: 180 }}>
        {sources.length === 0 ? (
          <p style={{ color: theme.subtext, fontSize: '1.1rem' }}>No income sources found.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '1.08rem' }}>
            <thead>
              <tr style={{ color: theme.header, fontWeight: 700, fontSize: '1.1rem', background: theme.background }}>
                <th style={{ padding: '0.7rem 0.5rem', textAlign: 'left' }}>Name</th>
                <th style={{ padding: '0.7rem 0.5rem', textAlign: 'left' }}>Type</th>
                <th style={{ padding: '0.7rem 0.5rem', textAlign: 'left' }}>Earner</th>
                <th style={{ padding: '0.7rem 0.5rem', textAlign: 'left' }}>Frequency</th>
                <th style={{ padding: '0.7rem 0.5rem', textAlign: 'left' }}>Expected Amount</th>
                <th style={{ padding: '0.7rem 0.5rem', textAlign: 'left' }}>Monthly Equivalent</th>
                <th style={{ padding: '0.7rem 0.5rem', textAlign: 'left' }}>Notes</th>
                <th style={{ padding: '0.7rem 0.5rem', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sources.map((src) => (
                <tr key={src.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                  <td style={{ padding: '0.7rem 0.5rem' }}>{src.name}</td>
                  <td style={{ padding: '0.7rem 0.5rem', display: 'flex', alignItems: 'center' }}>{renderTypeIcon(src.type)}{src.type.charAt(0).toUpperCase() + src.type.slice(1)}</td>
                  <td style={{ padding: '0.7rem 0.5rem' }}>{src.earner}</td>
                  <td style={{ padding: '0.7rem 0.5rem' }}>{src.frequency}</td>
                  <td style={{ padding: '0.7rem 0.5rem' }}>${Number(src.expected_amount).toLocaleString()}</td>
                  <td style={{ padding: '0.7rem 0.5rem', color: theme.success, fontWeight: 600 }}>${getMonthlyEquivalent(src.expected_amount, src.frequency).toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                  <td style={{ padding: '0.7rem 0.5rem' }}>{src.notes}</td>
                  <td style={{ padding: '0.7rem 0.5rem', textAlign: 'center' }}>
                    <button
                      onClick={() => openModal(src)}
                      style={{ background: theme.accent, color: theme.card, border: 'none', borderRadius: 6, padding: '0.4rem 1rem', fontWeight: 600, marginRight: 8, cursor: 'pointer', boxShadow: `0 1px 4px ${theme.border}` }}
                    >Edit</button>
                    <button
                      onClick={() => handleDelete(src.id)}
                      style={{ background: theme.error, color: theme.card, border: 'none', borderRadius: 6, padding: '0.4rem 1rem', fontWeight: 600, cursor: 'pointer', boxShadow: `0 1px 4px ${theme.border}` }}
                    >Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

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
