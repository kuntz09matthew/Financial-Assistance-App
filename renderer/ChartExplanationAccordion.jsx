import React, { useState } from 'react';

export default function ChartExplanationAccordion({ title, details, theme }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ margin: '1.2rem 0', borderRadius: 10, background: theme.card, boxShadow: `0 1px 6px ${theme.border}` }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          background: 'none',
          border: 'none',
          color: theme.accent,
          fontWeight: 700,
          fontSize: '1.08rem',
          padding: '0.9rem 1.2rem',
          textAlign: 'left',
          cursor: 'pointer',
          borderBottom: open ? `2px solid ${theme.accent}` : `1px solid ${theme.border}`,
          outline: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}
        aria-expanded={open}
        aria-controls={`accordion-details-${title.replace(/\s/g, '')}`}
      >
        <span>{open ? '▼' : '▶'}</span> {title}
      </button>
      {open && (
        <div id={`accordion-details-${title.replace(/\s/g, '')}`} style={{ padding: '1.1rem 1.5rem', color: theme.text, fontSize: '1.04rem', background: theme.background }}>
          {details}
        </div>
      )}
    </div>
  );
}
