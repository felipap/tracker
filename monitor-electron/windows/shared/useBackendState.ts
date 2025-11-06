import { useEffect, useRef, useState } from 'react'

type State = Awaited<ReturnType<typeof window.electron.getState>>

export function useBackendState() {
  const [loading, setLoading] = useState(true)
  const [state, setState] = useState<State | null>(null)
  const stateRef = useRef<State | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const currentState = await window.electron.getState()
      stateRef.current = currentState
      setState(currentState)
      setLoading(false)
    }

    load()

    // Subscribe to state changes
    const unsubscribe = window.electron.onStateChange((newState) => {
      stateRef.current = newState
      setState(newState)
    })

    // Cleanup subscription on unmount
    return () => {
      unsubscribe()
    }
  }, [])

  async function setPartialState(partialState: Partial<State>) {
    await window.electron.setPartialState(partialState)
  }

  return {
    state,
    stateRef,
    setPartialState,
    loading,
  }
}

