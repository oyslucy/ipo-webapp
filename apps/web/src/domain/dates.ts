/** Pure helpers over ISO dates (YYYY-MM-DD). UTC math avoids DST and local-zone drift. */

function toUtc(iso: string): Date {
  const [y = 0, m = 1, d = 1] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

function fromUtc(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function addDays(iso: string, days: number): string {
  const date = toUtc(iso)
  date.setUTCDate(date.getUTCDate() + days)
  return fromUtc(date)
}

export function weekday(iso: string): number {
  return toUtc(iso).getUTCDay()
}

export function isWeekend(iso: string): boolean {
  const day = weekday(iso)
  return day === 0 || day === 6
}

export function monthKey(iso: string): string {
  return iso.slice(0, 7)
}

export function addMonths(key: string, months: number): string {
  const [y = 0, m = 1] = key.split('-').map(Number)
  return fromUtc(new Date(Date.UTC(y, m - 1 + months, 1))).slice(0, 7)
}

/** 6 weeks x 7 days starting on Sunday, covering the given month (YYYY-MM). */
export function monthGrid(key: string): string[] {
  const first = `${key}-01`
  const start = addDays(first, -weekday(first))
  return Array.from({ length: 42 }, (_, i) => addDays(start, i))
}

/** Monday..Sunday week containing the date. */
export function weekOf(iso: string): { start: string; end: string } {
  const start = addDays(iso, -((weekday(iso) + 6) % 7))
  return { start, end: addDays(start, 6) }
}
