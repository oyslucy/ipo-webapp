import { describe, expect, it } from 'vitest'
import type { Ipo } from './ipo'
import { sortIpos } from './sort'

const ipo = (code: string, patch: Partial<Ipo>): Ipo =>
  ({ code, institution_ratio: null, competition_ratio: null, fixed_price: null, hope_price_high: null, offering_amount: null, ...patch }) as Ipo

const list = [
  ipo('A', { competition_ratio: 19.27, institution_ratio: 152.36, fixed_price: 16400 }),
  ipo('B', { competition_ratio: null, hope_price_high: 30000 }),
  ipo('C', { competition_ratio: 1219.37, institution_ratio: 840.86, fixed_price: 26500 }),
]
const codes = (ipos: Ipo[]) => ipos.map((i) => i.code)

describe('sortIpos', () => {
  it('keeps schedule order by default', () => {
    expect(codes(sortIpos(list, 'schedule'))).toEqual(['A', 'B', 'C'])
  })
  it('sorts by ratio with missing values last in both directions', () => {
    expect(codes(sortIpos(list, 'ratio_desc'))).toEqual(['C', 'A', 'B'])
    expect(codes(sortIpos(list, 'ratio_asc'))).toEqual(['A', 'C', 'B'])
  })
  it('sorts by institution ratio', () => {
    expect(codes(sortIpos(list, 'institution_desc'))).toEqual(['C', 'A', 'B'])
    expect(codes(sortIpos(list, 'institution_asc'))).toEqual(['A', 'C', 'B'])
  })
  it('falls back to the hoped-for price when no fixed price', () => {
    expect(codes(sortIpos(list, 'price_desc'))).toEqual(['B', 'C', 'A'])
  })
  it('sorts by open return against the offer price', () => {
    const perf = (open: number) => ({ open, high: null, close: null, latest_close: null, latest_on: '2026-11-12' })
    const listed = [
      ipo('X', { fixed_price: 10000, performance: perf(12000) }),
      ipo('Y', { fixed_price: 10000, performance: null }),
      ipo('Z', { fixed_price: 5000, performance: perf(10000) }),
    ]
    expect(codes(sortIpos(listed, 'open_return_desc'))).toEqual(['Z', 'X', 'Y'])
  })
  it('does not mutate the input', () => {
    sortIpos(list, 'ratio_desc')
    expect(codes(list)).toEqual(['A', 'B', 'C'])
  })
})
