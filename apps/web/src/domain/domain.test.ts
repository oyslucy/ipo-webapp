import { describe, expect, it } from 'vitest'
import { formatAmount, formatDate, formatPriceBand, formatRange, formatRatio } from './format'
import type { Ipo } from './ipo'
import { todayKst } from './ipo'
import { scheduleOf, stepState } from './schedule'
import { groupByTab, tabOf } from './tabs'

const base: Ipo = {
  code: 'A1',
  name: '테스트',
  market: 'KOSDAQ',
  industry: null,
  stage: 'listing',
  status_text: null,
  underwriters: [],
  hope_price_low: null,
  hope_price_high: null,
  fixed_price: null,
  offered_shares: null,
  offering_amount: null,
  competition_ratio: null,
  review_requested_on: null,
  approved_on: null,
  filed_on: null,
  forecast_start: null,
  forecast_end: null,
  subscription_start: null,
  subscription_end: null,
  allocation_on: null,
  payment_on: null,
  refund_on: null,
  listing_on: null,
  last_seen_on: '2026-11-09',
  in_feed: true,
}
const make = (patch: Partial<Ipo>): Ipo => ({ ...base, ...patch })

describe('format', () => {
  it('formats dates with weekday', () => {
    expect(formatDate('2026-11-09')).toBe('11.9(월)')
    expect(formatRange('2026-11-06', '2026-11-09')).toBe('11.6(금) ~ 11.9(월)')
    expect(formatRange('2026-11-06', '2026-11-06')).toBe('11.6(금)')
  })
  it('formats money', () => {
    expect(formatPriceBand(15700, 17600)).toBe('15,700 ~ 17,600원')
    expect(formatPriceBand(17600, 17600)).toBe('17,600원')
    expect(formatAmount(42_240_000_000)).toBe('422억원')
    expect(formatRatio(1219.37)).toBe('1,219.37 : 1')
  })
})

describe('tabs', () => {
  const today = '2026-11-09'
  it('moves past listings to listed even after leaving the feed', () => {
    expect(tabOf(make({ listing_on: '2026-11-05', in_feed: false }), today)).toBe('listed')
    expect(tabOf(make({ listing_on: '2026-11-10' }), today)).toBe('listing')
  })
  it('hides stale records without a listing date', () => {
    expect(tabOf(make({ stage: 'examination', in_feed: false }), today)).toBeNull()
  })
  it('puts withdrawn examinations last', () => {
    const groups = groupByTab(
      [
        make({ code: 'W', stage: 'examination', status_text: '예비심사청구철회' }),
        make({ code: 'X', stage: 'examination' }),
      ],
      today,
    )
    expect(groups.examination.map((i) => i.code)).toEqual(['X', 'W'])
  })
})

describe('schedule', () => {
  it('builds steps and their state', () => {
    const steps = scheduleOf(
      make({ subscription_start: '2026-11-06', subscription_end: '2026-11-09', listing_on: '2026-11-18' }),
    )
    expect(steps.map((s) => s.kind)).toEqual(['subscription', 'listing'])
    expect(steps.map((s) => stepState(s, '2026-11-09'))).toEqual(['active', 'upcoming'])
  })
})

describe('todayKst', () => {
  it('uses Korea time', () => {
    expect(todayKst(new Date('2026-11-09T15:30:00Z'))).toBe('2026-11-10')
  })
})
