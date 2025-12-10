// Preload script to expose update API to renderer
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  checkForUpdates: () => ipcRenderer.send('check-for-updates'),
  downloadUpdate: () => ipcRenderer.send('download-update'),
  restartToInstall: () => ipcRenderer.send('restart-to-install'),
  onUpdateStatus: (callback) => ipcRenderer.on('update-status', (event, data) => callback(data)),
});
