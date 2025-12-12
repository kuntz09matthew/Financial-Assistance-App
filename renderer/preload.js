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
  getSpendingVelocity: async () => await ipcRenderer.invoke('get-spending-velocity'),
  getDaysUntilNextPaycheck: async () => await ipcRenderer.invoke('get-days-until-next-paycheck'),
  getBudgetHealthScore: async () => await ipcRenderer.invoke('get-budget-health-score'),
  getMonthlySummary: async (months = 6) => await ipcRenderer.invoke('get-monthly-summary', months),
});
