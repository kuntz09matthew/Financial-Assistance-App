import React from 'react';


import { useState } from 'react';

export function RecommendationCard({ rec, theme }) {
  const [expanded, setExpanded] = useState(false);
  const color = rec.priority === 'Critical' ? theme.error :
    rec.priority === 'Urgent' ? theme.warning :
    rec.priority === 'High' ? theme.warning :
    rec.priority === 'Medium' ? theme.accent :
    rec.priority === 'Low' ? theme.text :
    rec.priority === 'Positive' ? theme.success :
    theme.text;
  return (
    <div
      style={{
        border: `2px solid ${color}`,
        background: theme.card,
        borderRadius: 12,
        boxShadow: `0 2px 12px ${theme.border}`,
        marginBottom: 18,
        color: theme.text,
        transition: 'box-shadow 0.2s',
        cursor: 'pointer',
        padding: expanded ? '1.1rem 1.5rem' : '0.8rem 1.2rem',
        outline: expanded ? `2px solid ${theme.accent}` : 'none',
      }}
      tabIndex={0}
      aria-label={rec.title}
      onClick={() => setExpanded(e => !e)}
      onKeyPress={e => (e.key === 'Enter' || e.key === ' ') && setExpanded(e => !e)}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontWeight: 800, fontSize: '1.13rem', color, marginBottom: 4 }}>{rec.title}</div>
        <span style={{ fontSize: 20, marginLeft: 8 }}>{expanded ? '▲' : '▼'}</span>
      </div>
      <div style={{ fontSize: '1.01rem', marginBottom: expanded ? 8 : 0, color: theme.text, fontWeight: 600 }}>
        {rec.message}
      </div>
      {expanded && (
        <>
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
          {rec.actions && rec.actions.length > 0 && (
            <ul style={{ margin: '0 0 8px 1.2em', color: theme.text }}>
              {rec.actions.map((a, i) => <li key={i}>{a}</li>)}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

export function InsightCard({ text, theme }) {
  return (
    <div style={{
      border: `2.5px solid ${theme.success}`,
      background: theme.card,
      borderRadius: 14,
      boxShadow: `0 2px 16px ${theme.success}33`,
      marginBottom: 18,
      padding: '1.1rem 1.5rem',
      color: theme.success,
      fontWeight: 900,
      fontSize: '1.13rem',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      letterSpacing: '0.01em',
      textShadow: `0 1px 8px ${theme.success}22`,
      position: 'relative',
    }}>
      <span role="img" aria-label="celebrate" style={{fontSize: '1.6em', marginRight: 10}}>🎉</span>
      <span>{text}</span>
    </div>
  );
}

export function TipCard({ text, type, season, month, theme }) {
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
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      flexWrap: 'wrap',
    }}>
      <span>{text}</span>
      {type && (
        <span style={{
          marginLeft: 8,
          fontSize: '0.92em',
          color: theme.subtext,
          border: `1px solid ${theme.accent}`,
          borderRadius: 6,
          padding: '1px 7px',
          background: theme.card,
          fontWeight: 500,
        }}>{type === 'rule' ? 'Rule' : 'Seasonal'}</span>
      )}
      {season && (
        <span style={{
          marginLeft: 4,
          fontSize: '0.92em',
          color: theme.success,
          border: `1px solid ${theme.success}`,
          borderRadius: 6,
          padding: '1px 7px',
          background: theme.card,
          fontWeight: 500,
        }}>{season}</span>
      )}
      {month && (
        <span style={{
          marginLeft: 4,
          fontSize: '0.92em',
          color: theme.info,
          border: `1px solid ${theme.info}`,
          borderRadius: 6,
          padding: '1px 7px',
          background: theme.card,
          fontWeight: 500,
        }}>Month: {month}</span>
      )}
    </div>
  );
}
