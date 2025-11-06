import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export interface SystemInfo {
  activeWindow?: string
  activeApp?: string
}

/**
 * Gets information about the currently active window and application
 */
export async function getSystemInfo(): Promise<SystemInfo> {
  try {
    if (process.platform === 'darwin') {
      return await getMacOSSystemInfo()
    }
    // Add support for other platforms as needed
    return {}
  } catch (error) {
    console.error('Error getting system info:', error)
    return {}
  }
}

async function getMacOSSystemInfo(): Promise<SystemInfo> {
  const script = `
    tell application "System Events"
      set frontApp to first application process whose frontmost is true
      set appName to name of frontApp
      try
        set windowTitle to name of front window of frontApp
      on error
        set windowTitle to ""
      end try
      return {appName, windowTitle}
    end tell
  `

  const { stdout } = await execAsync(`osascript -e '${script}'`)
  const parts = stdout.trim().split(', ')

  return {
    activeApp: parts[0] || undefined,
    activeWindow: parts[1] || undefined,
  }
}
