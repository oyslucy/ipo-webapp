import { describe, expect, it } from 'vitest'
import { activeFilterCount, EMPTY_FILTER, matchesFilter, underwriterOptions, type IpoFilter } from './filter'
import type { Ipo } from './ipo'

const ipo = (patch: Partial<Ipo>): Ipo =>
  ({
    code: 'A1',
    name: '에이엘로봇',
    industry: '특수 목적용 기계 제조업',
    underwriters: ['대신증권'],
    hope_price_low: 15700,
    hope_price_high: 17600,
    fixed_price: 17600,
    competition_ratio: 1219.37,
    institution_ratio: 871.74,
    forecast_start: null,
    forecast_end: null,
    subscription_start: '2026-11-06',
    subscription_end: '2026-11-09',
    listing_on: '2026-11-18',
    ...patch,
  }) as Ipo

const f = (patch: Partial<IpoFilter>): IpoFilter => ({ ...EMPTY_FILTER, ...patch })

describe('matchesFilter', () => {
  const target = ipo({})

  it('passes everything with the empty filter', () => {
    expect(matchesFilter(target, EMPTY_FILTER)).toBe(true)
  })
  it('searches name, industry and underwriter ignoring spaces', () => {
    expect(matchesFilter(target, f({ query: '엘로 봇' }))).toBe(true)
    expect(matchesFilter(target, f({ query: '기계' }))).toBe(true)
    expect(matchesFilter(target, f({ query: '대신' }))).toBe(true)
    expect(matchesFilter(target, f({ query: '삼성' }))).toBe(false)
  })
  it('filters by underwriter', () => {
    expect(matchesFilter(target, f({ underwriters: ['대신증권', 'KB증권'] }))).toBe(true)
    expect(matchesFilter(target, f({ underwriters: ['KB증권'] }))).toBe(false)
  })
  it('matches hope price band by overlap and fixed price by inclusion', () => {
    expect(matchesFilter(target, f({ hopePrice: { min: 17000, max: null } }))).toBe(true)
    expect(matchesFilter(target, f({ hopePrice: { min: 18000, max: null } }))).toBe(false)
    expect(matchesFilter(target, f({ fixedPrice: { min: null, max: 17000 } }))).toBe(false)
    expect(matchesFilter(ipo({ fixed_price: null }), f({ fixedPrice: { min: 1, max: null } }))).toBe(false)
  })
  it('filters by schedule date and kind', () => {
    const nov18 = { dateFrom: '2026-11-18', dateTo: '2026-11-18' }
    expect(matchesFilter(target, f(nov18))).toBe(true)
    expect(matchesFilter(target, f({ ...nov18, dateKind: 'listing' }))).toBe(true)
    expect(matchesFilter(target, f({ ...nov18, dateKind: 'subscription' }))).toBe(false)
    expect(matchesFilter(target, f({ dateFrom: '2026-12-01', dateTo: null }))).toBe(false)
  })
  it('filters by minimum institution ratio', () => {
    expect(matchesFilter(target, f({ minInstitutionRatio: 500 }))).toBe(true)
    expect(matchesFilter(target, f({ minInstitutionRatio: 1000 }))).toBe(false)
    expect(matchesFilter(ipo({ institution_ratio: null }), f({ minInstitutionRatio: 1 }))).toBe(false)
  })
  it('filters by minimum competition ratio', () => {
    expect(matchesFilter(target, f({ minRatio: 1000 }))).toBe(true)
    expect(matchesFilter(target, f({ minRatio: 1500 }))).toBe(false)
  })
})

describe('helpers', () => {
  it('counts active groups', () => {
    expect(activeFilterCount(f({ query: 'x' }))).toBe(0)
    expect(activeFilterCount(f({ minRatio: 1, underwriters: ['a'] }))).toBe(2)
  })
  it('orders underwriters by frequency', () => {
    const list = [ipo({ underwriters: ['B', 'A'] }), ipo({ underwriters: ['A'] })]
    expect(underwriterOptions(list)).toEqual(['A', 'B'])
  })
})
