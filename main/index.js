

const { app, BrowserWindow } = require('electron');
const { createMainWindow } = require('./modules/window');
const { setupIPC } = require('./modules/ipc');
const { setupAutoUpdater } = require('./modules/updater');

let mainWindow;

app.whenReady().then(() => {
  mainWindow = createMainWindow();
  setupIPC();
  setupAutoUpdater();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    mainWindow = createMainWindow();
  }
});
