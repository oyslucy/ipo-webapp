import type { Ipo } from './ipo'

export type SortKey =
  | 'schedule'
  | 'ratio_desc'
  | 'ratio_asc'
  | 'price_desc'
  | 'price_asc'
  | 'amount_desc'

export const SORT_OPTIONS: readonly { key: SortKey; label: string }[] = [
  { key: 'schedule', label: '일정순' },
  { key: 'ratio_desc', label: '경쟁률 높은순' },
  { key: 'ratio_asc', label: '경쟁률 낮은순' },
  { key: 'price_desc', label: '공모가 높은순' },
  { key: 'price_asc', label: '공모가 낮은순' },
  { key: 'amount_desc', label: '공모금액 큰순' },
]

export function sortLabel(key: SortKey): string {
  return SORT_OPTIONS.find((option) => option.key === key)?.label ?? ''
}

/** Fixed price when set, otherwise the top of the hoped-for band. */
function priceOf(ipo: Ipo): number | null {
  return ipo.fixed_price ?? ipo.hope_price_high
}

const METRIC: Record<Exclude<SortKey, 'schedule'>, [(ipo: Ipo) => number | null, 1 | -1]> = {
  ratio_desc: [(ipo) => ipo.competition_ratio, -1],
  ratio_asc: [(ipo) => ipo.competition_ratio, 1],
  price_desc: [priceOf, -1],
  price_asc: [priceOf, 1],
  amount_desc: [(ipo) => ipo.offering_amount, -1],
}

/** Stable sort; records without the value always go last whichever direction. */
export function sortIpos(ipos: readonly Ipo[], key: SortKey): Ipo[] {
  if (key === 'schedule') return [...ipos]
  const [value, direction] = METRIC[key]
  return [...ipos].sort((a, b) => {
    const va = value(a)
    const vb = value(b)
    if (va === null || vb === null) return Number(va === null) - Number(vb === null)
    return (va - vb) * direction
  })
}
