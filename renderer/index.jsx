import React from 'react';
import { createRoot } from 'react-dom/client';
import WrappedApp from './App.jsx';

// Inject dashboard-responsive.css at runtime for responsive styles
fetch('./dashboard-responsive.css')
	.then(res => res.text())
	.then(css => {
		const style = document.createElement('style');
		style.textContent = css;
		document.head.appendChild(style);
	});


// Dynamically require ipc-test.js if running in Electron
if (window.require) {
	require('./ipc-test.js');
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<WrappedApp />);
