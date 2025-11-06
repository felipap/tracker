interface State {
  apiKey?: string
  captureIntervalMinutes: number
  isMonitoring: boolean
  lastCaptureTime?: string
  requestLogs: ApiRequestLog[]
}

interface ApiRequestLog {
  id: string
  timestamp: number
  method: string
  path: string
  status: 'success' | 'error'
  statusCode?: number
  duration: number
  error?: string
  response?: string
}

interface ElectronAPI {
  getState: () => Promise<State>
  setPartialState: (state: Partial<State>) => Promise<void>
  setApiKey: (apiKey: string) => Promise<void>
  setCaptureInterval: (minutes: number) => Promise<void>
  toggleMonitoring: () => Promise<boolean>
  captureNow: () => Promise<void>
  testApiConnection: () => Promise<boolean>
  getRequestLogs: () => Promise<ApiRequestLog[]>
  getOpenAtLogin: () => Promise<boolean>
  setOpenAtLogin: (openAtLogin: boolean) => Promise<void>
  onStateChange: (callback: (state: State) => void) => () => void
  onIpcEvent: (
    channel: string,
    callback: (...args: any[]) => void
  ) => () => void
  store: {
    get: <T>(key: string) => Promise<T>
    set: (key: string, value: any) => Promise<void>
  }
}

declare global {
  interface Window {
    electron: ElectronAPI
  }
}

export {}
