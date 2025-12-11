const { BrowserWindow } = require('electron');
const path = require('path');

function createMainWindow() {
  try {
    const win = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        preload: path.join(__dirname, '../../renderer/preload.js'),
        nodeIntegration: false,
        contextIsolation: true,
      },
    });
    win.maximize();
    win.loadFile('renderer/dist/index.html');
    win.webContents.on('did-finish-load', () => {
      win.webContents.send('main-process-message', 'Main process loaded');
    });
    return win;
  } catch (err) {
    console.error('Error creating main window:', err);
  }
}

module.exports = { createMainWindow };
