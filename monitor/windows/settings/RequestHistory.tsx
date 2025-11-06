import { useEffect, useState } from 'react'
import { ApiRequestLog } from '../../shared-types'
import * as ipc from '../shared/ipc'
import { Button } from '../shared/ui/Button'

export function RequestHistory() {
  const [logs, setLogs] = useState<ApiRequestLog[]>([])
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    loadLogs()
  }, [])

  useEffect(() => {
    if (!autoRefresh) {
      return
    }

    const interval = setInterval(() => {
      loadLogs()
    }, 2000)

    return () => {
      clearInterval(interval)
    }
  }, [autoRefresh])

  async function loadLogs() {
    const requestLogs = await ipc.getRequestLogs()
    setLogs(requestLogs)
  }

  function formatDate(timestamp: number): string {
    const date = new Date(timestamp)
    return date.toLocaleTimeString()
  }

  function formatDuration(ms: number): string {
    if (ms < 1000) {
      return `${ms}ms`
    }
    return `${(ms / 1000).toFixed(2)}s`
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">Request History</h2>
          <p className="text-xs text-[var(--foreground-secondary)]">
            Last {logs.length} API requests
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadLogs} variant="secondary" size="sm">
            Refresh
          </Button>
          <Button
            onClick={() => {
              setAutoRefresh(!autoRefresh)
            }}
            variant={autoRefresh ? 'primary' : 'secondary'}
            size="sm"
          >
            {autoRefresh ? 'Auto-refresh On' : 'Auto-refresh Off'}
          </Button>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="bg-[var(--surface)] rounded-lg p-4 border border-[var(--border)] text-center text-sm text-[var(--foreground-secondary)]">
          No requests yet. Try testing the API connection or capturing
          screenshots.
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => {
            return (
              <div
                key={log.id}
                className="bg-[var(--surface)] rounded-lg p-3 border border-[var(--border)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`inline-block w-2 h-2 rounded-full ${log.status === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
                      />
                      <span className="text-xs font-mono font-medium">
                        {log.method}
                      </span>
                      <span className="text-xs font-mono text-[var(--foreground-secondary)] truncate">
                        {log.path}
                      </span>
                    </div>
                    {log.error && (
                      <div className="text-xs text-red-500 mt-1 truncate">
                        {log.error}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 text-xs text-[var(--foreground-secondary)]">
                    <span>{formatDate(log.timestamp)}</span>
                    <div className="flex items-center gap-2">
                      {log.statusCode && (
                        <span
                          className={
                            log.statusCode >= 200 && log.statusCode < 300
                              ? 'text-green-500'
                              : 'text-red-500'
                          }
                        >
                          {log.statusCode}
                        </span>
                      )}
                      <span>{formatDuration(log.duration)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

