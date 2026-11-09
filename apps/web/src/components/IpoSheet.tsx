import type { ReactNode } from 'react'
import {
  formatAmount,
  formatAmountRange,
  formatDate,
  formatEok,
  formatManShares,
  formatMarket,
  formatPercent,
  formatPriceBand,
  formatRange,
  formatRatio,
  formatShareRange,
  formatWon,
} from '../domain/format'
import type { Broker, Company, Financial, Ipo, IpoDocument } from '../domain/ipo'
import { scheduleOf, stepState, type StepState } from '../domain/schedule'
import { expectedEqualShares, formatExpectedShares } from '../domain/broker'
import { BottomSheet } from './BottomSheet'

interface Props {
  ipo: Ipo | null
  today: string
  onClose: () => void
}

export function IpoSheet({ ipo, today, onClose }: Props) {
  return (
    <BottomSheet open={ipo !== null} label={ipo?.name ?? ''} onClose={onClose}>
      {ipo && <SheetBody ipo={ipo} today={today} />}
    </BottomSheet>
  )
}

function SheetBody({ ipo, today }: { ipo: Ipo; today: string }) {
  return (
    <>
      <header>
        <p className="text-xs text-gray-400">
          {[formatMarket(ipo.market), ipo.status_text].filter(Boolean).join(' · ')}
        </p>
        <h2 className="mt-1 text-xl font-bold">{ipo.name}</h2>
        {ipo.industry && <p className="mt-0.5 text-sm text-gray-500">{ipo.industry}</p>}
      </header>

      <RatioTiles ipo={ipo} />
      <OfferingInfo ipo={ipo} />
      {ipo.brokers.length > 0 && <Brokers brokers={ipo.brokers} />}
      <Schedule ipo={ipo} today={today} />
      {ipo.company && <CompanyInfo company={ipo.company} />}
      {ipo.financials.length > 0 && <Financials rows={ipo.financials} />}
      <Links documents={ipo.documents} code={ipo.code} />
    </>
  )
}

function Section({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className="mt-7">
      <div className="flex items-baseline justify-between">
        <h3 className="font-semibold">{title}</h3>
        {note && <span className="text-xs text-gray-400">{note}</span>}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  )
}

/** Before the final figure is published, the lead broker's running tally is the best signal. */
function subscriptionRatio(ipo: Ipo): { value: number | null; note: string | null } {
  if (ipo.competition_ratio !== null) return { value: ipo.competition_ratio, note: null }
  const lead = ipo.brokers.find((broker) => broker.total_ratio !== null)
  if (!lead) return { value: null, note: null }
  const at = lead.updated_at ? ` · ${formatDateTime(lead.updated_at)}` : ''
  return { value: lead.total_ratio, note: `${lead.name} 집계${at}` }
}

function RatioTiles({ ipo }: { ipo: Ipo }) {
  const subscription = subscriptionRatio(ipo)
  return (
    <div className="mt-5 grid grid-cols-2 gap-2">
      <div className="rounded-2xl bg-brand-600 p-4 text-white">
        <p className="text-xs text-brand-100">기관 경쟁률</p>
        <p className="mt-1 text-lg font-bold tabular-nums">{formatRatio(ipo.institution_ratio)}</p>
      </div>
      <div className="rounded-2xl bg-brand-50 p-4">
        <p className="text-xs text-brand-700">청약 경쟁률</p>
        <p className="mt-1 text-lg font-bold text-brand-700 tabular-nums">
          {formatRatio(subscription.value)}
        </p>
        {subscription.note && <p className="mt-0.5 text-xs text-brand-700/70">{subscription.note}</p>}
      </div>
    </div>
  )
}

