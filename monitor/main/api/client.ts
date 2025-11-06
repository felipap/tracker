import { API_BASE_URL } from '../config'
import { debug } from '../lib/logger'

export type ApiResponse<T> = { error: string } | { data: T }

export interface FetchOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  apiKey?: string
}

export async function apiFetch<T = unknown>(
  path: string,
  options: FetchOptions = {},
): Promise<ApiResponse<T>> {
  const { body, headers = {}, apiKey, ...restOptions } = options

  const url = `${API_BASE_URL}${path}`
  debug(`API request: ${options.method || 'GET'} ${url}`)

  let res: Response
  try {
    res = await fetch(url, {
      ...restOptions,
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { 'x-tracker-secret': apiKey }),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred'
    console.error('API fetch error:', error)
    return { error: errorMessage }
  }

  if (!res.ok) {
    const errorText = await res.text()
    const errorMessage = `API request failed: ${res.status} ${res.statusText}${errorText ? ` - ${errorText}` : ''}`
    debug(errorMessage)
    return { error: errorMessage }
  }

  const data = (await res.json()) as T
  debug('API request successful')
  return { data }
}
