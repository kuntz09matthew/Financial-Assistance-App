// Preload script to expose update API to renderer
const { contextBridge, ipcRenderer } = require('electron');

ipcRenderer.on('theme-toggle', () => {
  window.dispatchEvent(new Event('theme-toggle'));
});

contextBridge.exposeInMainWorld('electronAPI', {
  checkForUpdates: () => ipcRenderer.send('check-for-updates'),
  downloadUpdate: () => ipcRenderer.send('download-update'),
  restartToInstall: () => ipcRenderer.send('restart-to-install'),
  onUpdateStatus: (callback) => ipcRenderer.on('update-status', (event, data) => callback(data)),
  getAccountsData: async () => await ipcRenderer.invoke('get-accounts-data'),
  getMonthToDateSpending: async () => await ipcRenderer.invoke('get-month-to-date-spending'),
});
