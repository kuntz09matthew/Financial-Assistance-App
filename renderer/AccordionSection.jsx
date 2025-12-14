import React from 'react';

export default function AccordionSection({ title, theme, defaultCollapsed = false, children }) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);
  return (
    <div style={{ borderRadius: 10, border: `2px solid ${theme.accent}33`, background: theme.card, boxShadow: `0 1px 8px ${theme.border}`, marginBottom: 12 }}>
      <button
        onClick={() => setCollapsed(c => !c)}
        aria-expanded={!collapsed}
        aria-controls={`section-${title.replace(/\s+/g, '-')}`}
        style={{
          width: '100%',
          background: 'none',
          border: 'none',
          color: theme.accent,
          fontWeight: 800,
          fontSize: '1.13rem',
          padding: '0.9rem 1.2rem',
          textAlign: 'left',
          cursor: 'pointer',
          outline: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span>{title}</span>
        <span style={{ fontSize: 22, marginLeft: 8 }}>{collapsed ? '▼' : '▲'}</span>
      </button>
      {!collapsed && (
        <div id={`section-${title.replace(/\s+/g, '-')}`} style={{ padding: '0.5rem 1.2rem 1.2rem 1.2rem' }}>
          {children}
        </div>
      )}
    </div>
  );
}