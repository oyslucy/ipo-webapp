import { describe, expect, it } from 'vitest'
import { formatAge, freshnessOf } from './freshness'

describe('formatAge', () => {
  it.each([
    [0, '방금'],
    [42, '42분 전'],
    [60, '1시간 전'],
    [23 * 60 + 59, '23시간 전'],
    [3 * 24 * 60, '3일 전'],
  ])('%i minutes reads %s', (minutes, label) => {
    expect(formatAge(minutes)).toBe(label)
  })
})

describe('freshnessOf', () => {
  const fetchedAt = '2026-11-10T08:44:49+09:00'

  it('stamps in Korea time regardless of the offset given', () => {
    expect(freshnessOf('2026-11-09T23:44:49Z', new Date('2026-11-10T00:00:00Z')).stamp).toBe('11.10 08:44')
  })

  it('reports age and stays fresh within a day', () => {
    const result = freshnessOf(fetchedAt, new Date('2026-11-10T12:50:00+09:00'))
    expect(result).toEqual({ stamp: '11.10 08:44', age: '4시간 전', stale: false })
  })

  it('flags data that missed the daily collect', () => {
    expect(freshnessOf(fetchedAt, new Date('2026-11-11T12:00:00+09:00')).stale).toBe(true)
  })

  it('treats clock skew as just updated', () => {
    expect(freshnessOf(fetchedAt, new Date('2026-11-10T08:00:00+09:00')).age).toBe('방금')
  })
})
