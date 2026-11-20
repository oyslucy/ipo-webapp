import { describe, expect, it } from 'vitest'
import { LATEST_RELEASE, shouldShowRelease } from './whatsNew'

describe('shouldShowRelease', () => {
  it('shows until this release has been seen', () => {
    expect(shouldShowRelease(null, LATEST_RELEASE)).toBe(true)
    expect(shouldShowRelease('2026-01-01', LATEST_RELEASE)).toBe(true)
    expect(shouldShowRelease(LATEST_RELEASE.id, LATEST_RELEASE)).toBe(false)
  })
})
