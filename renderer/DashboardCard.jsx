import React from 'react';

// iconMap: maps card type to emoji icon for DashboardCard
// 'perday' is used for the "Money left per day" calculator card
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
  perday: '📅', // for Money Left Per Day
};

export default function DashboardCard({ label, value, icon, theme, border, children }) {
  // Use a brighter shadow for dark mode, subtle for light mode
  const isDark = theme.background === '#181c2a';
  const baseShadow = isDark
    ? '0 6px 24px 0 rgba(120,130,180,0.32), 0 1.5px 4px 0 rgba(120,130,180,0.18)'
    : '0 6px 24px 0 rgba(44,44,84,0.18), 0 1.5px 4px 0 rgba(44,44,84,0.10)';
  const hoverShadow = isDark
    ? '0 12px 32px 0 rgba(120,130,180,0.38), 0 2px 8px 0 rgba(120,130,180,0.22)'
    : '0 12px 32px 0 rgba(44,44,84,0.22), 0 2px 8px 0 rgba(44,44,84,0.13)';
  return (
    <div
      style={{
        background: theme.card,
        borderRadius: '18px',
        boxShadow: baseShadow,
        padding: '1.7rem',
        minWidth: '180px',
        minHeight: '120px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        border: border || `2.5px solid ${theme.border}`,
        position: 'relative',
        transition: 'box-shadow 0.2s, transform 0.2s',
        willChange: 'box-shadow, transform',
        margin: '0.5rem 0',
        zIndex: 1,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = hoverShadow;
        e.currentTarget.style.transform = 'translateY(-2px) scale(1.015)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = baseShadow;
        e.currentTarget.style.transform = 'none';
      }}
    >
      <span style={{ fontSize: '2.1rem', marginBottom: '0.5rem', color: theme.accent, textShadow: isDark ? '0 1px 8px rgba(120,130,180,0.18)' : '0 1px 4px rgba(44,44,84,0.10)' }}>{iconMap[icon] || icon}</span>
      <div style={{ fontSize: '1.13rem', color: theme.accent, fontWeight: 600, marginBottom: '0.25rem', letterSpacing: '0.01em' }}>{label}</div>
      <div style={{ fontSize: '1.8rem', color: theme.text, fontWeight: 700, textShadow: isDark ? '0 1px 8px rgba(120,130,180,0.13)' : '0 1px 4px rgba(44,44,84,0.08)' }}>{value}</div>
      {children}
    </div>
  );
}
