/** A full collect runs daily, so data older than a day plus slack means a missed run. */
export const STALE_AFTER_MINUTES = 26 * 60

export interface Freshness {
  /** e.g. "11.10 08:44" in Korea time */
  stamp: string
  /** e.g. "3시간 전" */
  age: string
  stale: boolean
}

export function freshnessOf(fetchedAt: string, now: Date = new Date()): Freshness {
  const fetched = new Date(fetchedAt)
  const minutes = Math.max(0, Math.floor((now.getTime() - fetched.getTime()) / 60_000))
  return { stamp: formatStamp(fetched), age: formatAge(minutes), stale: minutes > STALE_AFTER_MINUTES }
}

export function formatAge(minutes: number): string {
  if (minutes < 1) return '방금'
  if (minutes < 60) return `${minutes}분 전`
  if (minutes < 24 * 60) return `${Math.floor(minutes / 60)}시간 전`
  return `${Math.floor(minutes / (24 * 60))}일 전`
}

function formatStamp(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Seoul',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? ''
  return `${part('month')}.${part('day')} ${part('hour')}:${part('minute')}`
}
