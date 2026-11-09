import { describe, expect, it } from 'vitest'
import { expectedEqualShares, formatExpectedShares } from './broker'
import type { Broker } from './ipo'

const broker = (patch: Partial<Broker>): Broker => ({
  name: '대신증권',
  role: '대표',
  allocated_shares: 2_400_000,
  min_shares: 10,
  equal_shares: 300_000,
  proportional_shares: 300_000,
  total_ratio: 395.5,
  proportional_ratio: 791,
  applications: 117_367,
  updated_at: null,
  ...patch,
})

describe('expectedEqualShares', () => {
  it('divides the equal pool by applicants', () => {
    expect(expectedEqualShares(broker({}))).toBeCloseTo(2.556, 3)
  })
  it('is unknown before anyone applies', () => {
    expect(expectedEqualShares(broker({ applications: 0 }))).toBeNull()
    expect(expectedEqualShares(broker({ applications: null }))).toBeNull()
    expect(expectedEqualShares(broker({ equal_shares: null }))).toBeNull()
  })
  it('marks fractional results as a lottery', () => {
    expect(formatExpectedShares(2.556)).toBe('약 2.56주')
    expect(formatExpectedShares(0.45)).toBe('약 0.45주 (추첨)')
  })
})
