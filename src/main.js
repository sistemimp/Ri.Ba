const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');
const { generateRiba } = require('./generator');

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 800,
    icon: path.join(__dirname, '..', 'img', 'logo.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile(path.join(__dirname, 'index.html'));
  setupAutoUpdate(win);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('pick-file', async (_evt, filters) => {
  const res = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: filters || []
  });
  if (res.canceled || res.filePaths.length === 0) return null;
  return res.filePaths[0];
});

ipcMain.handle('save-file', async (_evt, defaultPath) => {
  const res = await dialog.showSaveDialog({
    defaultPath,
    filters: [{ name: 'CBI', extensions: ['txt'] }, { name: 'All Files', extensions: ['*'] }]
  });
  if (res.canceled || !res.filePath) return null;
  return res.filePath;
});

ipcMain.handle('generate', async (_evt, payload) => {
  const { csvPath, outputPath, options } = payload;
  const csvText = fs.readFileSync(csvPath, 'utf8');
  const output = generateRiba(csvText, options);
  fs.writeFileSync(outputPath, output, 'utf8');
  return { ok: true };
});

function setupAutoUpdate(win) {
  if (!app.isPackaged) return;
  if (!hasPublishConfiguration()) return;

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('error', (error) => {
    console.error('Auto-update error:', error?.message || error);
  });

  autoUpdater.on('update-downloaded', async () => {
    const response = await dialog.showMessageBox(win, {
      type: 'info',
      buttons: ['Riavvia ora', 'Più tardi'],
      defaultId: 0,
      cancelId: 1,
      title: 'Aggiornamento pronto',
      message: 'È disponibile un aggiornamento ed è stato scaricato.',
      detail: 'Riavvia l’app ora per installarlo.'
    });

    if (response.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });

  autoUpdater.checkForUpdates().catch((error) => {
    console.error('Unable to check for updates:', error?.message || error);
  });
}

function hasPublishConfiguration() {
  try {
    const pkgPath = path.join(app.getAppPath(), 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    return Boolean(pkg?.build?.publish);
  } catch {
    return false;
  }
}
