import { describe, expect, it } from 'vitest'
import { estimateEqual, offerPrice } from './calculator'
import type { Broker, Ipo } from './ipo'

const broker = (patch: Partial<Broker> = {}): Broker => ({
  name: '대신증권',
  role: '대표',
  allocated_shares: 2_400_000,
  min_shares: 10,
  equal_shares: 300_000,
  proportional_shares: 300_000,
  total_ratio: 395.5,
  proportional_ratio: 791,
  applications: 150_000,
  updated_at: null,
  ...patch,
})

describe('offerPrice', () => {
  it('prefers the fixed price', () => {
    expect(offerPrice({ fixed_price: 16400, hope_price_high: 20200 } as Ipo)).toEqual({
      price: 16400,
      estimated: false,
    })
  })
  it('falls back to the top of the band', () => {
    expect(offerPrice({ fixed_price: null, hope_price_high: 20200 } as Ipo)).toEqual({
      price: 20200,
      estimated: true,
    })
    expect(offerPrice({ fixed_price: null, hope_price_high: null } as Ipo)).toBeNull()
  })
})

describe('estimateEqual', () => {
  const input = { price: 10000, marginRatio: 50, accounts: 1, sellPrice: 15000 }

  it('computes deposit, shares, amount and profit', () => {
    expect(estimateEqual(broker(), input)).toEqual({
      deposit: 50_000,
      shares: 2,
      amount: 20_000,
      profit: 10_000,
    })
  })
  it('scales with the number of accounts', () => {
    const result = estimateEqual(broker(), { ...input, accounts: 3 })
    expect(result.deposit).toBe(150_000)
    expect(result.shares).toBe(6)
    expect(result.profit).toBe(30_000)
  })
  it('caps the equal allotment at the minimum order per account', () => {
    // 80,000 shares over 2,500 applicants is 32 each, but a 10-share order gets at most 10.
    const result = estimateEqual(broker({ equal_shares: 80_000, applications: 2_500 }), { ...input, accounts: 3 })
    expect(result.shares).toBe(30)
    expect(result.amount).toBe(300_000)
  })
  it('reports losses as negative profit', () => {
    expect(estimateEqual(broker(), { ...input, sellPrice: 8000 }).profit).toBe(-4_000)
  })
  it('leaves unknowns empty before subscription data exists', () => {
    expect(estimateEqual(broker({ applications: null, min_shares: null }), input)).toEqual({
      deposit: null,
      shares: null,
      amount: null,
      profit: null,
    })
    expect(estimateEqual(broker(), { ...input, sellPrice: null }).profit).toBeNull()
  })
})
