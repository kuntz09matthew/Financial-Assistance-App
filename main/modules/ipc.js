const { ipcMain, BrowserWindow } = require('electron');
const { autoUpdater } = require('electron-updater');

function setupIPC() {
  ipcMain.on('restart-to-install', () => {
    autoUpdater.quitAndInstall();
  });
  ipcMain.on('renderer-to-main', (event, arg) => {
    console.log('Received from renderer:', arg);
    event.reply('main-to-renderer', 'Message received by main process');
  });
  ipcMain.on('check-for-updates', (event) => {
    autoUpdater.checkForUpdates();
    event.reply('update-status', { status: 'checking', message: 'Checking for updates...' });
  });
  ipcMain.on('download-update', (event) => {
    autoUpdater.downloadUpdate();
    event.reply('update-status', { status: 'downloading', message: 'Downloading update...' });
  });
  autoUpdater.on('update-available', (info) => {
    BrowserWindow.getAllWindows().forEach(win => {
      win.webContents.send('update-status', { status: 'available', message: 'A new update is available!' });
    });
  });
  autoUpdater.on('update-not-available', (info) => {
    BrowserWindow.getAllWindows().forEach(win => {
      win.webContents.send('update-status', { status: 'up-to-date', message: 'You are up to date.' });
    });
  });
  autoUpdater.on('download-progress', (progress) => {
    BrowserWindow.getAllWindows().forEach(win => {
      win.webContents.send('update-status', { status: 'downloading', message: `Downloading update... (${Math.round(progress.percent)}%)` });
    });
  });
  autoUpdater.on('update-downloaded', (info) => {
    BrowserWindow.getAllWindows().forEach(win => {
      win.webContents.send('update-status', { status: 'downloaded', message: 'Update downloaded. Restart to install.' });
    });
  });
  autoUpdater.on('error', (err) => {
    BrowserWindow.getAllWindows().forEach(win => {
      win.webContents.send('update-status', { status: 'error', message: err == null ? 'unknown' : (err.stack || err).toString() });
    });
  });
}

module.exports = { setupIPC };
