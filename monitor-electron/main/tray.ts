import { app, Menu, nativeImage, Tray } from 'electron'
import path from 'path'
import { store } from './store'
import { captureNow, toggleMonitoring } from './lib/monitoring-state'
import { showSettingsWindow } from './windows'

let tray: Tray | null = null
let countdownText: string = ''

export function createTray(): Tray {
  if (tray) {
    return tray
  }

  const iconPath = getImagePath('tray-default.png')
  console.log('iconPath', iconPath)
  const icon = nativeImage.createFromPath(iconPath)
  const trayIcon = icon.resize({ width: 18, quality: 'best' })
  trayIcon.setTemplateImage(true)

  tray = new Tray(trayIcon)
  tray.setToolTip('Screen Monitor')

  updateTrayMenu()

  return tray
}

export function updateTrayCountdown(secondsRemaining: number): void {
  if (!tray) {
    return
  }

  const minutes = Math.floor(secondsRemaining / 60)
  const seconds = secondsRemaining % 60
  countdownText = `${minutes}:${seconds.toString().padStart(2, '0')}`

  tray.setToolTip(`Screen Monitor - Next capture in ${countdownText}`)

  // Update the menu to show the countdown
  updateTrayMenu()
}

function updateTrayMenu(): void {
  if (!tray) {
    return
  }

  const isMonitoring = store.get('isMonitoring', true)

  const menu = Menu.buildFromTemplate([
    {
      label: countdownText ? `Next capture: ${countdownText}` : 'Monitor',
      enabled: false,
    },
    { type: 'separator' },
    {
      label: 'Capture Now',
      click: captureNow,
    },
    {
      label: isMonitoring ? 'Pause Monitoring' : 'Resume Monitoring',
      click: toggleMonitoring,
    },
    { type: 'separator' },
    {
      label: 'Settings',
      click: showSettingsWindow,
    },
    {
      label: 'Quit',
      click: () => {
        app.quit()
      },
    },
  ])

  tray.setContextMenu(menu)
}

export function refreshTrayMenu(): void {
  updateTrayMenu()
}

export function setTrayIcon(iconName: string): void {
  if (!tray) {
    return
  }

  const iconPath = getImagePath(iconName)
  const icon = nativeImage.createFromPath(iconPath)
  const trayIcon = icon.resize({ width: 18, quality: 'best' })
  trayIcon.setTemplateImage(true)

  tray.setImage(trayIcon)
}

export function destroyTray(): void {
  if (tray) {
    tray.destroy()
    tray = null
  }
}

export function getImagePath(name: string): string {
  const base = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets')
  const imagePath = path.join(base, name)

  console.log(`Looking for image: ${name}`)
  console.log(`  Base path: ${base}`)
  console.log(`  Full path: ${imagePath}`)
  console.log(`  __dirname: ${__dirname}`)
  console.log(`  process.resourcesPath: ${process.resourcesPath}`)
  console.log(`  app.isPackaged: ${app.isPackaged}`)

  return imagePath
}
