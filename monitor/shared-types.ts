export interface State {
  apiKey?: string
  captureIntervalMinutes: number
  isMonitoring: boolean
  lastCaptureTime?: string
  requestLogs: ApiRequestLog[]
}

export interface ScreenshotData {
  dataUrl: string
  timestamp: number
  displayId: string
}

export interface ApiRequestLog {
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

export type SharedIpcMethods = {
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
  store: {
    get: <T>(key: string) => Promise<T>
    set: (key: string, value: any) => Promise<void>
  }
}

export type ExposedElectronAPI = SharedIpcMethods & {
  onStateChange: (callback: (state: State) => void) => () => void
  onIpcEvent: (
    channel: string,
    callback: (...args: any[]) => void,
  ) => () => void
}
