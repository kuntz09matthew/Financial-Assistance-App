import React from 'react';

const App = () => {
  return (
    <div style={{ fontFamily: 'Segoe UI, Arial, sans-serif', background: '#f4f6fb', minHeight: '100vh', padding: '2rem' }}>
      <h1 style={{ color: '#2d3a4a' }}>Financial Assistance Dashboard</h1>
      <div style={{ display: 'flex', gap: '2rem' }}>
        <nav style={{ minWidth: '200px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px #e0e6ed', padding: '1rem' }}>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '1rem' }}><b>Overview</b></li>
            <li style={{ marginBottom: '1rem' }}>Income</li>
            <li style={{ marginBottom: '1rem' }}>Expenses</li>
            <li style={{ marginBottom: '1rem' }}>Assistance</li>
            <li>Settings</li>
          </ul>
        </nav>
        <section style={{ flex: 1, background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px #e0e6ed', padding: '2rem' }}>
          <h2>Dashboard Tabs</h2>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <button>Tab 1</button>
            <button>Tab 2</button>
            <button>Tab 3</button>
          </div>
          <div>
            <h3>Subtabs</h3>
            <button>Subtab A</button>
            <button>Subtab B</button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default App;
