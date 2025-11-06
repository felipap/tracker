import { debug } from './logger'
import { captureScreenshots } from './screenshot'
import { uploadScreenshots } from '../api'
import { store, addRequestLog } from '../store'

export class ScreenMonitor {
  private intervalId: NodeJS.Timeout | null = null
  private nextCaptureTime: number = 0
  private isCapturing: boolean = false

  constructor(
    private intervalMinutes: number = 5,
    private onCountdownUpdate?: (secondsRemaining: number) => void,
    private onCaptureComplete?: () => void,
    private onCaptureStart?: () => void,
  ) {}

  /**
   * Starts the monitoring service
   */
  start(): void {
    if (this.intervalId) {
      debug('Monitor already running')
      return
    }

    debug(`Starting monitor with ${this.intervalMinutes} minute interval`)
    this.scheduleNextCapture()
    this.startCountdownTimer()
  }

  /**
   * Stops the monitoring service
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
      debug('Monitor stopped')
    }
  }

  /**
   * Gets the number of seconds until the next capture
   */
  getSecondsUntilNextCapture(): number {
    if (this.nextCaptureTime === 0) {
      return 0
    }
    return Math.max(0, Math.floor((this.nextCaptureTime - Date.now()) / 1000))
  }

  /**
   * Updates the capture interval
   */
  setInterval(minutes: number): void {
    this.intervalMinutes = minutes
    if (this.intervalId) {
      this.stop()
      this.start()
    }
  }

  /**
   * Triggers an immediate capture
   */
  async captureNow(): Promise<void> {
    await this.performCapture()
    this.scheduleNextCapture()
  }

  private scheduleNextCapture(): void {
    this.nextCaptureTime = Date.now() + this.intervalMinutes * 60 * 1000
    debug(
      `Next capture scheduled for ${new Date(this.nextCaptureTime).toLocaleTimeString()}`,
    )
  }

  private startCountdownTimer(): void {
    // Update countdown every second
    this.intervalId = setInterval(() => {
      const secondsRemaining = this.getSecondsUntilNextCapture()

      if (this.onCountdownUpdate) {
        this.onCountdownUpdate(secondsRemaining)
      }

      // Time to capture!
      if (secondsRemaining === 0 && !this.isCapturing) {
        this.performCapture().then(() => {
          this.scheduleNextCapture()
        })
      }
    }, 1000)
  }

  private async performCapture(): Promise<void> {
    if (this.isCapturing) {
      debug('Capture already in progress, skipping')
      return
    }

    this.isCapturing = true

    // Notify that capture started
    if (this.onCaptureStart) {
      this.onCaptureStart()
    }

    const startTime = Date.now()
    const logId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    try {
      debug('Performing screenshot capture')

      const apiKey = store.get('apiKey') as string
      if (!apiKey) {
        console.error('No API key configured')
        return
      }

      const screenshots = await captureScreenshots()
      const response = await uploadScreenshots(screenshots, apiKey)

      const duration = Date.now() - startTime

      // Log successful upload
      addRequestLog({
        id: logId,
        timestamp: startTime,
        method: 'POST',
        path: '/api/screenshots',
        status: 'success',
        statusCode: 200,
        duration,
        response: JSON.stringify(response),
      })

      // Update last capture time
      store.set('lastCaptureTime', new Date().toISOString())

      // Notify that capture completed
      if (this.onCaptureComplete) {
        this.onCaptureComplete()
      }

      debug('Screenshot capture and upload completed successfully')
    } catch (error) {
      const duration = Date.now() - startTime
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred'

      // Log failed upload
      addRequestLog({
        id: logId,
        timestamp: startTime,
        method: 'POST',
        path: '/api/screenshots',
        status: 'error',
        duration,
        error: errorMessage,
      })

      console.error('Error during capture:', error)
    } finally {
      this.isCapturing = false
    }
  }
}
