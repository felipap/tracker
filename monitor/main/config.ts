/**
 * Application configuration
 */

import chalk from 'chalk'
import dotenv from 'dotenv'
dotenv.config()

/**
 * API base URL - can be updated to use localhost for development
 * or production URL for live usage
 */
export const API_BASE_URL =
  process.env.API_BASE_URL || 'https://tracker.felipap.com'

if (process.env.API_BASE_URL) {
  console.log(chalk.red('Custom API_BASE_URL'), process.env.API_BASE_URL)
}

/**
 * Update the API base URL at runtime
 * Note: This affects the imported value, but doesn't persist across restarts
 */
export function setApiBaseUrl(url: string): void {
  // For runtime updates, consider using a store or environment variable
  process.env.API_BASE_URL = url
}
