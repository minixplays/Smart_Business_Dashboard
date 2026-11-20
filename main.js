const { app, BrowserWindow, Menu, shell, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// Ensure unique application user model ID for Windows taskbar & notifications
app.setAppUserModelId('com.smartbusiness.dashboard');

// Single instance lock to prevent duplicate app windows
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
}

let mainWindow = null;

// Window state management for smooth desktop persistence
const stateFilePath = path.join(app.getPath('userData'), 'window-state.json');

function loadWindowState() {
  const defaultState = {
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    isMaximized: false
  };

  try {
    if (fs.existsSync(stateFilePath)) {
      const data = JSON.parse(fs.readFileSync(stateFilePath, 'utf8'));
      return { ...defaultState, ...data };
    }
  } catch (err) {
    console.warn('Failed to load window state, using defaults:', err);
  }
  return defaultState;
}

function saveWindowState() {
  if (!mainWindow) return;
  try {
    const isMaximized = mainWindow.isMaximized();
    const bounds = mainWindow.getBounds();
    const state = {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      isMaximized
    };
    fs.writeFileSync(stateFilePath, JSON.stringify(state, null, 2), 'utf8');
  } catch (err) {
    console.warn('Failed to save window state:', err);
  }
}

function createMainWindow() {
  const windowState = loadWindowState();

  mainWindow = new BrowserWindow({
    x: windowState.x,
    y: windowState.y,
    width: windowState.width,
    height: windowState.height,
    minWidth: windowState.minWidth,
    minHeight: windowState.minHeight,
    show: false, // Wait until ready-to-show for flicker-free load
    backgroundColor: '#faf8f5', // Matches dashboard theme-bg
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      webSecurity: true,
      spellcheck: true
    }
  });

  if (windowState.isMaximized) {
    mainWindow.maximize();
  }

  // Load entry point
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Forward renderer console messages to terminal for debugging
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`[Renderer] ${message} (${sourceId ? path.basename(sourceId) : 'inline'}:${line})`);
  });

  // Show gracefully when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // Intercept external links so they open in the user's default browser (WhatsApp, docs, etc.)
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:') || url.startsWith('mailto:')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    // Keep local file navigation inside the app; route external URLs outside
    if (url.startsWith('http:') || url.startsWith('https:')) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  // Save state on close / resize
  mainWindow.on('close', () => {
    saveWindowState();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  setupAppMenu();
}

function setupAppMenu() {
  const isMac = process.platform === 'darwin';

  const template = [
    ...(isMac ? [{ role: 'appMenu' }] : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'Dashboard Home',
          accelerator: 'CmdOrCtrl+H',
          click: () => {
            if (mainWindow) {
              mainWindow.loadFile(path.join(__dirname, 'index.html'));
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Print Page',
          accelerator: 'CmdOrCtrl+P',
          click: () => {
            if (mainWindow) mainWindow.webContents.print();
          }
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit', label: 'Exit Application' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload', accelerator: 'CmdOrCtrl+R' },
        { role: 'forceReload', accelerator: 'CmdOrCtrl+Shift+R' },
        {
          label: 'Developer Tools',
          accelerator: 'F12',
          click: () => {
            if (mainWindow) mainWindow.webContents.toggleDevTools();
          }
        },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        {
          label: 'Toggle Dark / Light Theme',
          accelerator: 'CmdOrCtrl+T',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.executeJavaScript('if (typeof toggleTheme === "function") toggleTheme();');
            }
          }
        },
        { role: 'togglefullscreen', accelerator: 'F11' }
      ]
    },
    {
      label: 'Navigation',
      submenu: [
        {
          label: 'Back',
          accelerator: 'Alt+Left',
          click: () => {
            if (mainWindow && mainWindow.webContents.canGoBack()) {
              mainWindow.webContents.goBack();
            }
          }
        },
        {
          label: 'Forward',
          accelerator: 'Alt+Right',
          click: () => {
            if (mainWindow && mainWindow.webContents.canGoForward()) {
              mainWindow.webContents.goForward();
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Quick Tools: Global Count (gcMaker)',
          click: () => {
            if (mainWindow) mainWindow.loadFile(path.join(__dirname, 'gcMaker.html'));
          }
        },
        {
          label: 'Quick Tools: PO Maker',
          click: () => {
            if (mainWindow) mainWindow.loadFile(path.join(__dirname, 'poMaker.html'));
          }
        },
        {
          label: 'Quick Tools: Reports',
          click: () => {
            if (mainWindow) mainWindow.loadFile(path.join(__dirname, 'reports.html'));
          }
        },
        {
          label: 'Quick Tools: Smart Notes',
          click: () => {
            if (mainWindow) mainWindow.loadFile(path.join(__dirname, 'smartNotes.html'));
          }
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Open Web Version / GitHub',
          click: async () => {
            await shell.openExternal('https://github.com/minixplays/Smart_Business_Dashboard');
          }
        },
        { type: 'separator' },
        {
          label: 'About Smart Business Dashboard',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About Smart Business Dashboard',
              message: 'Smart Business Dashboard Desktop Application',
              detail: `Version: ${app.getVersion()}\nElectron: ${process.versions.electron}\nChrome: ${process.versions.chrome}\nNode: ${process.versions.node}\nOS: ${process.platform} ${process.arch}`,
              buttons: ['OK']
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC Handlers for desktop interactions
ipcMain.handle('app:get-version', () => app.getVersion());
ipcMain.handle('app:get-platform', () => process.platform);

ipcMain.handle('app:open-external', async (event, targetUrl) => {
  if (targetUrl && (targetUrl.startsWith('http://') || targetUrl.startsWith('https://') || targetUrl.startsWith('mailto:'))) {
    await shell.openExternal(targetUrl);
    return true;
  }
  return false;
});

ipcMain.on('window:minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window:maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('window:close', () => {
  if (mainWindow) mainWindow.close();
});

ipcMain.handle('window:is-maximized', () => {
  return mainWindow ? mainWindow.isMaximized() : false;
});

ipcMain.on('window:go-home', () => {
  if (mainWindow) mainWindow.loadFile(path.join(__dirname, 'index.html'));
});

ipcMain.handle('dialog:show-save-dialog', async (event, options) => {
  if (!mainWindow) return null;
  return await dialog.showSaveDialog(mainWindow, options || {});
});

ipcMain.handle('dialog:show-open-dialog', async (event, options) => {
  if (!mainWindow) return null;
  return await dialog.showOpenDialog(mainWindow, options || {});
});

ipcMain.handle('dialog:show-message-box', async (event, options) => {
  if (!mainWindow) return null;
  return await dialog.showMessageBox(mainWindow, options || {});
});

// Second instance handling
app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

// App Lifecycle
app.whenReady().then(() => {
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
