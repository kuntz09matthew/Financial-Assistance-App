

const { app, BrowserWindow, Menu } = require('electron');
const { createMainWindow } = require('./modules/window');
const { setupIPC } = require('./modules/ipc');
const { setupAutoUpdater } = require('./modules/updater');

let mainWindow;

app.whenReady().then(() => {
  mainWindow = createMainWindow();
  setupIPC();
  setupAutoUpdater();

  // Add View menu with theme toggle
  const template = [
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
      ],
    },
  ];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
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
