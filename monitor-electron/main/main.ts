import 'source-map-support/register'

import { IPCMode, init as SentryInit } from '@sentry/electron/main'
import started from 'electron-squirrel-startup'
import { app } from 'electron'
import { setupIpcHandlers } from './ipc'
import { createTray } from './tray'
import { initMonitor, startMonitoringIfEnabled } from './lib/monitoring-state'
import { createSettingsWindow, settingsWindow } from './windows'

if (app.isPackaged) {
  SentryInit({
    dsn: 'https://df66516e528e1e116926f9631fca55f3@o175888.ingest.us.sentry.io/4509567206555648',
    release: app.getVersion(),
    ipcMode: IPCMode.Classic,
  })
}

app.setAboutPanelOptions({
  applicationName: `Monitor ${app.isPackaged ? '' : '(dev)'}`,
  copyright: 'Copyright © 2025 Felipe Aragão',
  version: app.getVersion(),
  credits: 'Felipe Aragão @feliparagao',
  website: 'https://github.com/faragao/monitor',
})

// Prevent multiple initialization
let isInitialized = false
async function onInit() {
  if (isInitialized) {
    console.log('Monitor app already initialized. Quitting.')
    return
  }
  isInitialized = true

  console.log('Initializing Monitor app...')

  // Create settings window (hidden by default)
  createSettingsWindow()

  // Initialize monitor and start if enabled
  initMonitor()
  startMonitoringIfEnabled()

  // Setup IPC handlers
  setupIpcHandlers()

  // Create tray
  createTray()

  console.log('Monitor app initialized successfully')
}
async function quitApp() {
  console.log('Will quit.')
  // onAppClose()
  app.isQuitting = true
  app.quit()
  process.exit(0)
}

// Declare `isQuitting`
declare global {
  namespace Electron {
    interface App {
      isQuitting?: boolean
    }
  }
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit()
}
// Prevent multiple instances of the app
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  console.log('Did not get lock. Quitting.')
  quitApp()
} else {
  app.on('second-instance', (event, commandLine) => {
    // Someone tried to run a second instance, focus our window instead
    if (settingsWindow) {
      if (settingsWindow.isMinimized()) {
        settingsWindow.restore()
      }
      settingsWindow.focus()
    }
  })
}

app.whenReady().then(onInit)

app.on('window-all-closed', () => {
  // On macOS, keep the app running even when all windows are closed
  // The tray will remain available for background recording
  // Note: Main window is now hidden instead of destroyed when closed
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Before app quits
app.on('before-quit', () => {
  app.isQuitting = true
})
