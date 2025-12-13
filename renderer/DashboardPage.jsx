import React, { useEffect, useState } from 'react';
import DashboardCard from './DashboardCard';
import MonthDetailModal from './MonthDetailModal';
import { ProjectedBalanceModal, MonthComparisonChart } from './App.jsx';
import BillReminders from './BillReminders';

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
          {billRemindersError && <div style={{ color: theme.error, marginBottom: 8 }}>Error: {billRemindersError}</div>}
          {billReminders ? (
            <BillReminders grouped={billReminders.grouped} stats={billReminders.stats} theme={theme} />
          ) : (
            <div style={{ color: theme.subtext, marginTop: 16 }}>No bill reminders data received.</div>
          )}
        </div>
      ) : dashboardTab === 'insights' ? (
        <div style={{ color: theme.subtext, textAlign: 'center', marginTop: '2rem' }}>
          <h2 style={{ color: theme.text, fontWeight: 700, fontSize: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>Insights</h2>
          <div>Coming soon: AI-powered recommendations, positive insights, and financial tips!</div>
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
