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

/** Korean share counts the way brokers write them: 2,400,000 -> 240만. */
export function formatManShares(value: number | null): string {
  if (value === null) return '-'
  if (value < 10_000) return `${value.toLocaleString('ko-KR')}`
  return `${(value / 10_000).toLocaleString('ko-KR', { maximumFractionDigits: 2 })}만`
}

export function formatShareRange(min: number | null, max: number | null): string {
  if (min === null && max === null) return '-'
  if (min === null || max === null || min === max) return `${formatManShares(min ?? max)}주`
  return `${formatManShares(min)} ~ ${formatManShares(max)}주`
}

export function formatAmountRange(low: number | null, high: number | null): string {
  if (low === null && high === null) return '-'
  if (low === null || high === null || low === high) return formatAmount(low ?? high)
  return `${formatAmount(low).replace('원', '')} ~ ${formatAmount(high)}`
}

/** Financial statement figures in 억원, one decimal for small companies. */
export function formatEok(value: number | null): string {
  if (value === null) return '-'
  return (value / 100_000_000).toLocaleString('ko-KR', { maximumFractionDigits: 1 })
}

export function formatPercent(value: number | null): string {
  return value === null ? '-' : `${value.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}%`
}

const MARKET_NAMES: Record<string, string> = { KOSPI: '코스피', KOSDAQ: '코스닥', KONEX: '코넥스' }

export function formatMarket(market: string | null): string {
  if (market === null) return '-'
  return MARKET_NAMES[market] ?? market
}
