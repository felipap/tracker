import { useState, useEffect } from 'react'
import { Button } from '../shared/ui/Button'
import { RequestHistory } from './RequestHistory'
import { useBackendState } from '../shared/useBackendState'
import * as ipc from '../shared/ipc'

type Tab = 'settings' | 'history'

export function App() {
  const { state, setPartialState, loading } = useBackendState()
  const [activeTab, setActiveTab] = useState<Tab>('settings')
  const [apiKey, setApiKey] = useState('')
  const [interval, setInterval] = useState(5)
  const [openAtLogin, setOpenAtLogin] = useState(false)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle')

  // Update local form state when backend state changes
  if (state && !loading) {
    if (apiKey === '' && state.apiKey) {
      setApiKey(state.apiKey)
    }
    if (interval !== state.captureIntervalMinutes) {
      setInterval(state.captureIntervalMinutes)
    }
  }

  // Load startup on login setting
  useEffect(() => {
    ipc.getOpenAtLogin().then(setOpenAtLogin)
  }, [])

  async function handleSaveApiKey() {
    await setPartialState({ apiKey })
  }

  async function handleSaveInterval() {
    await setPartialState({ captureIntervalMinutes: interval })
  }

  async function handleToggleMonitoring() {
    await ipc.toggleMonitoring()
  }

  async function handleCaptureNow() {
    await ipc.captureNow()
  }

  async function handleTestConnection() {
    setIsTestingConnection(true)
    setConnectionStatus('idle')
    const result = await ipc.testApiConnection()
    setConnectionStatus(result ? 'success' : 'error')
    setIsTestingConnection(false)
  }

  async function handleToggleStartupOnLogin() {
    const newValue = !openAtLogin
    await ipc.setOpenAtLogin(newValue)
    setOpenAtLogin(newValue)
  }

  if (loading || !state) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col">
      {/* Tabs */}
      <div className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex gap-4">
            <button
              onClick={() => {
                setActiveTab('settings')
              }}
              className={`px-3 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-[var(--foreground)]'
                  : 'border-transparent text-[var(--foreground-secondary)] hover:text-[var(--foreground)]'
              }`}
            >
              Settings
            </button>
            <button
              onClick={() => {
                setActiveTab('history')
              }}
              className={`px-3 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'history'
                  ? 'border-blue-500 text-[var(--foreground)]'
                  : 'border-transparent text-[var(--foreground-secondary)] hover:text-[var(--foreground)]'
              }`}
            >
              Request History
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-2xl mx-auto">
          {activeTab === 'settings' ? (
            <div className="space-y-4">
              <div>
                <h1 className="text-xl font-bold mb-1">Monitor Settings</h1>
                <p className="text-xs text-[var(--foreground-secondary)]">
                  Configure your screen monitoring preferences
                </p>
              </div>

              {/* Status */}
              <div className="bg-[var(--surface)] rounded-lg p-3 border border-[var(--border)]">
                <h2 className="text-sm font-semibold mb-2">Status</h2>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[var(--foreground-secondary)]">
                      Monitoring:
                    </span>
                    <span
                      className={
                        state.isMonitoring ? 'text-green-500' : 'text-gray-500'
                      }
                    >
                      {state.isMonitoring ? 'Active' : 'Paused'}
                    </span>
                  </div>
                  {state.lastCaptureTime && (
                    <div className="flex justify-between">
                      <span className="text-[var(--foreground-secondary)]">
                        Last Capture:
                      </span>
                      <span>
                        {new Date(state.lastCaptureTime).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-3">
                  <Button onClick={handleToggleMonitoring} size="sm">
                    {state.isMonitoring ? 'Pause' : 'Resume'} Monitoring
                  </Button>
                  <Button
                    onClick={handleCaptureNow}
                    variant="secondary"
                    size="sm"
                  >
                    Capture Now
                  </Button>
                </div>
              </div>

              {/* API Key */}
              <div className="bg-[var(--surface)] rounded-lg p-3 border border-[var(--border)]">
                <h2 className="text-sm font-semibold mb-2">
                  API Configuration
                </h2>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      API Secret
                    </label>
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => {
                        setApiKey(e.target.value)
                      }}
                      className="w-full px-2 py-1.5 text-sm bg-[var(--input-background)] border border-[var(--border)] rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Enter your API secret"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveApiKey} size="sm">
                      Save API Key
                    </Button>
                    <Button
                      onClick={handleTestConnection}
                      disabled={isTestingConnection || !apiKey}
                      variant="secondary"
                      size="sm"
                    >
                      {isTestingConnection ? 'Testing...' : 'Test Connection'}
                    </Button>
                  </div>
                  {connectionStatus !== 'idle' && (
                    <div
                      className={`text-xs ${connectionStatus === 'success' ? 'text-green-500' : 'text-red-500'}`}
                    >
                      {connectionStatus === 'success'
                        ? '✓ Connection successful'
                        : '✗ Connection failed'}
                    </div>
                  )}
                </div>
              </div>

              {/* Capture Interval */}
              <div className="bg-[var(--surface)] rounded-lg p-3 border border-[var(--border)]">
                <h2 className="text-sm font-semibold mb-2">Capture Settings</h2>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Capture Interval (minutes)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={interval}
                      onChange={(e) => {
                        setInterval(parseInt(e.target.value))
                      }}
                      className="w-full px-2 py-1.5 text-sm bg-[var(--input-background)] border border-[var(--border)] rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <Button onClick={handleSaveInterval} size="sm">
                    Save Interval
                  </Button>
                </div>
              </div>

              {/* Application Settings */}
              <div className="bg-[var(--surface)] rounded-lg p-3 border border-[var(--border)]">
                <h2 className="text-sm font-semibold mb-2">
                  Application Settings
                </h2>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-xs font-medium">
                        Start at Login
                      </label>
                      <p className="text-xs text-[var(--foreground-secondary)] mt-0.5">
                        Automatically start Monitor when you log in
                      </p>
                    </div>
                    <button
                      onClick={handleToggleStartupOnLogin}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        openAtLogin ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          openAtLogin ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <RequestHistory />
          )}
        </div>
      </div>
    </div>
  )
}
