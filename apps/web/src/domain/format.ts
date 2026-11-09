const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const

export function formatDate(iso: string | null): string {
  if (iso === null) return '-'
  const [y, m, d] = iso.split('-').map(Number)
  if (y === undefined || m === undefined || d === undefined) return iso
  const weekday = WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]
  return `${m}.${d}(${weekday})`
}

export function formatRange(start: string | null, end: string | null): string {
  if (start === null) return '-'
  if (end === null || end === start) return formatDate(start)
  return `${formatDate(start)} ~ ${formatDate(end)}`
}

export function formatWon(value: number | null): string {
  return value === null ? '-' : `${value.toLocaleString('ko-KR')}원`
}

export function formatPriceBand(low: number | null, high: number | null): string {
  if (low === null && high === null) return '-'
  if (low === null || high === null || low === high) return formatWon(low ?? high)
  return `${low.toLocaleString('ko-KR')} ~ ${formatWon(high)}`
}

export function formatAmount(value: number | null): string {
  if (value === null) return '-'
  const eok = value / 100_000_000
  return eok >= 1 ? `${Math.round(eok).toLocaleString('ko-KR')}억원` : formatWon(value)
}

export function formatShares(value: number | null): string {
  return value === null ? '-' : `${value.toLocaleString('ko-KR')}주`
}

export function formatRatio(value: number | null): string {
  if (value === null) return '-'
  return `${value.toLocaleString('ko-KR', { maximumFractionDigits: 2 })} : 1`
}
