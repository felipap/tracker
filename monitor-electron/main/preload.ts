import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electron', {
  // State management
  getState: () => ipcRenderer.invoke('getState'),
  setPartialState: (state: any) => ipcRenderer.invoke('setPartialState', state),
  setApiKey: (apiKey: string) => ipcRenderer.invoke('setApiKey', apiKey),
  setCaptureInterval: (minutes: number) =>
    ipcRenderer.invoke('setCaptureInterval', minutes),
  toggleMonitoring: () => ipcRenderer.invoke('toggleMonitoring'),
  captureNow: () => ipcRenderer.invoke('captureNow'),
  testApiConnection: () => ipcRenderer.invoke('testApiConnection'),
  getRequestLogs: () => ipcRenderer.invoke('getRequestLogs'),
  getOpenAtLogin: () => ipcRenderer.invoke('getOpenAtLogin'),
  setOpenAtLogin: (openAtLogin: boolean) =>
    ipcRenderer.invoke('setOpenAtLogin', openAtLogin),

  // Event subscriptions
  onStateChange: (callback: (state: any) => void) => {
    const listener = (_event: any, state: any) => {
      callback(state)
    }
    ipcRenderer.on('state-changed', listener)
    return () => {
      ipcRenderer.removeListener('state-changed', listener)
    }
  },

  onIpcEvent: (channel: string, callback: (...args: any[]) => void) => {
    const listener = (_event: any, ...args: any[]) => {
      callback(...args)
    }
    ipcRenderer.on(channel, listener)
    return () => {
      ipcRenderer.removeListener(channel, listener)
    }
  },

  // Generic store access
  store: {
    get: <T,>(key: string) => ipcRenderer.invoke('storeGet', key) as Promise<T>,
    set: (key: string, value: any) => ipcRenderer.invoke('storeSet', key, value),
  },
})

