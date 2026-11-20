import { describe, expect, it } from 'vitest'
import { EMPTY_FILTER } from './filter'
import { decodeUrlState, DEFAULT_URL_STATE, encodeUrlState, type UrlState } from './urlState'

describe('url state', () => {
  it('encodes the default state as an empty query', () => {
    expect(encodeUrlState(DEFAULT_URL_STATE)).toBe('')
    expect(decodeUrlState('')).toEqual(DEFAULT_URL_STATE)
  })

  it('round-trips every field', () => {
    const state: UrlState = {
      view: 'list',
      tab: 'listed',
      sort: 'ratio_desc',
      filter: {
        query: '바이오 로봇',
        underwriters: ['NH투자증권', '한국투자증권'],
        hopePrice: { min: 10000, max: null },
        fixedPrice: { min: null, max: 30000 },
        dateKind: 'subscription',
        dateFrom: '2026-11-01',
        dateTo: '2026-11-30',
        minRatio: 500,
        minInstitutionRatio: 1000.5,
      },
      favoritesOnly: true,
      ipo: 'A0153R0',
    }
    expect(decodeUrlState(encodeUrlState(state))).toEqual(state)
  })

  it('ignores unknown or malformed values', () => {
    const state = decodeUrlState('?view=grid&tab=nope&sort=x&dk=y&df=11/01&mr=-3&hp=abc~5&fav=yes')
    expect(state.view).toBe('calendar')
    expect(state.tab).toBeNull()
    expect(state.sort).toBe('schedule')
    expect(state.favoritesOnly).toBe(false)
    expect(state.filter).toEqual({ ...EMPTY_FILTER, hopePrice: { min: null, max: 5 } })
  })
})
