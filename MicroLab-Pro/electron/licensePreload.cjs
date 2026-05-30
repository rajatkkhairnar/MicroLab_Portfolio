/**
 * licensePreload.cjs — Preload Script for License Activation Window
 *
 * Exposes a minimal API for the license activation HTML page.
 * This is separate from the main app's preload.cjs.
 */
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('licenseAPI', {
  /** Activate a license key */
  activate: (key) => ipcRenderer.invoke('activate-license', key),

  /** Open the sign-up page in the default browser */
  openSignup: () => ipcRenderer.send('open-signup-page'),

  /** Listen for the reason message from main process */
  onSetReason: (callback) => {
    ipcRenderer.on('set-license-reason', (_event, reason) => callback(reason));
  },
});
