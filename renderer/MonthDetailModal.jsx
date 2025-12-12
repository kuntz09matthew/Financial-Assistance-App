import React from 'react';

const modalStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const contentStyle = {
  background: '#23243a',
  borderRadius: 12,
  padding: '2rem',
  minWidth: 350,
  maxWidth: 600,
  color: '#fff',
  boxShadow: '0 2px 16px #0008',
};

export default function MonthDetailModal({ open, onClose, month, transactions }) {
  if (!open) return null;
  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={contentStyle} onClick={e => e.stopPropagation()}>
        <h2 style={{marginTop:0, marginBottom:16}}>Details for {month.slice(5,7) + '/'+ month.slice(2,4)}</h2>
        <button style={{float:'right',marginTop:-40,marginRight:-20,background:'none',border:'none',color:'#fff',fontSize:24,cursor:'pointer'}} onClick={onClose}>&times;</button>
        {transactions && transactions.length > 0 ? (
          <table style={{width:'100%',marginTop:16}}>
            <thead>
              <tr style={{color:'#a7a7ff'}}>
                <th align="left">Date</th>
                <th align="left">Category</th>
                <th align="right">Amount</th>
                <th align="left">Description</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t,i) => (
                <tr key={i}>
                  <td>{t.date}</td>
                  <td>{t.category}</td>
                  <td align="right" style={{color: t.amount < 0 ? '#ff5a5a' : '#6fff6f'}}>{t.amount < 0 ? '-' : '+'}${Math.abs(t.amount).toLocaleString()}</td>
                  <td>{t.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{marginTop:24}}>No transactions for this month.</div>
        )}
      </div>
    </div>
  );
}
