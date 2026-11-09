import { eventsForIpo, overlaps, type EventKind } from './events'
import type { Ipo } from './ipo'

export interface NumberRange {
  min: number | null
  max: number | null
}

export interface IpoFilter {
  query: string
  underwriters: string[]
  hopePrice: NumberRange
  fixedPrice: NumberRange
  dateKind: EventKind | 'any'
  dateFrom: string | null
  dateTo: string | null
  minRatio: number | null
}

export const EMPTY_FILTER: IpoFilter = {
  query: '',
  underwriters: [],
  hopePrice: { min: null, max: null },
  fixedPrice: { min: null, max: null },
  dateKind: 'any',
  dateFrom: null,
  dateTo: null,
  minRatio: null,
}

const normalize = (text: string) => text.toLowerCase().replace(/\s+/g, '')

function matchesQuery(ipo: Ipo, query: string): boolean {
  const needle = normalize(query)
  if (needle === '') return true
  const haystack = [ipo.name, ipo.industry ?? '', ...ipo.underwriters]
  return haystack.some((text) => normalize(text).includes(needle))
}

function rangeIsSet(range: NumberRange): boolean {
  return range.min !== null || range.max !== null
}

function inRange(value: number | null, range: NumberRange): boolean {
  if (!rangeIsSet(range)) return true
  if (value === null) return false
  return (range.min === null || value >= range.min) && (range.max === null || value <= range.max)
}

/** A price band matches when it overlaps the requested range at all. */
function bandOverlaps(low: number | null, high: number | null, range: NumberRange): boolean {
  if (!rangeIsSet(range)) return true
  const lo = low ?? high
  const hi = high ?? low
  if (lo === null || hi === null) return false
  return (range.max === null || lo <= range.max) && (range.min === null || hi >= range.min)
}

function matchesDate(ipo: Ipo, filter: IpoFilter): boolean {
  if (filter.dateFrom === null && filter.dateTo === null) return true
  const from = filter.dateFrom ?? '0000-01-01'
  const to = filter.dateTo ?? '9999-12-31'
  return eventsForIpo(ipo).some(
    (event) => (filter.dateKind === 'any' || event.kind === filter.dateKind) && overlaps(event, from, to),
  )
}

export function matchesFilter(ipo: Ipo, filter: IpoFilter): boolean {
  return (
    matchesQuery(ipo, filter.query) &&
    (filter.underwriters.length === 0 ||
      ipo.underwriters.some((name) => filter.underwriters.includes(name))) &&
    bandOverlaps(ipo.hope_price_low, ipo.hope_price_high, filter.hopePrice) &&
    inRange(ipo.fixed_price, filter.fixedPrice) &&
    matchesDate(ipo, filter) &&
    (filter.minRatio === null ||
      (ipo.competition_ratio !== null && ipo.competition_ratio >= filter.minRatio))
  )
}

/** Number of filter groups in use, excluding the search query. */
export function activeFilterCount(filter: IpoFilter): number {
  return [
    filter.underwriters.length > 0,
    rangeIsSet(filter.hopePrice),
    rangeIsSet(filter.fixedPrice),
    filter.dateFrom !== null || filter.dateTo !== null,
    filter.minRatio !== null,
  ].filter(Boolean).length
}

/** Underwriters ordered by how many deals they lead, most active first. */
export function underwriterOptions(ipos: readonly Ipo[]): string[] {
  const counts = new Map<string, number>()
  for (const name of ipos.flatMap((ipo) => ipo.underwriters)) {
    counts.set(name, (counts.get(name) ?? 0) + 1)
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ko'))
    .map(([name]) => name)
}
