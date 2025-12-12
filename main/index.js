

const { app, BrowserWindow, Menu } = require('electron');
const { createMainWindow } = require('./modules/window');
const { setupIPC } = require('./modules/ipc');
const { setupAutoUpdater } = require('./modules/updater');

let mainWindow;

app.whenReady().then(() => {
  mainWindow = createMainWindow();
  setupIPC();
  setupAutoUpdater();

  // Add File, View, and Help menus
  const template = [
    {
      label: 'File',
      submenu: [
        // Add file-related items here in the future
      ],
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Toggle Dark/Light Mode',
          accelerator: 'CmdOrCtrl+Shift+D',
          click: () => {
            mainWindow.webContents.send('theme-toggle');
          },
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'CmdOrCtrl+Shift+I',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.toggleDevTools();
            }
          },
        },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Check for Updates',
          click: () => {
            mainWindow.webContents.send('manual-update-check');
          },
        },
        // Add more help items here in the future
      ],
    },
  ];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
// Listen for manual update check from menu
const { ipcMain } = require('electron');
ipcMain.on('manual-update-check', () => {
  const { autoUpdater } = require('electron-updater');
  autoUpdater.checkForUpdates();
});
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
