
import React, { useEffect, useState } from 'react';

function GoalProgressBar({ current, target, theme }) {
  const percent = Math.min(100, Math.round((current / target) * 100));
  return (
    <div style={{ background: theme.border, borderRadius: 8, height: 18, width: '100%', margin: '8px 0' }}>
      <div style={{
        width: percent + '%',
        background: percent === 100 ? theme.success : theme.accent,
        height: '100%',
        borderRadius: 8,
        transition: 'width 0.5s',
        textAlign: 'right',
        color: theme.card,
        fontWeight: 700,
        fontSize: '1rem',
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
        paddingRight: 8
      }}>{percent}%</div>
    </div>
  );
}

export default function FinancialGoalsPage({ theme = {
  background: '#f4f6fb', card: '#fff', accent: '#7c5cff', text: '#2d3a4a', border: '#e0e6ed', success: '#4caf50', error: '#a94442', subtext: '#888'
} }) {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newGoal, setNewGoal] = useState({ name: '', type: 'savings', target_amount: '', current_amount: '', start_date: '', target_date: '', notes: '' });
  const [projections, setProjections] = useState({});
  const [updatingId, setUpdatingId] = useState(null);
  const [updateAmount, setUpdateAmount] = useState('');

  // Fetch goals from backend
  useEffect(() => {
    setLoading(true);
    if (window.electronAPI && window.electronAPI.invoke) {
      window.electronAPI.invoke('get-goals').then(res => {
        if (res && res.goals) {
          setGoals(res.goals);
          setError('');
        } else {
          setError(res && res.error ? res.error : 'Failed to load goals');
        }
        setLoading(false);
      });
    }
  }, []);

  // Fetch projections for each goal
  useEffect(() => {
    if (!goals.length) return;
    goals.forEach(goal => {
      window.electronAPI.invoke('get-goal-projection', goal.id).then(res => {
        setProjections(prev => ({ ...prev, [goal.id]: res }));
      });
    });
  }, [goals]);

  // Add new goal
  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!newGoal.name || !newGoal.target_amount || !newGoal.start_date) {
      setError('Name, target amount, and start date are required.');
      return;
    }
    setError('');
    window.electronAPI.invoke('add-goal', {
      ...newGoal,
      target_amount: parseFloat(newGoal.target_amount),
      current_amount: newGoal.current_amount ? parseFloat(newGoal.current_amount) : 0
    }).then(res => {
      if (res && res.id) {
        setShowAdd(false);
        setNewGoal({ name: '', type: 'savings', target_amount: '', current_amount: '', start_date: '', target_date: '', notes: '' });
        // Refresh goals
        window.electronAPI.invoke('get-goals').then(r2 => setGoals(r2.goals || []));
      } else {
        setError(res && res.error ? res.error : 'Failed to add goal');
      }
    });
  };

  // Update progress
  const handleUpdateProgress = (goalId) => {
    if (!updateAmount) return;
    setUpdatingId(goalId);
    window.electronAPI.invoke('update-goal-progress', { id: goalId, current_amount: parseFloat(updateAmount) }).then(res => {
      setUpdatingId(null);
      setUpdateAmount('');
      window.electronAPI.invoke('get-goals').then(r2 => setGoals(r2.goals || []));
    });
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 1rem', background: theme.background, minHeight: '100vh' }}>
      <h2 style={{ color: theme.accent, fontWeight: 800, marginBottom: 8 }}>Financial Goals</h2>
      <div style={{ color: theme.subtext, marginBottom: 24 }}>Track your savings, debt payoff, and life goals. See your progress and projected completion dates.</div>
      {error && <div style={{ color: theme.error, marginBottom: 16 }}>{error}</div>}
      <button onClick={() => setShowAdd(s => !s)} style={{ background: theme.accent, color: theme.card, border: 'none', borderRadius: 8, padding: '0.6rem 1.2rem', fontWeight: 700, marginBottom: 24, cursor: 'pointer' }}>{showAdd ? 'Cancel' : 'Add New Goal'}</button>
      {showAdd && (
        <form onSubmit={handleAddGoal} style={{ background: theme.card, borderRadius: 12, padding: 20, marginBottom: 32, boxShadow: `0 2px 8px ${theme.border}` }}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontWeight: 600 }}>Name: <input required value={newGoal.name} onChange={e => setNewGoal(g => ({ ...g, name: e.target.value }))} style={{ marginLeft: 8, padding: 4, borderRadius: 4, border: `1px solid ${theme.border}` }} /></label>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontWeight: 600 }}>Type: <select value={newGoal.type} onChange={e => setNewGoal(g => ({ ...g, type: e.target.value }))} style={{ marginLeft: 8, padding: 4, borderRadius: 4, border: `1px solid ${theme.border}` }}>
              <option value="savings">Savings</option>
              <option value="debt">Debt</option>
              <option value="life">Life</option>
            </select></label>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontWeight: 600 }}>Target Amount: <input required type="number" min="1" value={newGoal.target_amount} onChange={e => setNewGoal(g => ({ ...g, target_amount: e.target.value }))} style={{ marginLeft: 8, padding: 4, borderRadius: 4, border: `1px solid ${theme.border}` }} /></label>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontWeight: 600 }}>Current Amount: <input type="number" min="0" value={newGoal.current_amount} onChange={e => setNewGoal(g => ({ ...g, current_amount: e.target.value }))} style={{ marginLeft: 8, padding: 4, borderRadius: 4, border: `1px solid ${theme.border}` }} /></label>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontWeight: 600 }}>Start Date: <input required type="date" value={newGoal.start_date} onChange={e => setNewGoal(g => ({ ...g, start_date: e.target.value }))} style={{ marginLeft: 8, padding: 4, borderRadius: 4, border: `1px solid ${theme.border}` }} /></label>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontWeight: 600 }}>Target Date: <input type="date" value={newGoal.target_date} onChange={e => setNewGoal(g => ({ ...g, target_date: e.target.value }))} style={{ marginLeft: 8, padding: 4, borderRadius: 4, border: `1px solid ${theme.border}` }} /></label>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontWeight: 600 }}>Notes: <input value={newGoal.notes} onChange={e => setNewGoal(g => ({ ...g, notes: e.target.value }))} style={{ marginLeft: 8, padding: 4, borderRadius: 4, border: `1px solid ${theme.border}` }} /></label>
          </div>
          <button type="submit" style={{ background: theme.success, color: theme.card, border: 'none', borderRadius: 8, padding: '0.5rem 1.1rem', fontWeight: 700, cursor: 'pointer' }}>Add Goal</button>
        </form>
      )}
      {loading ? <div>Loading goals...</div> : (
        goals.length === 0 ? <div style={{ color: theme.subtext }}>No goals yet. Add your first goal above!</div> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {goals.map(goal => (
              <div key={goal.id} style={{ background: theme.card, borderRadius: 12, boxShadow: `0 2px 8px ${theme.border}`, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ fontWeight: 700, fontSize: '1.15rem', color: theme.accent }}>{goal.name}</div>
                  <span style={{ fontSize: '0.98rem', color: theme.subtext, fontWeight: 600 }}>{goal.type.charAt(0).toUpperCase() + goal.type.slice(1)}</span>
                </div>
                <GoalProgressBar current={goal.current_amount} target={goal.target_amount} theme={theme} />
                <div style={{ fontSize: '1.01rem', marginBottom: 6 }}>
                  <b>Current:</b> ${goal.current_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} / <b>Target:</b> ${goal.target_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div style={{ fontSize: '0.98rem', color: theme.subtext, marginBottom: 6 }}>
                  <b>Start:</b> {goal.start_date} {goal.target_date && (<><b> | Target:</b> {goal.target_date}</>)}
                </div>
                {goal.notes && <div style={{ fontSize: '0.97rem', color: theme.info, marginBottom: 6 }}>{goal.notes}</div>}
                {projections[goal.id] && projections[goal.id].projectedDate && (
                  <div style={{ fontSize: '1.01rem', color: theme.success, marginBottom: 6 }}>
                    <b>Projected Completion:</b> {projections[goal.id].projectedDate} ({projections[goal.id].monthsToComplete} months left)
                  </div>
                )}
                {projections[goal.id] && projections[goal.id].monthlyRate > 0 && (
                  <div style={{ fontSize: '0.98rem', color: theme.subtext, marginBottom: 6 }}>
                    <b>Avg Monthly Contribution:</b> ${projections[goal.id].monthlyRate.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                  <input type="number" min="0" placeholder="Update amount" value={updatingId === goal.id ? updateAmount : ''} onChange={e => { setUpdatingId(goal.id); setUpdateAmount(e.target.value); }} style={{ padding: 4, borderRadius: 4, border: `1px solid ${theme.border}` }} aria-label="Update current amount" />
                  <button onClick={() => handleUpdateProgress(goal.id)} disabled={updatingId !== goal.id || !updateAmount} style={{ background: theme.accent, color: theme.card, border: 'none', borderRadius: 6, padding: '0.4rem 1rem', fontWeight: 600, cursor: 'pointer' }}>Update Progress</button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
