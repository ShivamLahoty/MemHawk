const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  selectMemoryDump: () => ipcRenderer.invoke('select-memory-dump'),
  
  // Plugin operations
  getAvailablePlugins: () => ipcRenderer.invoke('get-available-plugins'),
  
  // Scanning operations
  runVolatilityScan: (options) => ipcRenderer.invoke('run-volatility-scan', options),
  onScanProgress: (callback) => ipcRenderer.on('scan-progress', callback),
  
  // Logging
  getScanLogs: () => ipcRenderer.invoke('get-scan-logs'),
  clearLogs: () => ipcRenderer.invoke('clear-logs'),
  
  // Results
  saveResults: (results) => ipcRenderer.invoke('save-results', results),
  
  // AI Report Generation
  generateGeminiReport: (options) => ipcRenderer.invoke('generate-gemini-report', options),
  generateQuickSummary: (scanResults) => ipcRenderer.invoke('generate-quick-summary', scanResults),
  formatPluginOutput: (options) => ipcRenderer.invoke('format-plugin-output', options),
  saveReport: (options) => ipcRenderer.invoke('save-report', options),
  
  // PDF Report Generation
  generateSignedPDFReport: (options) => ipcRenderer.invoke('generate-signed-pdf-report', options),
  generatePDFFromMarkdown: (options) => ipcRenderer.invoke('generate-pdf-from-markdown', options),
  
  // User Profile Management
  loadUserProfile: () => ipcRenderer.invoke('load-user-profile'),
  saveUserProfile: (profile) => ipcRenderer.invoke('save-user-profile', profile),
  getAnalystSignature: () => ipcRenderer.invoke('get-analyst-signature'),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});