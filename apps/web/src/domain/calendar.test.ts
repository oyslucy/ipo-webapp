import { describe, expect, it } from 'vitest'
import { addMonths, monthGrid, weekOf } from './dates'
import { eventsOf, eventsOn, phaseOn } from './events'
import type { Ipo } from './ipo'
import { summarize } from './summary'

const ipo = (patch: Partial<Ipo>): Ipo =>
  ({
    code: 'A1',
    name: 'x',
    stage: 'subscription',
    status_text: null,
    in_feed: true,
    listing_on: null,
    forecast_start: null,
    forecast_end: null,
    subscription_start: null,
    subscription_end: null,
    ...patch,
  }) as Ipo

describe('dates', () => {
  it('builds a sunday-first 6 week grid', () => {
    const grid = monthGrid('2026-11')
    expect(grid).toHaveLength(42)
    expect(grid[0]).toBe('2026-11-01')
    expect(monthGrid('2026-12')[0]).toBe('2026-11-29')
  })
  it('wraps months and finds monday weeks', () => {
    expect(addMonths('2026-12', 1)).toBe('2027-01')
    expect(addMonths('2026-01', -1)).toBe('2025-12')
    expect(weekOf('2026-11-15')).toEqual({ start: '2026-11-09', end: '2026-11-15' })
  })
})

describe('events', () => {
  const sub = ipo({ subscription_start: '2026-11-06', subscription_end: '2026-11-09' })
  const events = eventsOf([sub], '2026-11-09')

  it('skips weekends inside multi-day ranges', () => {
    expect(eventsOn(events, '2026-11-06')).toHaveLength(1)
    expect(eventsOn(events, '2026-11-07')).toHaveLength(0)
    expect(eventsOn(events, '2026-11-09')).toHaveLength(1)
  })
  it('labels phases', () => {
    const [event] = events
    expect(event && phaseOn(event, '2026-11-09')).toBe('end')
  })
  it('summarizes the current week', () => {
    const all = eventsOf([sub, ipo({ code: 'B', stage: 'listing', listing_on: '2026-11-12' })], '2026-11-09')
    const summary = summarize(all, '2026-11-09')
    expect(summary.counts).toEqual({ forecast: 0, subscription: 1, listing: 1 })
  })
})
