import React, { useEffect, useState } from 'react';
import DashboardCard from './DashboardCard';
import MonthDetailModal from './MonthDetailModal';
import { ProjectedBalanceModal, MonthComparisonChart } from './App.jsx';
import BillReminders from './BillReminders';
import PatternAlerts from './PatternAlerts';
import { RecommendationCard } from './InsightsCards';

// AccordionSection component for collapsible UI
function AccordionSection({ title, theme, defaultCollapsed = false, children }) {
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

export default function DashboardPage(props) {
  const {
    theme,
    isDarkMode,
    accounts,
    accountsError,
    expenses,
    income,
    daysUntilNextPaycheck,
    nextPaycheckDate,
    budgetHealthScore,
    monthToDateSpending,
    spendingVelocity,
    monthlySummary,
    monthlySummaryError,
    modalOpen,
    setModalOpen,
    selectedMonth,
    setSelectedMonth,
    monthTransactions,
    setMonthTransactions,
    handleMonthClick,
    projectedBalanceData,
    projectedBalanceError,
    projectedModalOpen,
    setProjectedModalOpen,
    billReminders,
    billRemindersError,
    dashboardTab
  } = props;


  // State for Money Left Per Day
  const [moneyLeftPerDay, setMoneyLeftPerDay] = useState(null);
  const [moneyLeftPerDayError, setMoneyLeftPerDayError] = useState(null);

  // State for Financial Analysis Engine (AI-powered recommendations and analytics)
  // This state will hold multi-dimensional data: balances, income, expenses, trends, and recommendations.
  // Extensible for future analytics and AI modules.
  const [analysis, setAnalysis] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);
  useEffect(() => {
    // Fetch multi-dimensional financial data from backend via IPC
    if (window.electronAPI && window.electronAPI.invoke) {
      window.electronAPI.invoke('get-financial-analysis')
        .then((result) => {
          if (result && !result.error) {
            setAnalysis(result);
          } else {
            setAnalysisError(result?.error || 'Unknown error');
          }
        })
        .catch((err) => setAnalysisError(err.message));
    } else {
      setAnalysisError('IPC not available');
    }
  }, []);

  // State for Spending Pattern Alerts
  const [patternAlerts, setPatternAlerts] = useState(null);
  const [patternAlertsError, setPatternAlertsError] = useState(null);
  const [patternDetail, setPatternDetail] = useState(null);
  // Fetch pattern alerts from backend via IPC on mount
  useEffect(() => {
    if (window.electronAPI && window.electronAPI.invoke) {
      window.electronAPI.invoke('get-spending-pattern-alerts', 6)
        .then((result) => {
          if (result && !result.error) {
            setPatternAlerts(result.alerts);
          } else {
            setPatternAlertsError(result?.error || 'Unknown error');
          }
        })
        .catch((err) => setPatternAlertsError(err.message));
    } else {
      setPatternAlertsError('IPC not available');
    }
  }, []);

  // Fetch daily budget info from backend via IPC on mount
  // Result: { safeToSpend, daysLeft, moneyLeftPerDay, avgSpentPerDay, alert }
  useEffect(() => {
    if (window.electronAPI && window.electronAPI.invoke) {
      window.electronAPI.invoke('get-money-left-per-day')
        .then((result) => {
          if (result && !result.error) {
            setMoneyLeftPerDay(result);
          } else {
            setMoneyLeftPerDayError(result?.error || 'Unknown error');
          }
        })
        .catch((err) => setMoneyLeftPerDayError(err.message));
    } else {
      setMoneyLeftPerDayError('IPC not available');
    }
  }, []);


  // Dashboard tab navigation
  const dashboardTabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'alerts', label: 'Alerts & Warnings' },
    { key: 'insights', label: 'Insights' },
  ];

  return (
    <>
      {/* Enforce white badge text with !important */}
      <style>{`
        .account-type-badge {
          color: #fff !important;
          background-clip: padding-box !important;
          text-shadow: 0 1px 4px #0008 !important;
          -webkit-text-fill-color: #fff !important;
        }
        .badge-checking {
          background: #7c5cff !important;
        }
        .badge-savings {
          background: #00e676 !important;
        }
        .badge-creditcard {
          background: #ff1744 !important;
        }
      `}</style>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', gap: 16 }}>
        {dashboardTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => props.setDashboardTab(tab.key)}
            style={{
              padding: '0.7rem 1.5rem',
              borderRadius: 8,
              border: dashboardTab === tab.key ? `2.5px solid ${theme.accent}` : `1.5px solid ${theme.border}`,
              background: dashboardTab === tab.key ? theme.card : theme.background,
              color: dashboardTab === tab.key ? theme.accent : theme.text,
              fontWeight: dashboardTab === tab.key ? 800 : 600,
              fontSize: '1.08rem',
              cursor: 'pointer',
              boxShadow: dashboardTab === tab.key ? `0 2px 8px ${theme.border}` : 'none',
              transition: 'all 0.18s',
              outline: 'none',
              marginRight: 4,
            }}
            aria-current={dashboardTab === tab.key ? 'page' : undefined}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {dashboardTab === 'alerts' ? (
        <div>
          <h2 style={{ color: theme.text, fontWeight: 700, fontSize: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>Alerts & Warnings</h2>
          {/* Spending Pattern Alerts Section */}
          <div style={{ marginBottom: 32 }}>
            <AccordionSection
              title="Spending Pattern Alerts"
              theme={theme}
              defaultCollapsed={true}
            >
              {patternAlertsError && <div style={{ color: theme.error, marginBottom: 8 }}>Error: {patternAlertsError}</div>}
              {patternAlerts === null && !patternAlertsError && (
                <div style={{ color: theme.subtext, marginTop: 8 }}>Loading pattern alerts...</div>)}
              {patternAlerts && (
                <PatternAlerts alerts={patternAlerts} theme={theme} />
              )}
            </AccordionSection>
          </div>

          {/* Bill Reminders Section */}
          <h3 style={{ color: theme.accent, fontWeight: 700, fontSize: '1.15rem', marginBottom: 8 }}>Upcoming Bill Reminders</h3>
          {billRemindersError && <div style={{ color: theme.error, marginBottom: 8 }}>Error: {billRemindersError}</div>}
          {billReminders ? (
            <BillReminders grouped={billReminders.grouped} stats={billReminders.stats} theme={theme} />
          ) : (
            <div style={{ color: theme.subtext, marginTop: 16 }}>No bill reminders data received.</div>
          )}
          {/* Pattern Alert Detail Modal */}
          {patternDetail && (
            <div
              role="dialog"
              aria-modal="true"
              tabIndex={-1}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: `${theme.background}ee`,
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onClick={() => setPatternDetail(null)}
            >
              <div
                style={{
                  background: theme.card,
                  color: theme.text,
                  borderRadius: 16,
                  boxShadow: `0 4px 32px ${theme.border}`,
                  padding: '2.2rem 2.5rem',
                  minWidth: 340,
                  maxWidth: 480,
                  maxHeight: '80vh',
                  overflowY: 'auto',
                  position: 'relative',
                }}
                onClick={e => e.stopPropagation()}
              >
                <button
                  aria-label="Close"
                  onClick={() => setPatternDetail(null)}
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    background: 'none',
                    border: 'none',
                    color: theme.subtext,
                    fontSize: 22,
                    cursor: 'pointer',
                  }}
                >×</button>
                <h2 style={{ color: patternDetail.positive ? theme.success : patternDetail.severity === 'High' ? theme.error : theme.warning, fontWeight: 800, fontSize: '1.3rem', marginBottom: 8 }}>
                  {patternDetail.positive ? 'Positive Insight' : 'Spending Alert'}: {patternDetail.category}
                </h2>
                <div style={{ fontSize: '1.08rem', fontWeight: 600, marginBottom: 8 }}>{patternDetail.message}</div>
                <div style={{ fontSize: '1.01rem', color: theme.subtext, marginBottom: 12 }}>{patternDetail.recommendation}</div>
                <div style={{ fontSize: '0.98rem', marginBottom: 6 }}>
                  <b>Period:</b> {patternDetail.period === 'week' ? 'This Week' : 'This Month'}<br />
                  <b>Current Spending:</b> ${patternDetail.current.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<br />
                  <b>Historical Avg:</b> ${patternDetail.average.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<br />
                  <b>Variance:</b> {Math.round(patternDetail.variance * 100)}%
                </div>
                <div style={{ fontSize: '0.97rem', color: theme.subtext }}>
                  {patternDetail.positive ? 'Keep up the good work!' : 'Consider adjusting your spending habits.'}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : dashboardTab === 'insights' ? (
        <div style={{ color: theme.subtext, textAlign: 'center', marginTop: '2rem' }}>
          <h2 style={{ color: theme.text, fontWeight: 700, fontSize: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>Insights</h2>
          {analysisError && <div style={{ color: theme.error, marginBottom: 8 }}>Error: {analysisError}</div>}
          {analysis === null && !analysisError && (
            <div style={{ color: theme.subtext, marginTop: 8 }}>Loading recommendations...</div>
          )}
          {analysis && analysis.recommendations && analysis.recommendations.length > 0 && (
            <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'left' }}>
              {analysis.recommendations.map((rec, i) => (
                <RecommendationCard key={i} rec={rec} theme={theme} />
              ))}
            </div>
          )}
          {analysis && analysis.recommendations && analysis.recommendations.length === 0 && (
            <div style={{ color: theme.success, marginTop: 12 }}>No recommendations at this time. Your finances look great!</div>
          )}
        </div>
      ) : (
        <>
          <h2 style={{
            color: theme.accent,
            fontWeight: 900,
            fontSize: '2.1rem',
            marginBottom: '1.2rem',
            textAlign: 'center',
            letterSpacing: '0.01em',
            textShadow: `0 2px 12px ${theme.background}`
          }}>Account Balances</h2>
          {accountsError && <div style={{ color: theme.error, marginBottom: 8, fontWeight: 600, fontSize: '1.1rem', textAlign: 'center' }}>Error: {accountsError}</div>}
          {accounts && accounts.length > 0 ? (
            <div style={{
              maxWidth: 700,
              margin: '0 auto 2.5rem auto',
              background: theme.card,
              borderRadius: 18,
              boxShadow: `0 4px 24px ${theme.border}`,
              border: `2.5px solid ${theme.accent}33`,
              padding: '1.5rem 2rem',
              transition: 'box-shadow 0.2s',
            }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                <thead>
                  <tr style={{ color: theme.accent, fontWeight: 800, fontSize: '1.1rem' }}>
                    <th style={{ textAlign: 'left', padding: '0.85rem 0.75rem' }}>Account</th>
                    <th style={{ textAlign: 'right', padding: '0.85rem 0.75rem' }}>Balance</th>
                    <th style={{ textAlign: 'left', padding: '0.85rem 0.75rem' }}>Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map(acc => (
                    <tr key={acc.id} style={{ borderBottom: `1.5px solid ${theme.border}` }}>
                      <td style={{
                        padding: '0.85rem 0.75rem',
                        fontWeight: 600,
                        fontSize: '1.08rem',
                        color: theme.text
                      }}>
                        {acc.name} {' '}
                        <span
                          className={`account-type-badge ${
                            acc.type === 'Credit Card' ? 'badge-creditcard' : acc.type === 'Savings' ? 'badge-savings' : 'badge-checking'
                          }`}
                          style={{
                            display: 'inline-block',
                            borderRadius: 8,
                            fontSize: '0.92em',
                            fontWeight: 700,
                            padding: '2px 10px',
                            marginLeft: 6,
                            letterSpacing: '0.01em',
                            boxShadow: `0 1px 4px ${theme.border}`,
                          }}
                        >{acc.type}</span>
                      </td>
                      <td style={{
                        padding: '0.85rem 0.75rem',
                        textAlign: 'right',
                        color: acc.balance < 0 ? theme.error : acc.type === 'Savings' ? theme.success : theme.text,
                        fontWeight: 900,
                        fontSize: '1.18rem',
                        letterSpacing: '0.01em',
                        textShadow: acc.balance < 0 ? `0 1px 8px ${theme.error}33` : acc.type === 'Savings' ? `0 1px 8px ${theme.success}33` : `0 1px 8px ${theme.text}22`
                      }}>
                        {acc.type === 'Credit Card' ? '-' : ''}${Math.abs(acc.balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', fontSize: '0.98rem', color: theme.subtext }}>
                        {new Date(acc.lastUpdated).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ color: theme.subtext, marginBottom: '2rem', textAlign: 'center', fontSize: '1.1rem' }}>No account data available.</div>
          )}

          {/* Dashboard Summary Metrics Section */}
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ color: theme.accent, fontWeight: 700, fontSize: '1.2rem', marginBottom: '1rem', textAlign: 'center', letterSpacing: '0.01em' }}>Summary Metrics</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '2rem',
              justifyContent: 'center',
              alignItems: 'stretch',
            }}>
              {/* Money Left Per Day Card */}
              <DashboardCard
                label="Money Left Per Day"
                value={
                  moneyLeftPerDay === null
                    ? 'Loading...'
                    : moneyLeftPerDayError
                    ? 'Error'
                    : `$${moneyLeftPerDay.moneyLeftPerDay?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                }
                icon="perday"
                theme={theme}
                border={`2px solid ${moneyLeftPerDay?.alert ? theme.error : theme.success}`}
              >
                {moneyLeftPerDay && !moneyLeftPerDayError && (
                  <div style={{ fontSize: '0.95rem', color: theme.subtext, marginTop: '0.5rem' }}>
                    <div><b>Daily Target:</b> ${moneyLeftPerDay.moneyLeftPerDay?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <div><b>Avg Spent/Day:</b> ${moneyLeftPerDay.avgSpentPerDay?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <div><b>Days Left:</b> {moneyLeftPerDay.daysLeft}</div>
                    {moneyLeftPerDay.alert && (
                      <div style={{ color: theme.error, fontWeight: 600, marginTop: 4 }}>
                        <span role="img" aria-label="alert">⚠️</span> You are spending faster than your daily target!
                      </div>
                    )}
                  </div>
                )}
                {moneyLeftPerDayError && (
                  <div style={{ color: theme.error, fontWeight: 600, marginTop: 4 }}>{moneyLeftPerDayError}</div>
                )}
              </DashboardCard>
              {/* Budget Health Score Card */}
              <DashboardCard
                label="Budget Health Score"
                value={
                  budgetHealthScore === null
                    ? 'Loading...'
                    : budgetHealthScore === 'Error'
                    ? 'Error'
                    : `${budgetHealthScore} / 100`
                }
                icon="success"
                theme={theme}
                border={`2px solid ${(() => {
                  if (budgetHealthScore === null || budgetHealthScore === 'Error') return theme.subtle;
                  if (budgetHealthScore < 50) return theme.error;
                  if (budgetHealthScore < 80) return theme.warning;
                  return theme.success;
                })()}`}
              >
                <div style={{ fontSize: '0.95rem', color: theme.subtext, marginTop: '0.5rem' }}>
                  <span>
                    <b>How healthy is your budget?</b>
                  </span>
                  <br />
                  <span>
                    <b>Tip:</b> Keep net savings positive and avoid negative balances for a high score.
                  </span>
                </div>
              </DashboardCard>
              {/* Available Spending Money Card */}
              <DashboardCard
                label="Available Spending Money"
                value={accounts.length === 0 ? 'Loading...' : `$${(() => {
                  const checking = accounts.filter(acc => acc.type === 'Checking').reduce((sum, acc) => sum + acc.balance, 0);
                  const savings = accounts.filter(acc => acc.type === 'Savings').reduce((sum, acc) => sum + acc.balance, 0);
                  return (checking + savings).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                })()}`}
                icon="checking"
                theme={theme}
              />
              {/* Month-to-Date Spending Card */}
              <DashboardCard
                label="Month-to-Date Spending"
                value={monthToDateSpending === null ? 'Loading...' : `$${monthToDateSpending.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                icon="expenses"
                theme={theme}
              />
              {/* Spending Velocity Card */}
              <DashboardCard
                label="Spending Velocity"
                value={
                  spendingVelocity === null
                    ? 'Loading...'
                    : spendingVelocity === 'Error'
                    ? 'Error'
                    : `$${spendingVelocity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / day`
                }
                icon="trending_down"
                theme={theme}
              >
                <div style={{ fontSize: '0.95rem', color: theme.subtext, marginTop: '0.5rem' }}>
                  <span>
                    <b>How fast you're spending this month (average per day).</b>
                  </span>
                </div>
              </DashboardCard>
              {/* Days Until Next Paycheck Card */}
              <DashboardCard
                label="Days Until Next Paycheck"
                value={daysUntilNextPaycheck === null ? 'Loading...' : daysUntilNextPaycheck}
                icon="total"
                theme={theme}
              />
              {/* Total Monthly Income Card */}
              <DashboardCard
                label="Total Monthly Income"
                value={`$${income
                  .reduce((sum, i) => sum + (i.frequency === 'Annual' ? i.amount / 12 : i.amount), 0)
                  .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                icon="total"
                theme={theme}
              />
              {/* Total Fixed Expenses Card */}
              <DashboardCard
                label="Total Fixed Expenses"
                value={`$${expenses
                  .filter(e => e.type === 'Fixed')
                  .reduce((sum, e) => sum + e.amount, 0)
                  .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                icon="fixed"
                theme={theme}
              />
              {/* Total Expenses Card */}
              <DashboardCard
                label="Total Expenses"
                value={`$${expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                icon="expenses"
                theme={theme}
              />
              {/* Net Savings Card */}
              <DashboardCard label="Net Savings" value={`$${(
                 income.reduce((sum, i) => sum + (i.frequency === 'Annual' ? i.amount / 12 : i.amount), 0) - expenses.reduce((sum, e) => sum + e.amount, 0)
               ).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon="savingsNet" theme={theme} />
            </div>
          </div>

          {/* Month-over-Month Comparison Section */}
          <div style={{ marginBottom: '2rem' }}>
            {monthlySummaryError && <div style={{ color: theme.error, marginBottom: 8 }}>Error: {monthlySummaryError}</div>}
            {monthlySummary && monthlySummary.length > 0 && <MonthComparisonChart data={monthlySummary} theme={theme} onMonthClick={handleMonthClick} />}
          </div>

          {/* Month Detail Modal */}
          <MonthDetailModal open={modalOpen} onClose={() => setModalOpen(false)} month={selectedMonth || ''} transactions={monthTransactions} />

          {/* Projected Balance Modal */}
          {projectedModalOpen && (
            <ProjectedBalanceModal
              open={projectedModalOpen}
              onClose={() => setProjectedModalOpen(false)}
              data={projectedBalanceData}
              theme={theme}
            />
          )}
        </>
      )}
    </>
  );
}
