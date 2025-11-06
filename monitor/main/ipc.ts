import { BrowserWindow, ipcMain, app } from 'electron'
import { testApiConnection } from './api'
import { getRequestLogs, State, store } from './store'
import { captureNow, toggleMonitoring } from './lib/monitoring-state'

function getCurrentState(): State {
  return {
    apiKey: store.get('apiKey'),
    captureIntervalMinutes: store.get('captureIntervalMinutes', 5),
    isMonitoring: store.get('isMonitoring', true),
    lastCaptureTime: store.get('lastCaptureTime'),
    requestLogs: store.get('requestLogs', []),
  }
}

export function emitStateChange(): void {
  const state = getCurrentState()
  BrowserWindow.getAllWindows().forEach((window) => {
    window.webContents.send('state-changed', state)
  })
}

export function setupIpcHandlers() {
  ipcMain.handle('getState', async () => {
    return getCurrentState()
  })

  ipcMain.handle('setPartialState', async (_, partialState: Partial<State>) => {
    if (partialState.apiKey !== undefined) {
      store.set('apiKey', partialState.apiKey)
    }
    if (partialState.captureIntervalMinutes !== undefined) {
      store.set('captureIntervalMinutes', partialState.captureIntervalMinutes)
    }
    if (partialState.isMonitoring !== undefined) {
      store.set('isMonitoring', partialState.isMonitoring)
    }
    if (partialState.lastCaptureTime !== undefined) {
      store.set('lastCaptureTime', partialState.lastCaptureTime)
    }
    emitStateChange()
  })

  ipcMain.handle('setApiKey', async (_, apiKey: string) => {
    store.set('apiKey', apiKey)
    emitStateChange()
  })

  ipcMain.handle('setCaptureInterval', async (_, minutes: number) => {
    store.set('captureIntervalMinutes', minutes)
    emitStateChange()
  })

  ipcMain.handle('toggleMonitoring', async () => {
    const newState = toggleMonitoring()
    emitStateChange()
    return newState
  })

  ipcMain.handle('captureNow', async () => {
    captureNow()
  })

  ipcMain.handle('testApiConnection', async () => {
    const apiKey = store.get('apiKey')
    if (!apiKey) {
      return false
    }
    return testApiConnection(apiKey as string)
  })

  ipcMain.handle('getRequestLogs', async () => {
    return getRequestLogs()
  })

  ipcMain.handle('getOpenAtLogin', async () => {
    return app.getLoginItemSettings().openAtLogin
  })

  ipcMain.handle('setOpenAtLogin', async (_, openAtLogin: boolean) => {
    app.setLoginItemSettings({
      openAtLogin,
    })
  })

  // Generic store handlers
  ipcMain.handle('storeGet', (_, key: string) => {
    return store.get(key)
  })

  ipcMain.handle('storeSet', (_, key: string, value: any) => {
    store.set(key, value)
  })
}
