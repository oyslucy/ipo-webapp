import { useEffect, useState } from 'react'
import type { Dataset } from '../domain/ipo'

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; dataset: Dataset }

export function useDataset(): State {
  const [state, setState] = useState<State>({ status: 'loading' })

  useEffect(() => {
    const controller = new AbortController()
    fetch(`${import.meta.env.BASE_URL}data/ipos.json`, {
      signal: controller.signal,
      cache: 'no-cache',
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<Dataset>
      })
      .then((dataset) => setState({ status: 'ready', dataset }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setState({ status: 'error', message: error instanceof Error ? error.message : String(error) })
      })
    return () => controller.abort()
  }, [])

  return state
}
