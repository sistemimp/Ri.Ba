const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ribaApi', {
  pickFile: (filters) => ipcRenderer.invoke('pick-file', filters),
  saveFile: (defaultPath) => ipcRenderer.invoke('save-file', defaultPath),
  generate: (payload) => ipcRenderer.invoke('generate', payload)
});
