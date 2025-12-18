import React from 'react';


import { useState } from 'react';

import { useNavigate } from 'react-router-dom';

export function RecommendationCard({ rec, theme }) {
  const [expanded, setExpanded] = useState(false);
  const navigate = typeof useNavigate === 'function' ? useNavigate() : null;
  const color = rec.priority === 'Critical' ? theme.error :
    rec.priority === 'Urgent' ? theme.warning :
    rec.priority === 'High' ? theme.warning :
    rec.priority === 'Medium' ? theme.accent :
    rec.priority === 'Low' ? theme.text :
    rec.priority === 'Positive' ? theme.success :
    theme.text;

  // Helper: map action text to navigation path
  const getNavPath = (action) => {
    if (/account/i.test(action)) return '/';
    if (/income/i.test(action)) return '/income';
    if (/bill|expense/i.test(action)) return '/bills';
    if (/savings/i.test(action)) return '/savings';
    if (/goal/i.test(action)) return '/goals';
    return null;
  };

  // Special highlight for profile completion
  const isProfileRec = rec.title && rec.title.toLowerCase().includes('complete your profile');

  return (
    <div
      style={{
        border: `2.5px solid ${isProfileRec ? theme.accent : color}`,
        background: isProfileRec ? theme.background : theme.card,
        borderRadius: 14,
        boxShadow: isProfileRec ? `0 4px 24px ${theme.accent}33` : `0 2px 12px ${theme.border}`,
        marginBottom: 22,
        color: theme.text,
        transition: 'box-shadow 0.2s',
        cursor: 'pointer',
        padding: expanded ? '1.25rem 1.7rem' : '1rem 1.3rem',
        outline: expanded ? `2px solid ${theme.accent}` : 'none',
        position: 'relative',
      }}
      tabIndex={0}
      aria-label={rec.title}
      onClick={() => setExpanded(e => !e)}
      onKeyPress={e => (e.key === 'Enter' || e.key === ' ') && setExpanded(e => !e)}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontWeight: 900, fontSize: '1.18rem', color: isProfileRec ? theme.accent : color, marginBottom: 4, letterSpacing: '0.01em' }}>
          {isProfileRec && <span style={{ fontSize: '1.6em', marginRight: 8 }}>📝</span>}
          {rec.title}
        </div>
        <span style={{ fontSize: 20, marginLeft: 8 }}>{expanded ? '▲' : '▼'}</span>
      </div>
      <div style={{ fontSize: '1.07rem', marginBottom: expanded ? 10 : 0, color: theme.text, fontWeight: 600 }}>
        {rec.message}
      </div>
      {expanded && (
        <>
          <div style={{ fontSize: '0.98rem', color: theme.subtext, marginBottom: 8 }}>
            <b>Priority:</b> {rec.priority} &nbsp;|
            <b> Impact:</b> {rec.impact} &nbsp;|
            <b> Timeline:</b> {rec.timeline}
          </div>
          {rec.impactEstimate !== 0 && (
            <div style={{ fontSize: '0.97rem', color: theme.warning, marginBottom: 8 }}>
              <b>Estimated Impact:</b> {rec.impactEstimate > 0 ? '+' : ''}${rec.impactEstimate.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          )}
          {rec.actions && rec.actions.length > 0 && (
            <ul style={{ margin: '0 0 12px 1.2em', color: theme.text }}>
              {rec.actions.map((a, i) => {
                const navPath = getNavPath(a);
                return (
                  <li key={i} style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>{a}</span>
                    {isProfileRec && navPath && navigate && (
                      <button
                        onClick={e => { e.stopPropagation(); navigate(navPath); }}
                        style={{
                          marginLeft: 8,
                          background: theme.accent,
                          color: theme.background,
                          border: 'none',
                          borderRadius: 6,
                          padding: '2px 12px',
                          fontWeight: 700,
                          fontSize: '0.97rem',
                          cursor: 'pointer',
                          outline: 'none',
                          boxShadow: `0 1px 4px ${theme.border}`,
                          transition: 'all 0.18s',
                        }}
                        aria-label={`Go to ${a}`}
                      >Go</button>
                    )}
                  </li>
                );
              })}
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
