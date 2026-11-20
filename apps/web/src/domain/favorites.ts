/** Favorites are stored as a JSON array of IPO codes; anything else is treated as empty. */
export function parseFavorites(raw: string | null): ReadonlySet<string> {
  if (raw === null) return new Set()
  try {
    const value: unknown = JSON.parse(raw)
    if (!Array.isArray(value)) return new Set()
    return new Set(value.filter((code): code is string => typeof code === 'string'))
  } catch {
    return new Set()
  }
}

export function serializeFavorites(codes: ReadonlySet<string>): string {
  return JSON.stringify([...codes].sort())
}

export function toggleFavorite(codes: ReadonlySet<string>, code: string): ReadonlySet<string> {
  const next = new Set(codes)
  if (!next.delete(code)) next.add(code)
  return next
}
