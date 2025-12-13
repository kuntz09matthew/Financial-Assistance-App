import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { lightTheme, darkTheme } from './theme';

export default function AppNav({ isDarkMode }) {
  const theme = isDarkMode ? darkTheme : lightTheme;
  const location = useLocation();
  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/income', label: 'Income' },
    { path: '/bills', label: 'Expenses (Bills)' },
    { path: '/spending', label: 'Spending' },
    { path: '/savings', label: 'Savings' },
    { path: '/goals', label: 'Financial Goals' },
    { path: '/reports', label: 'Reports & Analytics' },
    { path: '/settings', label: 'Settings & Profile' },
  ];
  return (
    <nav style={{
      minWidth: 200,
      background: isDarkMode ? theme.nav : theme.card,
      borderRadius: 8,
      boxShadow: `0 2px 8px ${theme.border}`,
      padding: '1rem',
      color: theme.text,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      gap: '0.5rem',
    }}>
      {navItems.map(item => (
        <Link
          key={item.path}
          to={item.path}
          style={{
            marginBottom: '0.5rem',
            color: location.pathname === item.path ? theme.accent : theme.text,
            fontWeight: 700,
            background: location.pathname === item.path ? theme.background : 'none',
            borderRadius: 6,
            padding: '0.75rem',
            border: `1px solid ${theme.border}`,
            textDecoration: 'none',
            fontSize: '1rem',
            transition: 'background 0.2s',
            boxShadow: location.pathname === item.path ? `0 2px 8px ${theme.accent}` : 'none',
          }}
          aria-current={location.pathname === item.path ? 'page' : undefined}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
