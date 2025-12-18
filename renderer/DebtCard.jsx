import React from 'react';

const iconMap = {
  credit: '💳',
  loan: '💰',
};

export default function DebtCard({ debt, theme, children }) {
  const isDark = theme.background === '#181c2a' || theme.background === '#181c24';
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
        minWidth: '220px',
        minHeight: '120px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        border: `2.5px solid ${theme.border}`,
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
      <span style={{ fontSize: '2.1rem', marginBottom: '0.5rem', color: theme.accent, textShadow: isDark ? '0 1px 8px rgba(120,130,180,0.18)' : '0 1px 4px rgba(44,44,84,0.10)' }}>{iconMap[debt.type] || '💳'}</span>
      <div style={{ fontSize: '1.13rem', color: theme.accent, fontWeight: 700, marginBottom: '0.25rem', letterSpacing: '0.01em' }}>{debt.name}</div>
      <div style={{ color: theme.subtext, fontSize: '1.01rem', marginBottom: 8, fontWeight: 600 }}>{debt.notes}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, marginBottom: 10, fontSize: '1.05rem', color: theme.text }}>
        <div><b>Balance:</b> <span style={{ color: theme.success }}>${Number(debt.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
        <div><b>APR:</b> <span style={{ color: theme.error }}>{debt.apr}%</span></div>
        <div><b>Min Payment:</b> <span style={{ color: theme.warning }}>${Number(debt.min_payment).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
        {debt.due_date && <div><b>Due Date:</b> <span style={{ color: theme.subtext }}>{debt.due_date}</span></div>}
      </div>
      {children}
    </div>
  );
}
