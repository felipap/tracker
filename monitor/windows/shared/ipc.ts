import { State, ApiRequestLog } from '../../shared-types'

export const ipc = window.electron

export async function getState(): Promise<State> {
  return ipc.getState()
}

export async function setPartialState(
  state: Partial<State>,
): Promise<void> {
  return ipc.setPartialState(state)
}

export async function setApiKey(apiKey: string): Promise<void> {
  return ipc.setApiKey(apiKey)
}

export async function setCaptureInterval(minutes: number): Promise<void> {
  return ipc.setCaptureInterval(minutes)
}

export async function toggleMonitoring(): Promise<boolean> {
  return ipc.toggleMonitoring()
}

export async function captureNow(): Promise<void> {
  return ipc.captureNow()
}

export async function testApiConnection(): Promise<boolean> {
  return ipc.testApiConnection()
}

export async function getRequestLogs(): Promise<ApiRequestLog[]> {
  return ipc.getRequestLogs()
}

export async function getOpenAtLogin(): Promise<boolean> {
  return ipc.getOpenAtLogin()
}

export async function setOpenAtLogin(openAtLogin: boolean): Promise<void> {
  return ipc.setOpenAtLogin(openAtLogin)
}

export const store = {
  get: <T>(key: string): Promise<T> => ipc.store.get<T>(key),
  set: (key: string, value: any): Promise<void> => ipc.store.set(key, value),
}
