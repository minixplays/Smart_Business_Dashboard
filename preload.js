const { contextBridge, ipcRenderer } = require('electron');

/**
 * Preload Script
 * Safely exposes desktop capabilities to renderer scripts without granting full Node.js access.
 */
contextBridge.exposeInMainWorld('desktopAPI', {
  isElectron: true,
  platform: process.platform,

  // App Metadata
  getVersion: () => ipcRenderer.invoke('app:get-version'),
  getPlatform: () => ipcRenderer.invoke('app:get-platform'),

  // External Navigation
  openExternal: (url) => ipcRenderer.invoke('app:open-external', url),

  // Window Controls
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),
  isMaximized: () => ipcRenderer.invoke('window:is-maximized'),
  goHome: () => ipcRenderer.send('window:go-home'),

  // Native Dialogs
  showSaveDialog: (options) => ipcRenderer.invoke('dialog:show-save-dialog', options),
  showOpenDialog: (options) => ipcRenderer.invoke('dialog:show-open-dialog', options),
  showMessageBox: (options) => ipcRenderer.invoke('dialog:show-message-box', options)
});
