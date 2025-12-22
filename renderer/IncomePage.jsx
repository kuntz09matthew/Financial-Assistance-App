

import React, { useState, useEffect } from 'react';

const defaultSource = {
  name: '',
  type: 'salary',
  earner: '',
  frequency: 'monthly',
  entryMode: 'monthly', // 'monthly' or 'perPaycheck'
  expected_amount: '', // monthly or per-paycheck, depending on entryMode
  notes: '',
  federal_tax: 12,
  state_tax: 5,
  social_security: 6.2,
  medicare: 1.45,
  other_deductions: 0
};

export default function IncomePage({ theme, isDarkMode }) {
  // Track which breakdowns are expanded
  const [expandedBreakdowns, setExpandedBreakdowns] = useState({});
    // Variable income analysis state
    const [variableIncome, setVariableIncome] = useState(null);

    useEffect(() => {
      window.electronAPI.invoke('get-variable-income-analysis').then((data) => {
        setVariableIncome(data && !data.error ? data : null);
      });
    }, []);

  function toggleBreakdown(id) {
    setExpandedBreakdowns(prev => ({ ...prev, [id]: !prev[id] }));
  }

  // State hooks
  const [sources, setSources] = useState([]);
  const [expandedSources, setExpandedSources] = useState([]);
  const [tooltip, setTooltip] = useState({ visible: false });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...defaultSource });
  const [withholding, setWithholding] = useState({ total: 0, net: 0 });
  const [error, setError] = useState('');
  const [incomeTx, setIncomeTx] = useState([]);
  // New: Earner statistics and tab state
  const [earnerStats, setEarnerStats] = useState(null);
  const [tab, setTab] = useState('sources'); // 'sources', 'earners', 'variable'

  // Dummy functions for illustration; replace with your actual logic
  // Calculate per-paycheck and monthly equivalent for any source
  function getPaycheckAndMonthly(src) {
    const freq = (src.frequency || '').toLowerCase();
    const entryMode = src.entryMode || 'monthly';
    const val = Number(src.expected_amount) || 0;
    let perPaycheck = 0, monthly = 0;
    if (entryMode === 'perPaycheck') {
      perPaycheck = val;
      switch (freq) {
        case 'weekly':
          monthly = perPaycheck * 52 / 12;
          break;
        case 'bi-weekly':
          monthly = perPaycheck * 26 / 12;
          break;
        case 'semi-monthly':
          monthly = perPaycheck * 2;
          break;
        case 'annual':
          monthly = perPaycheck * 1 / 12;
          break;
        default:
          monthly = perPaycheck;
      }
    } else {
      monthly = val;
      switch (freq) {
        case 'weekly':
          perPaycheck = monthly * 12 / 52;
          break;
        case 'bi-weekly':
          perPaycheck = monthly * 12 / 26;
          break;
        case 'semi-monthly':
          perPaycheck = monthly / 2;
          break;
        case 'annual':
          perPaycheck = monthly * 12 / 1;
          break;
        default:
          perPaycheck = monthly;
      }
    }
    return { perPaycheck, monthly };
  }
  // Calculate net income and deduction breakdown for a source
  function getNetBreakdown(src) {
    const gross = Number(src.expected_amount) || 0;
    const fed = gross * (Number(src.federal_tax) || 0) / 100;
    const state = gross * (Number(src.state_tax) || 0) / 100;
    const ss = gross * (Number(src.social_security) || 0) / 100;
    const medicare = gross * (Number(src.medicare) || 0) / 100;
    const other = Number(src.other_deductions) || 0;
    const total = fed + state + ss + medicare + other;
    const net = gross - total;
    return { gross, fed, state, ss, medicare, other, total, net };
  }
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

  // Fetch sources, incomeTx, and earner stats on mount
  useEffect(() => {
    window.electronAPI.invoke('get-income-sources').then((data) => {
      setSources(Array.isArray(data) ? data : []);
    });
    window.electronAPI.invoke('get-income-transactions').then((tx) => {
      setIncomeTx(Array.isArray(tx) ? tx : []);
    });
    window.electronAPI.invoke('get-earner-statistics').then((stats) => {
      setEarnerStats(stats && !stats.error ? stats : null);
    });
  }, []);

  return (
            <>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 24 }}>
                <button onClick={() => setTab('sources')} style={{ background: tab === 'sources' ? theme.accent : theme.background, color: tab === 'sources' ? theme.card : theme.text, border: `2px solid ${theme.accent}`, borderRadius: 8, padding: '0.7rem 2rem', fontWeight: 700, fontSize: '1.12rem', cursor: 'pointer', boxShadow: tab === 'sources' ? `0 2px 8px ${theme.border}` : 'none', transition: 'all 0.15s' }}>By Source</button>
                <button onClick={() => setTab('earners')} style={{ background: tab === 'earners' ? theme.accent : theme.background, color: tab === 'earners' ? theme.card : theme.text, border: `2px solid ${theme.accent}`, borderRadius: 8, padding: '0.7rem 2rem', fontWeight: 700, fontSize: '1.12rem', cursor: 'pointer', boxShadow: tab === 'earners' ? `0 2px 8px ${theme.border}` : 'none', transition: 'all 0.15s' }}>By Earner</button>
                <button onClick={() => setTab('variable')} style={{ background: tab === 'variable' ? theme.accent : theme.background, color: tab === 'variable' ? theme.card : theme.text, border: `2px solid ${theme.accent}`, borderRadius: 8, padding: '0.7rem 2rem', fontWeight: 700, fontSize: '1.12rem', cursor: 'pointer', boxShadow: tab === 'variable' ? `0 2px 8px ${theme.border}` : 'none', transition: 'all 0.15s' }}>Variable Income</button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <button
                  onClick={() => openModal()}
                  style={{ background: theme.accent, color: theme.card, border: 'none', borderRadius: 8, padding: '0.7rem 2rem', fontWeight: 700, fontSize: '1.12rem', cursor: 'pointer', boxShadow: `0 2px 8px ${theme.border}` }}
                >
                  Add Income Source
                </button>
              </div>
            {/* Variable Income Sub-Tab */}
            {tab === 'variable' && (
              <div style={{ marginBottom: 32, background: `linear-gradient(135deg, ${theme.accent}22 0%, ${theme.card} 100%)`, borderRadius: 18, boxShadow: `0 2px 16px ${theme.border}`, border: `2px solid ${theme.accent}22`, padding: '2rem 2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
                <h3 style={{ color: theme.header, fontWeight: 900, fontSize: '1.5rem', marginBottom: 12 }}>Advanced Variable Income Analytics</h3>
                {variableIncome && !variableIncome.empty ? (
                  <>
                    {/* Summary Banner */}
                    <div style={{ width: '100%', background: `linear-gradient(90deg, ${variableIncome.summary.stabilityColor} 0%, ${theme.accent} 100%)`, borderRadius: 14, padding: '1.2rem 2rem', marginBottom: 18, color: theme.card, fontWeight: 700, fontSize: '1.15rem', boxShadow: `0 2px 8px ${theme.border}` }}>
                      <span>Stability: <span style={{ color: variableIncome.summary.stabilityColor, background: theme.card, borderRadius: 8, padding: '0.2rem 0.7rem', fontWeight: 800 }}>{variableIncome.summary.stability}</span></span>
                      &nbsp;|&nbsp; Avg: ${variableIncome.summary.avg.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      &nbsp;|&nbsp; Min: ${variableIncome.summary.min.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      &nbsp;|&nbsp; Max: ${variableIncome.summary.max.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      &nbsp;|&nbsp; Coefficient of Variation: {(variableIncome.summary.cov * 100).toFixed(1)}%
                    </div>
                    {/* Source Cards */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, justifyContent: 'center', marginBottom: 18 }}>
                      {variableIncome.analytics.map((a, idx) => (
                        <div key={a.source.id || idx} style={{ minWidth: 260, maxWidth: 340, flex: '1 1 260px', background: theme.background, borderRadius: 14, boxShadow: `0 1px 8px ${theme.border}`, padding: '1.2rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 8, border: `2px solid ${a.stabilityColor}` }}>
                          <div style={{ fontWeight: 800, fontSize: '1.13rem', color: theme.header, marginBottom: 4 }}>{a.source.name}</div>
                          <div style={{ fontSize: '0.99rem', color: theme.subtext }}>{a.source.earner} &middot; {a.source.frequency} &middot; {a.source.type}</div>
                          <div style={{ margin: '10px 0 4px 0', width: '100%' }}>
                            <div style={{ fontSize: '0.97rem', color: theme.text }}><b>Avg:</b> ${a.avg.toLocaleString(undefined, { maximumFractionDigits: 2 })} <b>Median:</b> ${a.median.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                            <div style={{ fontSize: '0.97rem', color: theme.text }}><b>Min:</b> ${a.min.toLocaleString(undefined, { maximumFractionDigits: 2 })} <b>Max:</b> ${a.max.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                            <div style={{ fontSize: '0.97rem', color: theme.text }}><b>Stability:</b> <span style={{ color: a.stabilityColor }}>{a.stability}</span> <b>CoV:</b> {(a.cov * 100).toFixed(1)}%</div>
                            <div style={{ fontSize: '0.97rem', color: theme.text }}><b>Trend:</b> {a.trend}</div>
                          </div>
                          <div style={{ marginTop: 8, width: '100%' }}>
                            <div style={{ fontWeight: 700, color: theme.header, marginBottom: 2 }}>Current Month: <span style={{ color: theme.success }}>${a.currentMonth.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span></div>
                            <div style={{ fontWeight: 700, color: theme.header, marginBottom: 2 }}>Forecast (Next Month):</div>
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                              <div style={{ background: theme.card, borderRadius: 8, padding: '0.5rem 1rem', color: theme.text, fontWeight: 700 }}>Conservative: ${a.forecast.conservative.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                              <div style={{ background: theme.card, borderRadius: 8, padding: '0.5rem 1rem', color: theme.text, fontWeight: 700 }}>Expected: ${a.forecast.expected.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                              <div style={{ background: theme.card, borderRadius: 8, padding: '0.5rem 1rem', color: theme.text, fontWeight: 700 }}>Optimistic: ${a.forecast.optimistic.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                            </div>
                          </div>
                          {/* Recommendations */}
                          <div style={{ marginTop: 8, width: '100%' }}>
                            <div style={{ fontWeight: 700, color: theme.header, marginBottom: 2 }}>Recommendations:</div>
                            <ul style={{ color: theme.text, fontSize: '0.97rem', marginLeft: 18 }}>
                              {a.recommendations.map((rec, i) => (
                                <li key={i}>{rec}</li>
                              ))}
                            </ul>
                          </div>
                          {/* Monthly Stats Cards */}
                          <div style={{ marginTop: 8, width: '100%' }}>
                            <div style={{ fontWeight: 700, color: theme.header, marginBottom: 2 }}>Monthly Stats (Last 12 Months):</div>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                              {a.monthlyStats.map((m, idx) => (
                                <div key={idx} style={{ background: theme.card, borderRadius: 8, boxShadow: `0 1px 4px ${theme.border}22`, padding: '0.7rem 1rem', fontSize: '0.98rem', color: theme.text, minWidth: 90, textAlign: 'center' }}>
                                  <div style={{ fontWeight: 700, color: theme.info }}>{m.month}</div>
                                  <div style={{ color: theme.success }}>${m.total.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Chart.js Bar Chart (12 months, average line overlay) */}
                    <div style={{ width: '100%', marginTop: 18, background: theme.background, borderRadius: 14, boxShadow: `0 1px 8px ${theme.border}`, padding: '1.2rem 2rem' }}>
                      <h4 style={{ color: theme.header, fontWeight: 800, fontSize: '1.15rem', marginBottom: 8 }}>12-Month Variable Income Chart</h4>
                      {/* Chart.js integration placeholder: Replace with actual Chart.js Bar chart */}
                      <div style={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.subtext, fontSize: '1.1rem', background: theme.card, borderRadius: 12, boxShadow: `0 1px 4px ${theme.border}22` }}>
                        {/* Chart.js Bar chart goes here. Data: variableIncome.chartData */}
                        <span>Chart.js Bar Chart (12 months, average line overlay) will appear here.</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ color: theme.subtext, fontSize: '1.15rem', textAlign: 'center', marginTop: 32 }}>
                    <b>No variable income sources or history found.</b>
                    <br />
                    <span style={{ color: theme.info }}>Add freelance, investment, or other income sources to see analytics.</span>
                  </div>
                )}
              </div>
            )}
            {/* Tab Content */}
            {tab === 'sources' && (
              <>
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
                        const { perPaycheck, monthly } = getPaycheckAndMonthly(src);
                        const actual = perPaycheck; // For now, treat as actual per-paycheck
                        const expected = monthly;
                        const variance = getVariance(expected, actual * (src.frequency && src.frequency.toLowerCase() === 'monthly' ? 1 : 1));
                        const breakdown = getNetBreakdown({ ...src, expected_amount: perPaycheck });
                        const monthlyNet = getPaycheckAndMonthly({ ...src, expected_amount: breakdown.net }).monthly;
                        return (
                          <div key={src.id} style={{ background: `linear-gradient(135deg, ${theme.card} 80%, ${theme.accent}11 100%)`, borderRadius: 18, boxShadow: `0 2px 16px ${theme.border}`, border: `2px solid ${theme.accent}22`, padding: '1.5rem 1.2rem', display: 'flex', flexDirection: 'column', gap: 10, position: 'relative', transition: 'box-shadow 0.2s', marginBottom: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 6 }}>
                              <div style={{ fontSize: 32 }}>{renderTypeIcon(src.type)}</div>
                              <div>
                                <div style={{ fontWeight: 800, fontSize: '1.18rem', color: theme.header, letterSpacing: 0.2 }}>{src.name}</div>
                                <div style={{ fontSize: '0.99rem', color: theme.subtext }}>{src.earner} &middot; {src.frequency.charAt(0).toUpperCase() + src.frequency.slice(1)}</div>
                              </div>
                            </div>
                                        {/* Variable Income Analysis Section */}
                                        <div style={{ marginBottom: 32, background: theme.background, borderRadius: 14, boxShadow: `0 1px 8px ${theme.border}`, padding: '1.2rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                                          <div style={{ fontWeight: 800, fontSize: '1.18rem', color: theme.header }}>Variable Income Analysis</div>
                                          {variableIncome ? (
                                            <>
                                              <div style={{ fontSize: '1.05rem', color: theme.text }}>
                                                <b>Volatility (Std Dev):</b> ${variableIncome.volatility?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                                &nbsp;|&nbsp;
                                                <b>Projection (Avg Last 3 Months):</b> ${variableIncome.projection?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                              </div>
                                              <div style={{ marginTop: 12, width: '100%' }}>
                                                <div style={{ fontWeight: 700, color: theme.header, marginBottom: 4 }}>6-Month Trend</div>
                                                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                                                  {(Array.isArray(variableIncome?.trend) && variableIncome.trend.length > 0) ? (
                                                    variableIncome.trend.map((m, idx) => (
                                                      <div key={idx} style={{ background: theme.card, borderRadius: 8, boxShadow: `0 1px 4px ${theme.border}22`, padding: '0.7rem 1rem', fontSize: '0.98rem', color: theme.text, minWidth: 110, textAlign: 'center' }}>
                                                        <div style={{ fontWeight: 700, color: theme.info }}>{m.month}</div>
                                                        <div style={{ color: theme.success }}>${m.total.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                                                      </div>
                                                    ))
                                                  ) : (
                                                    <span style={{ color: theme.subtext, fontSize: '0.97rem', padding: '0.5rem 0.7rem' }}>No trend data available.</span>
                                                  )}
                                                </div>
                                              </div>
                                              <div style={{ marginTop: 12, width: '100%' }}>
                                                <div style={{ fontWeight: 700, color: theme.header, marginBottom: 4 }}>Sources</div>
                                                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                                                  {variableIncome.sources.map((src, idx) => (
                                                    <div key={src.id || idx} style={{ background: theme.card, borderRadius: 8, boxShadow: `0 1px 4px ${theme.border}22`, padding: '0.7rem 1rem', fontSize: '0.98rem', color: theme.text, minWidth: 110, textAlign: 'center' }}>
                                                      <div style={{ fontWeight: 700, color: theme.info }}>{src.name}</div>
                                                      <div style={{ color: theme.subtext }}>{src.earner} &middot; {src.frequency}</div>
                                                      <div style={{ color: theme.success }}>${Number(src.expected_amount).toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                                                    </div>
                                                  ))}
                                                  {variableIncome.sources.length === 0 && (
                                                    <span style={{ color: theme.subtext, fontSize: '0.97rem', padding: '0.5rem 0.7rem' }}>No variable income sources found.</span>
                                                  )}
                                                </div>
                                              </div>
                                            </>
                                          ) : (
                                            <div style={{ color: theme.subtext, fontSize: '1.05rem' }}>Loading variable income analysis...</div>
                                          )}
                                        </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 8 }}>
                              <span style={{ fontWeight: 700, color: theme.success, fontSize: '1.13rem' }}>Per Paycheck: ${perPaycheck.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                              <span style={{ fontWeight: 700, color: theme.info, fontSize: '1.13rem' }}>Monthly Equivalent: ${monthly.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                            </div>
                            {/* Collapsible Net Income Breakdown */}
                            <button
                              onClick={() => toggleBreakdown(src.id)}
                              style={{
                                background: theme.background,
                                color: theme.info,
                                border: `1px solid ${theme.info}`,
                                borderRadius: 8,
                                padding: '0.4rem 1rem',
                                fontWeight: 700,
                                fontSize: '1rem',
                                cursor: 'pointer',
                                marginBottom: 4,
                                alignSelf: 'flex-start',
                                boxShadow: `0 1px 4px ${theme.border}22`
                              }}
                              aria-expanded={!!expandedBreakdowns[src.id]}
                              aria-controls={`breakdown-${src.id}`}
                            >
                              {expandedBreakdowns[src.id] ? 'Hide Net Income Breakdown' : 'Show Net Income Breakdown'}
                            </button>
                            {expandedBreakdowns[src.id] && (
                              <div id={`breakdown-${src.id}`} style={{ marginBottom: 8, color: theme.text, fontSize: '1rem', background: theme.background, borderRadius: 10, border: `1px solid ${theme.border}`, padding: '0.7rem 1rem', boxShadow: `0 1px 4px ${theme.border}22` }}>
                                <div style={{ fontWeight: 700, color: theme.header, marginBottom: 2 }}>Net Income Breakdown</div>
                                <div style={{ fontSize: '0.98rem', color: theme.text }}>
                                  <b>Gross:</b> ${breakdown.gross.toLocaleString(undefined, { maximumFractionDigits: 2 })}<br />
                                  <b>Federal Tax:</b> -${breakdown.fed.toLocaleString(undefined, { maximumFractionDigits: 2 })}<br />
                                  <b>State Tax:</b> -${breakdown.state.toLocaleString(undefined, { maximumFractionDigits: 2 })}<br />
                                  <b>Social Security:</b> -${breakdown.ss.toLocaleString(undefined, { maximumFractionDigits: 2 })}<br />
                                  <b>Medicare:</b> -${breakdown.medicare.toLocaleString(undefined, { maximumFractionDigits: 2 })}<br />
                                  <b>Other Deductions:</b> -${breakdown.other.toLocaleString(undefined, { maximumFractionDigits: 2 })}<br />
                                  <b>Total Deductions:</b> -${breakdown.total.toLocaleString(undefined, { maximumFractionDigits: 2 })}<br />
                                  <b>Net Income:</b> <span style={{ color: theme.success }}>${breakdown.net.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span><br />
                                  <b>Monthly Net Equivalent:</b> <span style={{ color: theme.info }}>${monthlyNet.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                                </div>
                              </div>
                            )}
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
              </>
            )}
            {tab === 'earners' && (
              <>
                {/* Household summary */}
                {earnerStats && (
                  <div style={{ marginBottom: 24, background: theme.background, borderRadius: 14, boxShadow: `0 1px 8px ${theme.border}`, padding: '1.2rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontWeight: 800, fontSize: '1.18rem', color: theme.header }}>Household Income Summary</div>
                    <div style={{ fontSize: '1.05rem', color: theme.text }}>
                      <b>Total Gross:</b> ${earnerStats.householdGross?.toLocaleString(undefined, { maximumFractionDigits: 2 })} &nbsp;|&nbsp;
                      <b>Total Net:</b> ${earnerStats.householdNet?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </div>
                  </div>
                )}
                {/* Earner cards */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center' }}>
                  {earnerStats && earnerStats.earners.map((e) => (
                    <div key={e.earner} style={{ minWidth: 260, maxWidth: 340, flex: '1 1 260px', background: theme.background, borderRadius: 14, boxShadow: `0 1px 8px ${theme.border}`, padding: '1.2rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 8, border: e.earner === 'Unassigned' ? `2px solid ${theme.error}` : `2px solid ${theme.accent}33` }}>
                      <div style={{ fontWeight: 800, fontSize: '1.13rem', color: e.earner === 'Unassigned' ? theme.error : theme.header, marginBottom: 4 }}>{e.earner}</div>
                      <div style={{ width: '100%', margin: '8px 0' }}>
                        <div style={{ fontSize: '0.99rem', color: theme.text }}><b>Sources:</b> {e.count}</div>
                        <div style={{ fontSize: '0.99rem', color: theme.text }}><b>Gross:</b> ${e.gross.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                        <div style={{ fontSize: '0.99rem', color: theme.text }}><b>Net:</b> ${e.net.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                        <div style={{ margin: '10px 0 4px 0', width: '100%' }}>
                          <div style={{ fontSize: '0.97rem', color: theme.subtext, marginBottom: 2 }}>Contribution to Household Gross</div>
                          <div style={{ background: theme.card, borderRadius: 8, height: 18, width: '100%', boxShadow: `0 1px 4px ${theme.border}22`, border: `1px solid ${theme.border}`, overflow: 'hidden', marginBottom: 2 }}>
                            <div style={{ height: '100%', width: `${e.grossPct.toFixed(1)}%`, background: e.earner === 'Unassigned' ? theme.error : theme.accent, borderRadius: 8, transition: 'width 0.3s' }}></div>
                          </div>
                          <div style={{ fontSize: '0.97rem', color: theme.subtext, marginBottom: 2 }}>Contribution to Household Net</div>
                          <div style={{ background: theme.card, borderRadius: 8, height: 18, width: '100%', boxShadow: `0 1px 4px ${theme.border}22`, border: `1px solid ${theme.border}`, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${e.netPct.toFixed(1)}%`, background: e.earner === 'Unassigned' ? theme.error : theme.success, borderRadius: 8, transition: 'width 0.3s' }}></div>
                          </div>
                        </div>
                      </div>
                      {/* List sources for this earner */}
                      <div style={{ width: '100%', marginTop: 8 }}>
                        {e.sources.map((src, idx) => (
                          <div key={src.id || idx} style={{ background: theme.card, borderRadius: 8, boxShadow: `0 1px 4px ${theme.border}22`, padding: '0.7rem 1rem', marginBottom: 6, fontSize: '0.98rem', color: theme.text }}>
                            <b>{src.name}</b> <span style={{ color: theme.subtext }}>({src.type}, {src.frequency})</span><br />
                            <span style={{ color: theme.info }}>Gross: ${Number(src.expected_amount).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                          </div>
                        ))}
                      </div>
                      {e.earner === 'Unassigned' && (
                        <div style={{ color: theme.error, fontWeight: 700, marginTop: 8, fontSize: '1.01rem' }}>⚠️ Please assign an earner to these sources!</div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
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
                      <option value="semi-monthly">Semi-Monthly (2x/month)</option>
                      <option value="monthly">Monthly</option>
                      <option value="annual">Annual</option>
                    </select>
                    {/* Entry mode toggle */}
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 4 }}>
                      <label style={{ fontWeight: 600, color: theme.text }}>
                        <input
                          type="radio"
                          name="entryMode"
                          value="monthly"
                          checked={form.entryMode === 'monthly'}
                          onChange={() => setForm(f => ({ ...f, entryMode: 'monthly', expected_amount: '' }))}
                          style={{ marginRight: 6 }}
                        />
                        Enter Monthly Amount
                      </label>
                      <label style={{ fontWeight: 600, color: theme.text }}>
                        <input
                          type="radio"
                          name="entryMode"
                          value="perPaycheck"
                          checked={form.entryMode === 'perPaycheck'}
                          onChange={() => setForm(f => ({ ...f, entryMode: 'perPaycheck', expected_amount: '' }))}
                          style={{ marginRight: 6 }}
                        />
                        Enter Per-Paycheck Amount
                      </label>
                    </div>
                    <input
                      name="expected_amount"
                      type="number"
                      value={form.expected_amount}
                      onChange={handleChange}
                      required
                      placeholder={form.entryMode === 'perPaycheck' ? 'Amount Per Paycheck' : 'Monthly Amount'}
                      style={{ padding: '0.6rem', borderRadius: 8, border: `1px solid ${theme.border}`, fontSize: '1rem', background: theme.background, color: theme.text, pointerEvents: 'auto' }}
                    />
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

    </>
  );
}
