import { useCallback, useEffect, useState } from 'react'
import { parseFavorites, serializeFavorites, toggleFavorite } from '../domain/favorites'

const KEY = 'ipo-webapp:favorites'

function read(): ReadonlySet<string> {
  try {
    return parseFavorites(localStorage.getItem(KEY))
  } catch {
    // Storage can be blocked (private mode, disabled cookies); favorites then live in memory only.
    return new Set()
  }
}

export function useFavorites(): [ReadonlySet<string>, (code: string) => void] {
  const [codes, setCodes] = useState(read)

  // Keep other open tabs in sync.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => event.key === KEY && setCodes(read())
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const toggle = useCallback((code: string) => {
    setCodes((current) => {
      const next = toggleFavorite(current, code)
      try {
        localStorage.setItem(KEY, serializeFavorites(next))
      } catch {
        // Ignore quota or access errors; the in-memory state still updates.
      }
      return next
    })
  }, [])

  return [codes, toggle]
}
