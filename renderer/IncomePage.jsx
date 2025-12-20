

import React, { useState, useEffect } from 'react';

const defaultSource = {
  name: '',
  type: 'salary',
  earner: '',
  frequency: 'monthly',
  expected_amount: '',
  notes: '',
  federal_tax: 12,
  state_tax: 5,
  social_security: 6.2,
  medicare: 1.45,
  other_deductions: 0
};

export default function IncomePage({ theme, isDarkMode }) {

  // State hooks
  const [sources, setSources] = useState([]);
  const [expandedSources, setExpandedSources] = useState([]);
  const [tooltip, setTooltip] = useState({ visible: false });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...defaultSource });
  const [withholding, setWithholding] = useState({
    total: 0,
    net: 0
  });
  const [error, setError] = useState('');
  const [incomeTx, setIncomeTx] = useState([]);

  // Dummy functions for illustration; replace with your actual logic
  function getActualIncome(src) { return Number(src.expected_amount) || 0; }
  function getMonthlyEquivalent(amount, freq) { return Number(amount) || 0; }
  function getVariance(expected, actual) {
    const amt = actual - expected;
    const pct = expected ? (amt / expected) * 100 : 0;
    return { amt, pct };
  }
  function renderTypeIcon(type) { return <span style={{ fontSize: 22 }}>{type === 'salary' ? '💼' : '💰'}</span>; }

  function openModal(src) {
    setModalOpen(true);
    if (src) {
      setEditing(true);
      setForm(src);
    } else {
      setEditing(false);
      setForm({ ...defaultSource });
    }
    setError('');
  }
  function closeModal() {
    setModalOpen(false);
    setEditing(false);
    setForm({ ...defaultSource });
    setError('');
  }
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  // Calculate withholding in real time
  useEffect(() => {
    const gross = Number(form.expected_amount) || 0;
    const fed = gross * (Number(form.federal_tax) || 0) / 100;
    const state = gross * (Number(form.state_tax) || 0) / 100;
    const ss = gross * (Number(form.social_security) || 0) / 100;
    const medicare = gross * (Number(form.medicare) || 0) / 100;
    const other = Number(form.other_deductions) || 0;
    const total = fed + state + ss + medicare + other;
    const net = gross - total;
    setWithholding({ total, net });
  }, [form.expected_amount, form.federal_tax, form.state_tax, form.social_security, form.medicare, form.other_deductions]);
  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.earner || !form.expected_amount) {
      setError('Please fill all required fields.');
      return;
    }
    if (editing) {
      setSources(sources.map(s => (s.id === form.id ? form : s)));
    } else {
      setSources([...sources, { ...form, id: Date.now() }]);
    }
    closeModal();
  }
  function handleDelete(id) {
    setSources(sources.filter(s => s.id !== id));
  }

  // Fetch sources and incomeTx on mount using Electron API
  useEffect(() => {
    // Use invoke for IPC calls as defined in preload.js
    window.electronAPI.invoke('get-income-sources').then((data) => {
      setSources(Array.isArray(data) ? data : []);
    });
    window.electronAPI.invoke('get-income-transactions').then((tx) => {
      setIncomeTx(Array.isArray(tx) ? tx : []);
    });
  }, []);

  return (
    <>
      <div style={{ background: theme.background, minHeight: '100vh', color: theme.text }}>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '2.5rem' }}>
          <div style={{ maxWidth: 700, width: '100%', background: theme.card, borderRadius: 18, boxShadow: `0 4px 24px ${theme.border}`, border: `2.5px solid ${theme.accent}33`, padding: '2rem 2.5rem', margin: '0 auto', transition: 'box-shadow 0.2s' }}>
            <h2 style={{ color: theme.header, fontWeight: 900, fontSize: '2.1rem', marginBottom: '1.2rem', textAlign: 'center', letterSpacing: '0.01em', textShadow: `0 2px 12px ${theme.background}` }}>Income Sources</h2>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <button
                onClick={() => openModal()}
                style={{ background: theme.accent, color: theme.card, border: 'none', borderRadius: 8, padding: '0.7rem 1.4rem', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', boxShadow: `0 2px 8px ${theme.border}` }}
              >
                Add Income Source
              </button>
            </div>
            <div style={{ width: '100%', borderRadius: 12, boxShadow: `0 1px 8px ${theme.border}` }}>
              {sources.length === 0 ? (
                <p style={{ color: theme.subtext, fontSize: '1.1rem', textAlign: 'center', marginTop: 32 }}>No income sources found.</p>
              ) : (
                <div className="dashboard-grid" style={{ marginBottom: 8 }}>
                  {sources.map((src) => {
                    const actual = getActualIncome(src);
                    const expected = getMonthlyEquivalent(src.expected_amount, src.frequency);
                    const variance = getVariance(expected, actual);
                    return (
                      <div key={src.id} style={{ background: `linear-gradient(135deg, ${theme.card} 80%, ${theme.accent}11 100%)`, borderRadius: 18, boxShadow: `0 2px 16px ${theme.border}`, border: `2px solid ${theme.accent}22`, padding: '1.5rem 1.2rem', display: 'flex', flexDirection: 'column', gap: 10, position: 'relative', transition: 'box-shadow 0.2s', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 6 }}>
                          <div style={{ fontSize: 32 }}>{renderTypeIcon(src.type)}</div>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '1.18rem', color: theme.header, letterSpacing: 0.2 }}>{src.name}</div>
                            <div style={{ fontSize: '0.99rem', color: theme.subtext }}>{src.earner} &middot; {src.frequency.charAt(0).toUpperCase() + src.frequency.slice(1)}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 8 }}>
                          <span style={{ fontWeight: 700, color: theme.success, fontSize: '1.13rem' }}>Actual: ${actual.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                          <span style={{ fontSize: '0.99rem', color: variance.amt < 0 ? theme.error : theme.success, fontWeight: 600 }}>
                            {variance.amt >= 0 ? '+' : ''}{variance.amt.toLocaleString(undefined, { maximumFractionDigits: 2 })} ({variance.pct >= 0 ? '+' : ''}{variance.pct.toLocaleString(undefined, { maximumFractionDigits: 1 })}%)
                          </span>
                          <span style={{ fontSize: '0.97rem', color: theme.subtext }}>Monthly Eq: ${expected.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                        </div>
                        <div style={{ marginBottom: 8, color: theme.subtext, fontSize: '1rem' }}><strong>Notes:</strong> {src.notes || <span style={{ color: theme.error }}>None</span>}</div>
                        <div style={{ marginBottom: 4 }}>
                          <strong style={{ color: theme.header, fontSize: '1.01rem' }}>Payment History:</strong>
                          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'row', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                            {incomeTx.filter(tx => {
                              const desc = (tx.description || '').toLowerCase();
                              const cat = (tx.category || '').toLowerCase();
                              return (
                                desc.includes((src.name || '').toLowerCase()) ||
                                cat.includes((src.name || '').toLowerCase()) ||
                                (src.earner && desc.includes(src.earner.toLowerCase()))
                              );
                            }).map((tx, i) => (
                              <div key={i} style={{ minWidth: 110, background: theme.background, borderRadius: 8, border: `1px solid ${theme.border}`, boxShadow: `0 1px 4px ${theme.border}33`, padding: '0.5rem 0.7rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', fontSize: '0.97rem' }}>
                                <div style={{ fontWeight: 700, color: theme.success }}>${Number(tx.amount).toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                                <div style={{ color: theme.header }}>{tx.date}</div>
                                <div style={{ color: theme.subtext, fontSize: '0.93rem', marginTop: 2 }}>{tx.description}</div>
                              </div>
                            ))}
                            {incomeTx.filter(tx => {
                              const desc = (tx.description || '').toLowerCase();
                              const cat = (tx.category || '').toLowerCase();
                              return (
                                desc.includes((src.name || '').toLowerCase()) ||
                                cat.includes((src.name || '').toLowerCase()) ||
                                (src.earner && desc.includes(src.earner.toLowerCase()))
                              );
                            }).length === 0 && (
                              <span style={{ color: theme.subtext, fontSize: '0.97rem', padding: '0.5rem 0.7rem' }}>No payments found.</span>
                            )}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                          <button
                            onClick={() => openModal(src)}
                            style={{ background: theme.accent, color: theme.card, border: 'none', borderRadius: 8, padding: '0.5rem 1.1rem', fontWeight: 700, cursor: 'pointer', boxShadow: `0 1px 4px ${theme.border}`, fontSize: '1em' }}
                          >Edit</button>
                          <button
                            onClick={() => handleDelete(src.id)}
                            style={{ background: theme.error, color: theme.card, border: 'none', borderRadius: 8, padding: '0.5rem 1.1rem', fontWeight: 700, cursor: 'pointer', boxShadow: `0 1px 4px ${theme.border}`, fontSize: '1em' }}
                          >Delete</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {/* Tooltip for explanations */}
            {tooltip.visible && (
              <div
                style={{
                  position: 'fixed',
                  left: tooltip.position.x,
                  top: tooltip.position.y + 8,
                  background: theme.background,
                  color: theme.text,
                  border: `1px solid ${theme.border}`,
                  borderRadius: 8,
                  padding: '0.7rem 1.1rem',
                  fontSize: '0.98rem',
                  zIndex: 100,
                  boxShadow: `0 2px 8px ${theme.border}`
                }}
                onClick={() => setTooltip({ ...tooltip, visible: false })}
              >
                {tooltip.message}
              </div>
            )}
            {/* Payment History Modal */}
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8, background: theme.background, borderRadius: 8, padding: '0.7rem 1rem', border: `1px solid ${theme.border}` }}>
                      <div style={{ fontWeight: 700, color: theme.header, marginBottom: 2 }}>Tax Withholding</div>
                      <label style={{ fontSize: '0.98rem', color: theme.text }}>
                        Federal Tax (%):
                        <input name="federal_tax" type="number" min="0" max="50" step="0.01" value={form.federal_tax} onChange={handleChange} style={{ marginLeft: 8, width: 70, borderRadius: 6, border: `1px solid ${theme.border}`, padding: '0.3rem 0.5rem', background: theme.background, color: theme.text }} />
                      </label>
                      <label style={{ fontSize: '0.98rem', color: theme.text }}>
                        State Tax (%):
                        <input name="state_tax" type="number" min="0" max="20" step="0.01" value={form.state_tax} onChange={handleChange} style={{ marginLeft: 8, width: 70, borderRadius: 6, border: `1px solid ${theme.border}`, padding: '0.3rem 0.5rem', background: theme.background, color: theme.text }} />
                      </label>
                      <label style={{ fontSize: '0.98rem', color: theme.text }}>
                        Social Security (6.2%):
                        <input name="social_security" type="number" min="0" max="10" step="0.01" value={form.social_security} onChange={handleChange} style={{ marginLeft: 8, width: 70, borderRadius: 6, border: `1px solid ${theme.border}`, padding: '0.3rem 0.5rem', background: theme.background, color: theme.text }} />
                      </label>
                      <label style={{ fontSize: '0.98rem', color: theme.text }}>
                        Medicare (1.45%):
                        <input name="medicare" type="number" min="0" max="5" step="0.01" value={form.medicare} onChange={handleChange} style={{ marginLeft: 8, width: 70, borderRadius: 6, border: `1px solid ${theme.border}`, padding: '0.3rem 0.5rem', background: theme.background, color: theme.text }} />
                      </label>
                      <label style={{ fontSize: '0.98rem', color: theme.text }}>
                        Other Deductions ($):
                        <input name="other_deductions" type="number" min="0" step="0.01" value={form.other_deductions} onChange={handleChange} style={{ marginLeft: 8, width: 90, borderRadius: 6, border: `1px solid ${theme.border}`, padding: '0.3rem 0.5rem', background: theme.background, color: theme.text }} />
                      </label>
                      <div style={{ marginTop: 6, color: theme.subtext, fontSize: '0.98rem' }}>
                        <strong>Total Withholding:</strong> ${withholding.total.toLocaleString(undefined, { maximumFractionDigits: 2 })}<br />
                        <strong>Net Income:</strong> ${withholding.net.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </div>
                    </div>
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
        </div>
      </div>
    </>
  );
}
