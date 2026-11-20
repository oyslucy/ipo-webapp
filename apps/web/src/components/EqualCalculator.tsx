import { useState, type ReactNode } from 'react'
import { formatExpectedShares } from '../domain/broker'
import { DEFAULT_MARGIN_RATIO, estimateEqual, offerPrice, type EqualEstimate } from '../domain/calculator'
import { formatWon } from '../domain/format'
import type { Ipo } from '../domain/ipo'
import { toneOf } from '../domain/performance'
import { NumberInput } from './NumberInput'
import { TONE_TEXT } from './toneStyle'

const MAX_ACCOUNTS = 20

function formatMoney(value: number | null): string {
  return value === null ? '-' : formatWon(Math.round(value))
}

function formatProfit(value: number | null): string {
  if (value === null) return '-'
  const rounded = Math.round(value)
  return `${rounded > 0 ? '+' : ''}${formatWon(rounded)}`
}

/** Remount with key={ipo.code} so the inputs reset for each IPO. */
export function EqualCalculator({ ipo }: { ipo: Ipo }) {
  const offer = offerPrice(ipo)
  const [accounts, setAccounts] = useState(1)
  const [sellPrice, setSellPrice] = useState<number | null>(ipo.performance?.open ?? null)
  if (offer === null) return null

  const marginRatio = ipo.margin_ratio ?? DEFAULT_MARGIN_RATIO
  const input = { price: offer.price, marginRatio, accounts, sellPrice }
  const notes = [
    `${offer.estimated ? '희망가 상단' : '공모가'} ${formatWon(offer.price)}`,
    ipo.margin_ratio === null ? `증거금률 ${DEFAULT_MARGIN_RATIO}% 가정` : `증거금률 ${marginRatio}%`,
  ]

  return (
    <section className="mt-7">
      <h3 className="font-semibold">균등 배정 계산기</h3>
      <p className="mt-1 text-xs text-gray-400">{notes.join(' · ')}</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Field label="계좌 수">
          <NumberInput
            label="계좌 수"
            value={accounts}
            suffix="개"
            onChange={(value) => setAccounts(Math.min(MAX_ACCOUNTS, Math.max(1, Math.floor(value ?? 1))))}
          />
        </Field>
        <Field label="예상 매도가">
          <NumberInput label="예상 매도가" placeholder="예: 20,000" value={sellPrice} suffix="원" onChange={setSellPrice} />
        </Field>
      </div>
      <div className="mt-3 space-y-2">
        {ipo.brokers.map((broker) => (
          <EstimateCard key={broker.name} name={broker.name} estimate={estimateEqual(broker, input)} />
        ))}
      </div>
      <p className="mt-2 text-xs leading-relaxed text-gray-400">
        최소 수량만 청약했다고 보고, 균등 물량을 현재 청약 건수로 나눈 기대값입니다(계좌당 최소 청약 수량까지). 1주 미만이면 추첨이라 못 받을 수도 있고, 마감 전에는 청약 건수가 늘어 줄어듭니다.
      </p>
    </section>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-xs text-gray-500">{label}</p>
      {children}
    </div>
  )
}

function EstimateCard({ name, estimate }: { name: string; estimate: EqualEstimate }) {
  const rows: [string, string, string?][] = [
    ['최소 증거금', formatMoney(estimate.deposit)],
    ['예상 균등 배정', formatExpectedShares(estimate.shares)],
    ['배정 금액', formatMoney(estimate.amount)],
    ['예상 손익', formatProfit(estimate.profit), TONE_TEXT[toneOf(estimate.profit)]],
  ]
  return (
    <article className="rounded-2xl bg-gray-50 p-4">
      <h4 className="text-sm font-semibold">{name}</h4>
      <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        {rows.map(([label, value, tone]) => (
          <div key={label} className="min-w-0">
            <dt className="text-xs text-gray-500">{label}</dt>
            <dd className={`mt-0.5 font-medium tabular-nums ${tone ?? ''}`}>{value}</dd>
          </div>
        ))}
      </dl>
    </article>
  )
}
