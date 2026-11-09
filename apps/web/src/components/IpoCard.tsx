import type { Ipo } from '../domain/ipo'
import {
  formatDate,
  formatPriceBand,
  formatRange,
  formatRatio,
  formatWon,
} from '../domain/format'
import { isWithdrawn, type TabId } from '../domain/tabs'

interface Props {
  ipo: Ipo
  tab: TabId
  onSelect: (ipo: Ipo) => void
}

interface Fact {
  label: string
  value: string
}

function factsFor(ipo: Ipo, tab: TabId): Fact[] {
  const underwriter = { label: '주관사', value: ipo.underwriters.join(', ') || '-' }
  const price =
    ipo.fixed_price !== null
      ? { label: '공모가', value: formatWon(ipo.fixed_price) }
      : { label: '희망가', value: formatPriceBand(ipo.hope_price_low, ipo.hope_price_high) }
  switch (tab) {
    case 'subscription':
      return [
        { label: '청약', value: formatRange(ipo.subscription_start, ipo.subscription_end) },
        price,
        underwriter,
      ]
    case 'forecast':
      return [
        { label: '수요예측', value: formatRange(ipo.forecast_start, ipo.forecast_end) },
        price,
        underwriter,
      ]
    case 'listing':
    case 'listed':
      return [
        { label: '상장일', value: formatDate(ipo.listing_on) },
        price,
        { label: '경쟁률', value: formatRatio(ipo.competition_ratio) },
        underwriter,
      ]
    case 'examination':
      return [
        { label: '청구일', value: formatDate(ipo.review_requested_on) },
        underwriter,
      ]
  }
}

export function IpoCard({ ipo, tab, onSelect }: Props) {
  const withdrawn = isWithdrawn(ipo)
  return (
    <button
      onClick={() => onSelect(ipo)}
      className={`w-full rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-sm transition active:scale-[0.99] active:bg-gray-50 ${
        withdrawn ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-center gap-2">
        <h3 className="truncate text-base font-semibold">{ipo.name}</h3>
        {ipo.market && (
          <span className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">
            {ipo.market}
          </span>
        )}
        {withdrawn && (
          <span className="shrink-0 rounded bg-red-50 px-1.5 py-0.5 text-xs text-red-500">
            철회
          </span>
        )}
      </div>
      {ipo.industry && <p className="mt-0.5 truncate text-xs text-gray-400">{ipo.industry}</p>}
      <dl className="mt-3 space-y-1 text-sm">
        {factsFor(ipo, tab).map((fact) => (
          <div key={fact.label} className="flex justify-between gap-4">
            <dt className="shrink-0 text-gray-500">{fact.label}</dt>
            <dd className="truncate font-medium tabular-nums">{fact.value}</dd>
          </div>
        ))}
      </dl>
    </button>
  )
}
