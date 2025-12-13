import React from 'react';

export function RecommendationCard({ rec, theme }) {
  const color = rec.priority === 'Critical' ? theme.error :
    rec.priority === 'Urgent' ? theme.warning :
    rec.priority === 'High' ? theme.warning :
    rec.priority === 'Medium' ? theme.accent :
    rec.priority === 'Positive' ? theme.success :
    theme.text;
  return (
    <div style={{
      border: `2px solid ${color}`,
      background: theme.card,
      borderRadius: 12,
      boxShadow: `0 2px 12px ${theme.border}`,
      marginBottom: 18,
      padding: '1.1rem 1.5rem',
      color: theme.text,
      transition: 'box-shadow 0.2s',
    }}>
      <div style={{ fontWeight: 800, fontSize: '1.13rem', color, marginBottom: 4 }}>{rec.title}</div>
      <div style={{ fontSize: '1.01rem', marginBottom: 8 }}>{rec.message}</div>
      <div style={{ fontSize: '0.98rem', color: theme.subtext, marginBottom: 6 }}>
        <b>Priority:</b> {rec.priority} &nbsp;|
        <b> Impact:</b> {rec.impact} &nbsp;|
        <b> Timeline:</b> {rec.timeline}
      </div>
      {rec.impactEstimate !== 0 && (
        <div style={{ fontSize: '0.97rem', color: theme.warning, marginBottom: 6 }}>
          <b>Estimated Impact:</b> {rec.impactEstimate > 0 ? '+' : ''}${rec.impactEstimate.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </div>
      )}
      <ul style={{ margin: '0 0 8px 1.2em', color: theme.text }}>
        {rec.actions && rec.actions.map((a, i) => <li key={i}>{a}</li>)}
      </ul>
    </div>
  );
}

export function InsightCard({ text, theme }) {
  return (
    <div style={{
      border: `2px solid ${theme.success}`,
      background: theme.card,
      borderRadius: 10,
      boxShadow: `0 1px 8px ${theme.border}`,
      marginBottom: 12,
      padding: '0.9rem 1.2rem',
      color: theme.success,
      fontWeight: 700,
      fontSize: '1.05rem',
    }}>{text}</div>
  );
}

export function TipCard({ text, theme }) {
  return (
    <div style={{
      border: `1.5px dashed ${theme.accent}`,
      background: theme.background,
      borderRadius: 8,
      marginBottom: 10,
      padding: '0.7rem 1.1rem',
      color: theme.accent,
      fontWeight: 600,
      fontSize: '1.01rem',
    }}>{text}</div>
  );
}
