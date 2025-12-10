const { app, BrowserWindow, ipcMain } = require('electron');

// Modular window creation
function createMainWindow() {
	try {
		const win = new BrowserWindow({
			width: 800,
			height: 600,
			webPreferences: {
				nodeIntegration: true,
				contextIsolation: false,
			},
		});
	win.loadFile('renderer/dist/index.html');

		// Example: send message to renderer after window is ready
		win.webContents.on('did-finish-load', () => {
			win.webContents.send('main-process-message', 'Main process loaded');
		});
		return win;
	} catch (err) {
		console.error('Error creating main window:', err);
	}
}

// IPC setup (main <-> renderer)
function setupIPC() {
	ipcMain.on('renderer-to-main', (event, arg) => {
		console.log('Received from renderer:', arg);
		event.reply('main-to-renderer', 'Message received by main process');
	});
}

app.whenReady().then(() => {
	createMainWindow();
	setupIPC();
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createMainWindow();
	}
});
