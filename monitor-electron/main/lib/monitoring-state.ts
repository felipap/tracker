import { store } from '../store'
import { ScreenMonitor } from './monitor'
import { refreshTrayMenu, updateTrayCountdown, setTrayIcon } from '../tray'
import { emitStateChange } from '../ipc'

function getMonitor(): ScreenMonitor {
  if (!monitor) {
    const intervalMinutes = store.get('captureIntervalMinutes', 5)

    monitor = new ScreenMonitor(
      intervalMinutes,
      (secondsRemaining) => {
        updateTrayCountdown(secondsRemaining)
      },
      () => {
        // On capture complete
        setTrayIcon('tray-default.png')
        emitStateChange()
      },
      () => {
        // On capture start
        setTrayIcon('tray-recording.png')
      },
    )
  }

  return monitor
}

let monitor: ScreenMonitor | null = null

/**
 * Initialize the monitor - should be called once on app startup
 */
export function initMonitor(): void {
  getMonitor()
}

/**
 * Toggle monitoring on/off
 * Handles state persistence, monitor control, and tray menu updates
 */
export function toggleMonitoring(): boolean {
  const instance = getMonitor()
  const currentState = store.get('isMonitoring', true)
  const newState = !currentState
  store.set('isMonitoring', newState)

  if (newState) {
    instance.start()
  } else {
    instance.stop()
  }

  // Update tray menu to reflect new state
  refreshTrayMenu()

  return newState
}

/**
 * Trigger an immediate capture
 */
export function captureNow(): void {
  const instance = getMonitor()
  instance.captureNow()
}

/**
 * Start monitoring if enabled in settings
 */
export function startMonitoringIfEnabled(): void {
  const isMonitoring = store.get('isMonitoring', true)
  if (isMonitoring) {
    getMonitor().start()
  }
}
