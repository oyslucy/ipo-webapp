import { describe, expect, it } from 'vitest'
import type { Ipo } from './ipo'
import { formatPriceWithReturn, formatReturn, openReturn, returnRate, toneOf } from './performance'

describe('performance', () => {
  it('computes the return against the offer price', () => {
    expect(returnRate(51100, 26500)).toBeCloseTo(92.83, 2)
    expect(returnRate(4800, 8000)).toBe(-40)
    expect(returnRate(null, 8000)).toBeNull()
    expect(returnRate(4800, null)).toBeNull()
    expect(returnRate(4800, 0)).toBeNull()
  })
  it('formats with an explicit sign and one decimal', () => {
    expect(formatReturn(92.8302)).toBe('+92.8%')
    expect(formatReturn(-40)).toBe('-40.0%')
    expect(formatReturn(0.01)).toBe('0.0%')
    expect(formatReturn(null)).toBe('-')
  })
  it('classifies tone, treating tiny moves as flat', () => {
    expect(toneOf(3)).toBe('up')
    expect(toneOf(-3)).toBe('down')
    expect(toneOf(0.01)).toBe('flat')
    expect(toneOf(null)).toBe('flat')
  })
  it('formats price with its return', () => {
    expect(formatPriceWithReturn(51100, 26500)).toBe('51,100원 (+92.8%)')
    expect(formatPriceWithReturn(51100, null)).toBe('51,100원')
    expect(formatPriceWithReturn(null, 26500)).toBe('-')
  })
  it('reads the open return from an ipo', () => {
    const ipo = {
      fixed_price: 8000,
      performance: { open: 7620, high: null, close: null, latest_close: null, latest_on: '2026-11-12' },
    } as Ipo
    expect(openReturn(ipo)).toBeCloseTo(-4.75, 2)
    expect(openReturn({ ...ipo, performance: null })).toBeNull()
  })
})
