import { desktopCapturer, screen } from 'electron'
import { debug } from './logger'
import { getSystemInfo, SystemInfo } from './system-info'

export interface Screenshot {
  dataUrl: string
  timestamp: number
  displayId: string
  activeWindow?: string
  activeApp?: string
  systemInfo?: string
}

/**
 * Captures screenshots from all displays
 */
export async function captureScreenshots(): Promise<Screenshot[]> {
  try {
    const displays = screen.getAllDisplays()
    debug(`Capturing screenshots from ${displays.length} display(s)`)

    // Get system info first, before capturing screenshots
    const sysInfo = await getSystemInfo()

    // Calculate thumbnail size as 20% of the maximum display dimensions
    const maxWidth = Math.max(...displays.map((d) => d.size.width))
    const maxHeight = Math.max(...displays.map((d) => d.size.height))

    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: {
        width: Math.floor(maxWidth * 0.2),
        height: Math.floor(maxHeight * 0.2),
      },
    })

    const screenshots: Screenshot[] = sources.map((source, index) => {
      const display = displays[index]
      return {
        dataUrl: source.thumbnail.toDataURL(),
        timestamp: Date.now(),
        displayId: display?.id.toString() || `display-${index}`,
        activeWindow: sysInfo.activeWindow,
        activeApp: sysInfo.activeApp,
        systemInfo: JSON.stringify({
          platform: process.platform,
          arch: process.arch,
          nodeVersion: process.version,
        }),
      }
    })

    debug(`Captured ${screenshots.length} screenshot(s)`)
    return screenshots
  } catch (error) {
    console.error('Error capturing screenshots:', error)
    throw error
  }
}
