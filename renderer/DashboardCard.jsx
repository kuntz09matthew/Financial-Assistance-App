import React from 'react';

const iconMap = {
  total: '💰',
  checking: '💵',
  savings: '🏦',
  credit: '💳',
  fixed: '🏠',
  expenses: '💸',
  savingsNet: '💰',
  warning: '🚨',
  success: '✅',
};

export default function DashboardCard({ label, value, icon, theme, border, children }) {
  return (
    <div style={{
      background: theme.card,
      borderRadius: '16px',
      boxShadow: `0 2px 12px rgba(44, 44, 84, 0.12)`,
      padding: '1.5rem',
      minWidth: '180px',
      minHeight: '120px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'center',
      border: border || `1px solid ${theme.border}`,
      position: 'relative',
    }}>
      <span style={{ fontSize: '2rem', marginBottom: '0.5rem', color: theme.accent }}>{iconMap[icon] || icon}</span>
      <div style={{ fontSize: '1.1rem', color: theme.accent, fontWeight: 600, marginBottom: '0.25rem' }}>{label}</div>
      <div style={{ fontSize: '1.7rem', color: theme.text, fontWeight: 700 }}>{value}</div>
      {children}
    </div>
  );
}
