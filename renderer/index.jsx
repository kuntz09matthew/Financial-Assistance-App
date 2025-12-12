import React from 'react';
import { createRoot } from 'react-dom/client';
import WrappedApp from './App.jsx';


// Dynamically require ipc-test.js if running in Electron
if (window.require) {
	require('./ipc-test.js');
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<WrappedApp />);
