
import React, { useEffect, useState } from 'react';
import DashboardCard from './DashboardCard';
import { lightTheme, darkTheme } from './theme';

export default function SavingsPage({ isDarkMode }) {
  const theme = isDarkMode ? darkTheme : lightTheme;
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (window.electronAPI && window.electronAPI.invoke) {
      window.electronAPI.invoke('get-financial-analysis')
        .then((result) => {
          if (result && !result.error) {
            setAnalysis(result);
          } else {
            setError(result?.error || 'Unknown error');
          }
        })
        .catch((err) => setError(err.message));
    } else {
      setError('IPC not available');
    }
  }, []);

  // Find emergency fund recommendation and stats
  let emergencyRec = null;
  let savingsBalance = 0;
  let emergencyTarget = 0;
  let progress = 0;
  if (analysis && analysis.recommendations) {
    emergencyRec = analysis.recommendations.find(r => r.title && r.title.toLowerCase().includes('emergency fund'));
    if (analysis.balances) {
      savingsBalance = analysis.balances.filter(acc => acc.type === 'Savings').reduce((sum, acc) => sum + acc.balance, 0);
    }
    if (emergencyRec && emergencyRec.message) {
      // Extract target from message (e.g., $5400)
      const match = emergencyRec.message.match(/\$([\d,]+(\.\d{2})?)/);
      if (match) emergencyTarget = parseFloat(match[1].replace(/,/g, ''));
    }
    if (emergencyTarget > 0) {
      progress = Math.min(1, savingsBalance / emergencyTarget);
    }
  }

  return (
    <div>
      <h2 style={{ color: theme.header, fontWeight: 800, fontSize: '2rem', marginBottom: '1.2rem' }}>Savings</h2>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <DashboardCard
          label="Emergency Fund Progress"
          value={
            emergencyTarget > 0
              ? `$${savingsBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })} / $${emergencyTarget.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
              : 'Loading...'
          }
          icon="savings"
          theme={theme}
          border={`2.5px solid ${theme.success}`}
        >
          <div style={{ width: '100%', marginTop: 12, marginBottom: 8 }}>
            <div style={{ height: 16, background: theme.border, borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ width: `${Math.round(progress * 100)}%`, height: 16, background: theme.success, borderRadius: 8, transition: 'width 0.5s' }}></div>
            </div>
            <div style={{ marginTop: 6, color: theme.subtext, fontWeight: 600, fontSize: '1.01rem' }}>
              {progress >= 1
                ? 'Goal reached!'
                : `You have saved ${Math.round(progress * 100)}% of your 3-month emergency fund goal.`}
            </div>
          </div>
          {emergencyRec && (
            <div style={{ marginTop: 10, color: theme.text, fontSize: '1.05rem' }}>
              <b>Recommendation:</b> {emergencyRec.message}
              <ul style={{ margin: '8px 0 0 1.2em', color: theme.subtext, fontSize: '0.98rem' }}>
                {emergencyRec.actions && emergencyRec.actions.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            </div>
          )}
          {error && <div style={{ color: theme.error, marginTop: 8 }}>{error}</div>}
        </DashboardCard>
      </div>
    </div>
  );
}
