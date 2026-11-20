import { describe, expect, it } from 'vitest'
import { parseFavorites, serializeFavorites, toggleFavorite } from './favorites'

describe('favorites', () => {
  it('parses a stored code list', () => {
    expect([...parseFavorites('["A1","A2"]')]).toEqual(['A1', 'A2'])
  })
  it('treats missing or corrupt storage as empty', () => {
    expect(parseFavorites(null).size).toBe(0)
    expect(parseFavorites('{oops').size).toBe(0)
    expect(parseFavorites('{"a":1}').size).toBe(0)
    expect([...parseFavorites('["A1",3,null]')]).toEqual(['A1'])
  })
  it('toggles without mutating the input', () => {
    const start = parseFavorites('["A1"]')
    const added = toggleFavorite(start, 'A2')
    expect([...added].sort()).toEqual(['A1', 'A2'])
    expect([...toggleFavorite(added, 'A1')]).toEqual(['A2'])
    expect([...start]).toEqual(['A1'])
  })
  it('round-trips through serialization', () => {
    const codes = new Set(['B', 'A'])
    expect(serializeFavorites(codes)).toBe('["A","B"]')
    expect(parseFavorites(serializeFavorites(codes))).toEqual(codes)
  })
})
