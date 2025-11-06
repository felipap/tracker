import { BrowserWindow, app } from 'electron'
import { existsSync } from 'fs'
import { join } from 'path'

export let settingsWindow: BrowserWindow | null = null

export function createSettingsWindow(): BrowserWindow {
  if (settingsWindow) {
    throw new Error('SettingsWindow already created')
  }

  const settingsWindowOptions: Electron.BrowserWindowConstructorOptions = {
    title: 'Monitor Settings',
    width: 520,
    height: 440,
    minWidth: 480,
    minHeight: 400,
    center: true,
    resizable: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, 'preload.js'),
    },
    vibrancy: 'under-window',
    visualEffectState: 'active',
    show: false,
  }

  const iconPath = getIconPath()
  if (iconPath) {
    settingsWindowOptions.icon = iconPath
  }

  settingsWindow = new BrowserWindow(settingsWindowOptions)

  // Load the settings page
  if (process.env.NODE_ENV === 'development') {
    settingsWindow.loadURL('http://localhost:4001/index.html')
  } else {
    const settingsPath = join(
      __dirname,
      '..',
      'windows',
      'settings',
      'index.html',
    )
    settingsWindow.loadFile(settingsPath)
  }

  // Clean up reference when window is closed
  settingsWindow.on('closed', () => {
    settingsWindow = null
  })

  return settingsWindow
}

export function getSettingsWindow(): BrowserWindow | null {
  return settingsWindow
}

export function showSettingsWindow(): void {
  if (!settingsWindow) {
    createSettingsWindow()
  }
  settingsWindow?.show()
  settingsWindow?.focus()
}

function getIconPath(): string | null {
  const possibleIconPaths = [
    join(__dirname, '../assets', 'icon.png'),
    join(__dirname, '../assets', 'icon.icns'),
    join(process.resourcesPath, 'assets', 'icon.png'),
    join(process.resourcesPath, 'assets', 'icon.icns'),
    join(process.cwd(), 'assets', 'icon.png'),
    join(process.cwd(), 'assets', 'icon.icns'),
  ]

  for (const path of possibleIconPaths) {
    if (existsSync(path)) {
      return path
    }
  }

  return null
}
