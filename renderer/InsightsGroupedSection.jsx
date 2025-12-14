import React, { useState } from 'react';
import AccordionSection from './AccordionSection';
import { RecommendationCard, InsightCard } from './InsightsCards';

export default function InsightsGroupedSection({ analysis, theme }) {
  // Manage showAll state for each group by priority
  const [showAllGroups, setShowAllGroups] = useState({});
  // Group recommendations by priority
  const groups = {};
  analysis.recommendations.forEach((rec) => {
    const key = rec.priority || 'Other';
    if (!groups[key]) groups[key] = [];
    groups[key].push(rec);
  });
  // Priority order for display
  const priorityOrder = ['Critical', 'Urgent', 'High', 'Medium', 'Low', 'Positive', 'Other'];
  return (
    <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'left' }}>
      {priorityOrder.filter(p => groups[p] && groups[p].length > 0).map(priority => {
        const group = groups[priority];
        const showAll = !!showAllGroups[priority];
        const displayGroup = showAll ? group : group.slice(0, 3);
        return (
          <AccordionSection key={priority} title={`${priority} (${group.length})`} theme={theme} defaultCollapsed={priority !== 'Critical' && priority !== 'Urgent'}>
            {displayGroup.map((rec, i) =>
              rec.priority === 'Positive' ? (
                <InsightCard key={i} text={rec.title + ': ' + rec.message} theme={theme} />
              ) : (
                <RecommendationCard key={i} rec={rec} theme={theme} />
              )
            )}
            {group.length > 3 && (
              <button
                onClick={() => setShowAllGroups(s => ({ ...s, [priority]: !showAll }))}
                style={{
                  margin: '10px auto 0',
                  display: 'block',
                  background: theme.background,
                  color: theme.accent,
                  border: `1.5px solid ${theme.accent}`,
                  borderRadius: 8,
                  padding: '0.5rem 1.2rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {showAll ? 'Show Less' : `Show All (${group.length})`}
              </button>
            )}
          </AccordionSection>
        );
      })}
    </div>
  );
}