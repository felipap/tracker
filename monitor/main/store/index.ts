import Store, { Schema } from 'electron-store'
import { State, ApiRequestLog } from '../../shared-types'
import { app } from 'electron'

export type { State } from '../../shared-types'

const MAX_LOG_SIZE = 50

const schema: Schema<State> = {
  apiKey: {
    type: 'string',
  },
  captureIntervalMinutes: {
    type: 'number',
    default: 5,
  },
  isMonitoring: {
    type: 'boolean',
    default: true,
  },
  lastCaptureTime: {
    type: 'string',
  },
  requestLogs: {
    type: 'array',
    default: [],
  },
}

app.setName('monitor-2')

export const store = new Store<State>({
  schema,
  name: 'data',
  clearInvalidConfig: true,
})

console.debug('Store initialized from file:', store.path)

export function getRequestLogs(): ApiRequestLog[] {
  return store.get('requestLogs', [])
}

export function addRequestLog(log: ApiRequestLog): void {
  const logs = getRequestLogs()
  logs.unshift(log)
  if (logs.length > MAX_LOG_SIZE) {
    logs.pop()
  }
  store.set('requestLogs', logs)
}
