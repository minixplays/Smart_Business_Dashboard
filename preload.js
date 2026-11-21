const { contextBridge, ipcRenderer } = require('electron');

/**
 * Preload Script
 * Safely exposes desktop capabilities to renderer scripts without granting full Node.js access.
 */
contextBridge.exposeInMainWorld('desktopAPI', {
  isElectron: true,
  platform: process.platform,

  // App Metadata & Session
  getVersion: () => ipcRenderer.invoke('app:get-version'),
  getPlatform: () => ipcRenderer.invoke('app:get-platform'),
  isFirstLoad: () => ipcRenderer.invoke('app:is-first-load'),
  markLoaded: () => ipcRenderer.send('app:mark-loaded'),

  // External Navigation
  openExternal: (url) => ipcRenderer.invoke('app:open-external', url),

  // Window Controls & Exit Confirmation
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),
  quitApp: () => ipcRenderer.send('app:quit-app'),
  isMaximized: () => ipcRenderer.invoke('window:is-maximized'),
  goHome: () => ipcRenderer.send('window:go-home'),

  // Native Dialogs
  showSaveDialog: (options) => ipcRenderer.invoke('dialog:show-save-dialog', options),
  showOpenDialog: (options) => ipcRenderer.invoke('dialog:show-open-dialog', options),
  showMessageBox: (options) => ipcRenderer.invoke('dialog:show-message-box', options)
});
