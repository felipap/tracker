import { apiFetch } from './client'
import { Screenshot } from '../lib/screenshot'
import { debug } from '../lib/logger'

export interface UploadResponse {
  success: boolean
  message?: string
  screenshotIds?: string[]
}

export interface HealthResponse {
  status: string
  timestamp: string
}

/**
 * Uploads screenshots to the monitoring API
 */
export async function uploadScreenshots(
  screenshots: Screenshot[],
  apiKey: string,
): Promise<UploadResponse> {
  debug(`Uploading ${screenshots.length} screenshot(s) to API`)

  const res = await apiFetch<UploadResponse>('/api/screenshots', {
    method: 'POST',
    apiKey,
    body: {
      screenshots: screenshots.map((s) => ({
        dataUrl: s.dataUrl,
        timestamp: s.timestamp,
        displayId: s.displayId,
        activeWindow: s.activeWindow,
        activeApp: s.activeApp,
        systemInfo: s.systemInfo,
      })),
    },
  })

  if ('error' in res) {
    throw new Error(res.error)
  }

  debug('Successfully uploaded screenshots')
  return res.data
}

/**
 * Tests the API connection and validates the API key
 */
export async function testApiConnection(apiKey: string): Promise<boolean> {
  const res = await apiFetch<HealthResponse>('/api/health', {
    method: 'GET',
    apiKey,
  })

  if ('error' in res) {
    console.error('Error testing API connection:', res.error)
    return false
  }

  return true
}
