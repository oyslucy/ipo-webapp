import { describe, expect, it } from 'vitest'
import type { Ipo } from './ipo'
import { sortIpos } from './sort'

const ipo = (code: string, patch: Partial<Ipo>): Ipo =>
  ({ code, competition_ratio: null, fixed_price: null, hope_price_high: null, offering_amount: null, ...patch }) as Ipo

const list = [
  ipo('A', { competition_ratio: 19.27, fixed_price: 16400 }),
  ipo('B', { competition_ratio: null, hope_price_high: 30000 }),
  ipo('C', { competition_ratio: 1219.37, fixed_price: 26500 }),
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
  it('falls back to the hoped-for price when no fixed price', () => {
    expect(codes(sortIpos(list, 'price_desc'))).toEqual(['B', 'C', 'A'])
  })
  it('does not mutate the input', () => {
    sortIpos(list, 'ratio_desc')
    expect(codes(list)).toEqual(['A', 'B', 'C'])
  })
})
