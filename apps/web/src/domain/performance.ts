import type { Ipo } from './ipo'

export type Tone = 'up' | 'down' | 'flat'

/** Percent change from the offer price, the return a subscriber actually got. */
export function returnRate(price: number | null, offer: number | null): number | null {
  if (price === null || offer === null || offer <= 0) return null
  return ((price - offer) / offer) * 100
}

export function openReturn(ipo: Ipo): number | null {
  return returnRate(ipo.performance?.open ?? null, ipo.fixed_price)
}

export function toneOf(rate: number | null): Tone {
  if (rate === null || Math.abs(rate) < 0.05) return 'flat'
  return rate > 0 ? 'up' : 'down'
}

export function formatReturn(rate: number | null): string {
  if (rate === null) return '-'
  const rounded = Math.round(rate * 10) / 10
  const sign = rounded > 0 ? '+' : ''
  return `${sign}${rounded.toLocaleString('ko-KR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`
}

/** "51,100원 (+92.8%)": price with its return against the offer price. */
export function formatPriceWithReturn(price: number | null, offer: number | null): string {
  if (price === null) return '-'
  const rate = returnRate(price, offer)
  const won = `${price.toLocaleString('ko-KR')}원`
  return rate === null ? won : `${won} (${formatReturn(rate)})`
}
