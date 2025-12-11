
const { autoUpdater, dialog } = require('electron-updater');
const { dialog: electronDialog } = require('electron');
const path = require('path');

// Configure autoUpdater to use the generic provider and correct URL
const updateConfig = {
  provider: 'generic',
  url: 'https://github.com/kuntz09matthew/Financial-Assistance-App/releases/download/v1.0.17/'
};
autoUpdater.setFeedURL(updateConfig);

function setupAutoUpdater() {
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
        autoUpdater.quitAndInstall();
      }
    });
  });

  autoUpdater.on('error', (err) => {
    electronDialog.showErrorBox('Update Error', err == null ? 'unknown' : (err.stack || err).toString());
  });
}

module.exports = { setupAutoUpdater };
