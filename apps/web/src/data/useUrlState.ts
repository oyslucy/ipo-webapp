import { useCallback, useEffect, useState } from 'react'
import { decodeUrlState, encodeUrlState, type UrlState } from '../domain/urlState'

/** Marks history entries this app pushed, so closing can step back instead of stacking entries. */
const PUSHED = { pushedByApp: true }

function urlFor(state: UrlState): string {
  const query = encodeUrlState(state)
  return `${location.pathname}${query ? `?${query}` : ''}${location.hash}`
}

export interface UrlStateApi {
  state: UrlState
  /** Replace the current entry; for filters and other in-place tweaks. */
  replace: (next: UrlState) => void
  /** Add an entry, so the browser back button undoes it (e.g. closes a sheet). */
  push: (next: UrlState) => void
  /** Undo the last push when we made it, otherwise fall back to replacing. */
  pop: (fallback: UrlState) => void
}

export function useUrlState(): UrlStateApi {
  const [state, setState] = useState(() => decodeUrlState(location.search))

  useEffect(() => {
    const onPop = () => setState(decodeUrlState(location.search))
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const replace = useCallback((next: UrlState) => {
    history.replaceState(history.state, '', urlFor(next))
    setState(next)
  }, [])

  const push = useCallback((next: UrlState) => {
    history.pushState(PUSHED, '', urlFor(next))
    setState(next)
  }, [])

  const pop = useCallback(
    (fallback: UrlState) => {
      const state: unknown = history.state
      if (typeof state === 'object' && state !== null && 'pushedByApp' in state) history.back()
      else replace(fallback)
    },
    [replace],
  )

  return { state, replace, push, pop }
}
