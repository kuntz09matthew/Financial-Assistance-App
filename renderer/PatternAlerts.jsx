
import React, { useState, useEffect } from 'react';

function getReadAlertKeys() {
  try {
    return JSON.parse(localStorage.getItem('patternAlertsRead') || '[]');
  } catch {
    return [];
  }
}

function setReadAlertKeys(keys) {
  localStorage.setItem('patternAlertsRead', JSON.stringify(keys));
}

export default function PatternAlerts({ alerts, theme }) {
  const [expanded, setExpanded] = useState(null);
  const [readKeys, setReadKeys] = useState(getReadAlertKeys());

  // Each alert gets a unique key based on category, period, and message
  const getAlertKey = alert => `${alert.category}|${alert.period}|${alert.message}`;

  // Filter out read alerts
  const visibleAlerts = alerts?.filter(a => !readKeys.includes(getAlertKey(a))) || [];

  useEffect(() => {
    setReadKeys(getReadAlertKeys());
  }, [alerts]);

  const markAsRead = (alert) => {
    const key = getAlertKey(alert);
    const updated = [...readKeys, key];
    setReadKeys(updated);
    setReadAlertKeys(updated);
    setExpanded(null);
  };

  if (!alerts || alerts.length === 0 || visibleAlerts.length === 0) {
    return <div style={{ color: theme.subtext, marginTop: 16 }}>No new spending pattern alerts.</div>;
  }

  // Priority-based color and icon
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return { bg: theme.errorBg, color: theme.error, border: theme.error };
      case 'Urgent': return { bg: theme.warningBg, color: theme.warning, border: theme.warning };
      case 'High': return { bg: theme.warningBg, color: theme.warning, border: theme.warning };
      case 'Medium': return { bg: theme.accentBg || theme.card, color: theme.accent, border: theme.accent };
      case 'Low': return { bg: theme.card, color: theme.text, border: theme.border };
      case 'Positive': return { bg: theme.successBg, color: theme.success, border: theme.success };
      default: return { bg: theme.card, color: theme.text, border: theme.border };
    }
  };
  const getPriorityIcon = (priority, positive) => {
    if (positive || priority === 'Positive') return '👍';
    if (priority === 'Critical') return '🛑';
    if (priority === 'Urgent') return '⚠️';
    if (priority === 'High') return '⚡';
    if (priority === 'Medium') return '🔔';
    if (priority === 'Low') return 'ℹ️';
    return '🔔';
  };
  return (
    <div style={{ marginTop: 8 }}>
      {visibleAlerts.map((alert, idx) => {
        const isOpen = expanded === idx;
        const { bg, color, border } = getPriorityColor(alert.priority);
        return (
          <div
            key={getAlertKey(alert)}
            style={{
              background: bg,
              color: color,
              border: `2px solid ${border}`,
              borderRadius: 10,
              marginBottom: 10,
              boxShadow: `0 1px 4px ${theme.border}`,
              cursor: 'pointer',
              transition: 'background 0.2s',
              padding: isOpen ? '1.1rem 1.3rem' : '0.7rem 1.1rem',
              minHeight: 0,
              outline: isOpen ? `2px solid ${theme.accent}` : 'none',
            }}
            tabIndex={0}
            aria-label={alert.message}
            onClick={() => setExpanded(isOpen ? null : idx)}
            onKeyPress={e => (e.key === 'Enter' || e.key === ' ') && setExpanded(isOpen ? null : idx)}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>
                {getPriorityIcon(alert.priority, alert.positive)} {alert.category} <span style={{ fontWeight: 500, fontSize: '0.98rem', marginLeft: 6 }}>{alert.period === 'week' ? '(This Week)' : '(This Month)'}</span>
              </div>
              <button
                onClick={e => { e.stopPropagation(); markAsRead(alert); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: theme.subtext,
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  marginLeft: 12,
                  padding: 0,
                  outline: 'none',
                }}
                aria-label="Mark as read"
                tabIndex={0}
              >×</button>
            </div>
            <div style={{ fontSize: '0.99rem', fontWeight: 500, marginTop: 2, marginBottom: isOpen ? 8 : 0, color: theme.text }}>
              {alert.message}
            </div>
            {isOpen && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: '0.97rem', color: theme.subtext, marginBottom: 6 }}>{alert.recommendation}</div>
                <div style={{ fontSize: '0.97rem', marginBottom: 6 }}>
                  <b>Current Spending:</b> ${alert.current.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<br />
                  <b>Historical Avg:</b> ${alert.average.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<br />
                  <b>Variance:</b> {Math.round(alert.variance * 100)}%
                  <br /><b>Priority:</b> {alert.priority}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
