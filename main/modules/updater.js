const { autoUpdater, dialog } = require('electron-updater');
const { dialog: electronDialog } = require('electron');

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
