const { ipcMain, BrowserWindow } = require('electron');
const { autoUpdater } = require('electron-updater');

function setupIPC() {
  // Month-to-date spending summary handler
  ipcMain.handle('get-month-to-date-spending', async () => {
    try {
      const path = require('path');
      const Database = require('better-sqlite3');
      const dbPath = path.join(__dirname, '../../assets/data.db');
      const db = new Database(dbPath, { readonly: true });
      // Get the first and last day of the current month
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const firstDay = `${year}-${month.toString().padStart(2, '0')}-01`;
      const lastDay = `${year}-${month.toString().padStart(2, '0')}-31`;
      // Sum all negative (spending) transactions for this month
      const stmt = db.prepare(`SELECT SUM(amount) as totalSpending FROM transactions WHERE date >= ? AND date <= ? AND amount < 0`);
      const result = stmt.get(firstDay, lastDay);
      db.close();
      return { monthToDateSpending: Math.abs(result.totalSpending || 0) };
    } catch (err) {
      return { error: err.message };
    }
  });
  const path = require('path');
  const Database = require('better-sqlite3');
  ipcMain.handle('get-accounts-data', async () => {
    try {
  const dbPath = path.join(__dirname, '../../assets/data.db');
      const db = new Database(dbPath, { readonly: true });
      const rows = db.prepare('SELECT * FROM accounts').all();
      db.close();
      return rows;
    } catch (err) {
      return { error: err.message };
    }
  });
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
