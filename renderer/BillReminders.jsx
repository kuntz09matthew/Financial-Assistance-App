import React from 'react';

// Utility for urgency color
const urgencyColor = (urgency, theme) => {
  if (urgency === 'urgent') return theme.error;
  if (urgency === 'soon') return theme.warning;
  return theme.success;
};

function BillReminders({ grouped, stats, theme }) {
  return (
    <div style={{ margin: '2rem 0', padding: '1.5rem', background: theme.background, borderRadius: '12px', boxShadow: `0 2px 8px ${theme.border}` }}>
      <h4 style={{ color: theme.accent, marginBottom: '1rem', textAlign: 'center', fontWeight: 700 }}>Upcoming Bill Reminders (Next 7 Days)</h4>
      <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
        <div style={{ color: theme.text }}><b>Total Due:</b> ${stats.totalDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        <div style={{ color: theme.text }}><b>Unpaid Bills:</b> {stats.unpaidCount}</div>
        <div style={{ color: theme.text }}><b>Auto-Pay:</b> {stats.autoPayCount}</div>
      </div>
      {['urgent', 'soon', 'upcoming'].map((urgency) => (
        <div key={urgency} style={{ marginBottom: '1.5rem' }}>
          <h5 style={{ color: urgencyColor(urgency, theme), fontWeight: 700, marginBottom: 8 }}>
            {urgency === 'urgent' ? 'Urgent (1-2 days)' : urgency === 'soon' ? 'Soon (3-5 days)' : 'Upcoming (6-7 days)'}
          </h5>
          {grouped[urgency].length === 0 ? (
            <div style={{ color: theme.subtext, marginBottom: 8 }}>No bills in this category.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', background: theme.card, borderRadius: '8px', overflow: 'hidden', marginBottom: 8 }}>
              <thead>
                <tr style={{ background: theme.nav, color: theme.accent }}>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>Due Date</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>Category</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>Description</th>
                  <th style={{ textAlign: 'right', padding: '0.5rem' }}>Amount</th>
                  <th style={{ textAlign: 'center', padding: '0.5rem' }}>Auto-Pay</th>
                  <th style={{ textAlign: 'center', padding: '0.5rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {grouped[urgency].map((bill) => (
                  <tr key={bill.id} style={{ background: theme.background, color: theme.text }}>
                    <td style={{ padding: '0.5rem' }}>{new Date(bill.date).toLocaleDateString()}</td>
                    <td style={{ padding: '0.5rem' }}>{bill.category}</td>
                    <td style={{ padding: '0.5rem' }}>{bill.description}</td>
                    <td style={{ padding: '0.5rem', textAlign: 'right', color: theme.error, fontWeight: 'bold' }}>
                      ${Math.abs(bill.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                      {bill.isAutoPay ? <span style={{ color: theme.success, fontWeight: 600 }}>Auto</span> : <span style={{ color: theme.warning }}>Manual</span>}
                    </td>
                    <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                      {bill.isPaid ? <span style={{ color: theme.success, fontWeight: 600 }}>Paid</span> : <span style={{ color: theme.error, fontWeight: 600 }}>Unpaid</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ))}
    </div>
  );
}

export default BillReminders;