function FactGrid({ facts }: { facts: [string, string][] }) {
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-2xl bg-gray-50 p-4 text-sm">
      {facts.map(([label, value]) => (
        <div key={label} className="min-w-0">
          <dt className="text-xs text-gray-500">{label}</dt>
          <dd className="mt-0.5 font-medium break-keep tabular-nums">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

function OfferingInfo({ ipo }: { ipo: Ipo }) {
  const amount =
    ipo.offering_amount !== null
      ? formatAmount(ipo.offering_amount)
      : formatAmountRange(ipo.offering_amount_low, ipo.offering_amount_high)
  return (
    <Section title="공모 정보">
      <FactGrid
        facts={[
          ['종목코드', ipo.code],
          ['시장구분', formatMarket(ipo.market)],
          ['공모금액', amount],
          ['공모주식수', ipo.offered_shares === null ? '-' : `${formatManShares(ipo.offered_shares)}주`],
          ['희망공모가', formatPriceBand(ipo.hope_price_low, ipo.hope_price_high)],
          ['확정공모가', formatWon(ipo.fixed_price)],
          ['일반청약주식수', formatShareRange(ipo.general_shares_min, ipo.general_shares_max)],
          ['청약 증거금률', formatPercent(ipo.margin_ratio)],
        ]}
      />
    </Section>
  )
}

function Brokers({ brokers }: { brokers: Broker[] }) {
  const updated = brokers.find((b) => b.updated_at)?.updated_at
  return (
    <Section title="청약 증권사" note={updated ? `${formatDateTime(updated)} 기준` : undefined}>
      <div className="space-y-2">
        {brokers.map((broker) => (
          <article key={broker.name} className="rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold">{broker.name}</h4>
              {broker.role && (
                <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">{broker.role}</span>
              )}
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              {(
                [
                  ['통합 경쟁률', formatRatio(broker.total_ratio)],
                  ['비례 경쟁률', formatRatio(broker.proportional_ratio)],
                  ['배정 물량', shares(broker.allocated_shares)],
                  ['최소 청약', shares(broker.min_shares)],
                  ['균등 배정', shares(broker.equal_shares)],
                  ['비례 배정', shares(broker.proportional_shares)],
                  ['청약 건수', broker.applications === null ? '-' : `${broker.applications.toLocaleString('ko-KR')}건`],
                  ['균등 예상', formatExpectedShares(expectedEqualShares(broker))],
                ] as const
              ).map(([label, value]) => (
                <div key={label} className="min-w-0">
                  <dt className="text-xs text-gray-500">{label}</dt>
                  <dd className="mt-0.5 font-medium tabular-nums">{value}</dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>
    </Section>
  )
}

function shares(value: number | null): string {
  return value === null ? '-' : `${value.toLocaleString('ko-KR')}주`
}

function formatDateTime(iso: string): string {
  const [date = '', time = ''] = iso.split('T')
  return `${formatDate(date)} ${time.slice(0, 5)}`
}

const DOT: Record<StepState, string> = {
  done: 'bg-gray-300',
  active: 'bg-brand-600 ring-4 ring-brand-100',
  upcoming: 'bg-white border-2 border-gray-300',
}

function Schedule({ ipo, today }: { ipo: Ipo; today: string }) {
  const steps = scheduleOf(ipo)
  if (steps.length === 0) return null
  return (
    <Section title="일정">
      <ol>
        {steps.map((step, index) => {
          const state = stepState(step, today)
          return (
            <li key={step.kind} className="relative flex gap-3 pb-4 last:pb-0">
              {index < steps.length - 1 && <span className="absolute top-3 left-[5px] h-full w-px bg-gray-200" />}
              <span className={`relative mt-1.5 size-3 shrink-0 rounded-full ${DOT[state]}`} />
              <div className="flex flex-1 justify-between gap-3 text-sm">
                <span className={state === 'done' ? 'text-gray-400' : 'font-medium'}>{step.label}</span>
                <span className={`tabular-nums ${state === 'done' ? 'text-gray-400' : 'text-gray-700'}`}>
                  {formatRange(step.start, step.end)}
                </span>
              </div>
            </li>
          )
        })}
      </ol>
    </Section>
  )
}

function CompanyInfo({ company }: { company: Company }) {
  const shareholder =
    company.largest_shareholder === null
      ? '-'
      : `${company.largest_shareholder}${company.largest_share_ratio === null ? '' : ` (${formatPercent(company.largest_share_ratio)})`}`
  const rows: [string, ReactNode][] = [
    ['주요 제품', company.products ?? '-'],
    ['대표자', company.ceo ?? '-'],
    ['설립일', company.founded_on?.replaceAll('-', '.') ?? '-'],
    ['직원 수', company.employees === null ? '-' : `${company.employees.toLocaleString('ko-KR')}명`],
    ['기업 구분', company.company_class ?? '-'],
    ['최대주주', shareholder],
    [
      '홈페이지',
      company.homepage ? (
        <a
          key="homepage"
          href={company.homepage.startsWith('http') ? company.homepage : `https://${company.homepage}`}
          target="_blank"
          rel="noreferrer"
          className="text-brand-600 underline-offset-2 active:underline"
        >
          {company.homepage}
        </a>
      ) : (
        '-'
      ),
    ],
    ['주소', company.address ?? '-'],
  ]
  return (
    <Section title="기업 정보">
      <dl className="divide-y divide-gray-100 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex gap-4 py-2.5">
            <dt className="w-20 shrink-0 text-gray-500">{label}</dt>
            <dd className="min-w-0 flex-1 break-keep">{value}</dd>
          </div>
        ))}
      </dl>
    </Section>
  )
}

function Financials({ rows }: { rows: Financial[] }) {
  const metrics: [string, (row: Financial) => number | null][] = [
    ['매출액', (row) => row.sales],
    ['영업이익', (row) => row.operating_profit],
    ['순이익', (row) => row.net_profit],
  ]
  return (
    <Section title="재무 정보" note="단위: 억원">
      <div className="overflow-x-auto rounded-2xl bg-gray-50 p-3">
        <table className="w-full text-right text-sm tabular-nums">
          <thead>
            <tr className="text-xs text-gray-500">
              <th className="pb-2 text-left font-normal" />
              {rows.map((row) => (
                <th key={row.period} className="pb-2 pl-2 font-normal break-keep">
                  {row.period}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metrics.map(([label, pick]) => (
              <tr key={label}>
                <th className="py-1.5 pr-2 text-left font-normal whitespace-nowrap text-gray-500">{label}</th>
                {rows.map((row) => {
                  const value = pick(row)
                  return (
                    <td key={row.period} className={`py-1.5 pl-2 font-medium ${value !== null && value < 0 ? 'text-red-500' : ''}`}>
                      {formatEok(value)}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  )
}

function Links({ documents, code }: { documents: IpoDocument[]; code: string }) {
  const links = [
    ...documents.map((doc) => ({ title: doc.title, url: doc.url })),
    { title: '네이버 증권에서 보기', url: `https://stock.naver.com/ipo/${code}` },
  ]
  return (
    <Section title="공시 · 링크">
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.url}>
            <a
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-2xl border border-gray-100 px-4 py-3 text-sm font-medium active:bg-gray-50"
            >
              {link.title}
              <svg viewBox="0 0 24 24" className="size-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M7 17L17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </li>
        ))}
      </ul>
    </Section>
  )
}
