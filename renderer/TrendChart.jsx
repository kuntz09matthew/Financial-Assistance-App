import React from 'react';
import ChartExplanationAccordion from './ChartExplanationAccordion.jsx';

// TrendChart: Visualizes 6-month income/expense trends and highlights warnings
export default function TrendChart({ trends, theme }) {
  if (!trends || trends.length === 0) return null;
  // Find max for scaling
  const max = Math.max(...trends.map(t => Math.max(t.income, t.expenses)));
  // Simple trend analysis for warnings and explanations
  const last = trends[trends.length - 1];
  const first = trends[0];
  const incomeFalling = last.income < first.income * 0.85;
  const expensesRising = last.expenses > first.expenses * 1.15;
  const netNegative = last.income < last.expenses;
  let warning = null;
  let explanation = '';
  if (incomeFalling && expensesRising) {
    warning = 'Warning: Income is falling and expenses are rising.';
    explanation = `Over the last 6 months, your income has dropped by more than 15% while your expenses have increased by more than 15%. This is a concerning trend that could lead to financial instability if not addressed. Review both your income sources and spending habits to identify causes and take corrective action.`;
  } else if (incomeFalling) {
    warning = 'Warning: Income is trending down.';
    explanation = `Your income has decreased by more than 15% over the last 6 months. This could be due to reduced work hours, job changes, or other factors. Consider ways to stabilize or increase your income.`;
  } else if (expensesRising) {
    warning = 'Warning: Expenses are trending up.';
    explanation = `Your expenses have increased by more than 15% over the last 6 months. This may indicate rising costs or increased discretionary spending. Review your recent expenses to identify areas where you can cut back.`;
  } else if (netNegative) {
    warning = 'Warning: Expenses exceeded income last month.';
    explanation = `In the most recent month, your expenses were higher than your income. This resulted in negative net savings. If this continues, it could lead to debt or reduced savings.`;
  } else {
    explanation = `Your income and expenses have remained relatively stable over the last 6 months. Keep monitoring your trends to maintain financial health.`;
  }

  return (
    <div style={{ margin: '2rem 0', padding: '1.5rem', background: theme.background, borderRadius: 12, boxShadow: `0 2px 8px ${theme.border}` }}>
      <h4 style={{ color: theme.accent, marginBottom: '1rem', textAlign: 'center', fontWeight: 700 }}>6-Month Income & Expense Trend</h4>
      {warning && (
        <div style={{ color: theme.warning, fontWeight: 700, marginBottom: 16, textAlign: 'center' }}>{warning}</div>
      )}
      <ChartExplanationAccordion
        title="What does this chart mean?"
        details={
          <>
            <ul style={{ marginBottom: 8 }}>
              <li><b>Green bars</b> show your total income for each month.</li>
              <li><b>Red bars</b> show your total expenses for each month.</li>
              <li><b>Net</b> is your income minus expenses for each month.</li>
            </ul>
            <div>{explanation}</div>
          </>
        }
        theme={theme}
      />
      <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', alignItems: 'flex-end', minHeight: 180 }}>
        {trends.map((t, i) => (
          <div key={t.month} style={{ flex: 1, minWidth: 40 }}>
            <div style={{ height: 120, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center' }}>
              <div style={{ height: `${(t.income / max) * 100}%`, width: 18, background: theme.success, borderRadius: 4, marginBottom: 2 }} title={`Income: $${t.income.toLocaleString()}`}></div>
              <div style={{ height: `${(t.expenses / max) * 100}%`, width: 18, background: theme.error, borderRadius: 4 }} title={`Expenses: $${t.expenses.toLocaleString()}`}></div>
            </div>
            <div style={{ fontSize: '0.95rem', color: theme.subtext, textAlign: 'center', marginTop: 4 }}>{t.month}</div>
            <div style={{ fontSize: '0.9rem', color: theme.text, textAlign: 'center', fontWeight: 600 }}>
              Net: ${(t.income - t.expenses).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
