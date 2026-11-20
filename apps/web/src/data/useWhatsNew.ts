import { useCallback, useState } from 'react'
import { shouldShowRelease, type Release } from '../domain/whatsNew'

const KEY = 'ipo-webapp:seen-release'

function initiallyOpen(release: Release): boolean {
  try {
    return shouldShowRelease(localStorage.getItem(KEY), release)
  } catch {
    // Without storage we could not remember the dismissal, so stay quiet rather than nag every visit.
    return false
  }
}

export function useWhatsNew(release: Release): [boolean, () => void] {
  const [open, setOpen] = useState(() => initiallyOpen(release))

  const dismiss = useCallback(() => {
    setOpen(false)
    try {
      localStorage.setItem(KEY, release.id)
    } catch {
      // Ignore; it is closed for this visit either way.
    }
  }, [release])

  return [open, dismiss]
}
