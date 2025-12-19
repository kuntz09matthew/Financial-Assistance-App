
const { autoUpdater, dialog } = require('electron-updater');
const { dialog: electronDialog } = require('electron');
const path = require('path');
const fs = require('fs');

// Configure autoUpdater to use the generic provider and always check the latest release
const updateConfig = {
  provider: 'generic',
  url: 'https://github.com/kuntz09matthew/Financial-Assistance-App/releases/latest/download'
};
autoUpdater.setFeedURL(updateConfig);

function setupAutoUpdater() {
  const app = require('electron').app;
  const dbPath = path.join(app.getAppPath(), 'assets', 'data.db');
  const backupPath = path.join(app.getPath('userData'), 'data.db.bak');
  console.log('[Updater] dbPath:', dbPath);
  console.log('[Updater] backupPath:', backupPath);
  // Backup data.db before update
  function backupUserData() {
    if (fs.existsSync(dbPath)) {
      fs.copyFileSync(dbPath, backupPath);
      console.log('[Updater] Backed up data.db to', backupPath);
    } else {
      console.log('[Updater] data.db not found at', dbPath);
    }
  }
  autoUpdater.autoDownload = false;
  autoUpdater.checkForUpdates();

  autoUpdater.on('update-available', (info) => {
    electronDialog.showMessageBox({
      type: 'info',
      title: 'Update Available',
      message: 'A new version is available. Download now?',
      buttons: ['Yes', 'Later']
    }).then(result => {
      if (result.response === 0) {
        autoUpdater.downloadUpdate();
      }
    });
  });

  autoUpdater.on('update-downloaded', (info) => {
    electronDialog.showMessageBox({
      type: 'info',
      title: 'Update Ready',
      message: 'Update downloaded. Restart to install?',
      buttons: ['Restart', 'Later']
    }).then(result => {
        if (result.response === 0) {
          backupUserData();
          autoUpdater.quitAndInstall();
          // On next launch, restoreUserData() is called in main/index.js
        }
    });
  });

  autoUpdater.on('error', (err) => {
    electronDialog.showErrorBox('Update Error', err == null ? 'unknown' : (err.stack || err).toString());
  });
}

module.exports = { setupAutoUpdater };
