import { formatDate } from '../domain/format'
import type { WeekSummary as Summary } from '../domain/summary'
import { KIND_ORDER, KIND_STYLE } from './kindStyle'

export function WeekSummary({ summary }: { summary: Summary }) {
  return (
    <section className="rounded-3xl bg-brand-600 p-4 text-white shadow-lg shadow-brand-600/20">
      <div className="flex items-baseline justify-between">
        <h2 className="font-semibold">이번 주</h2>
        <span className="text-xs text-brand-100">
          {formatDate(summary.start)} ~ {formatDate(summary.end)}
        </span>
      </div>
      <dl className="mt-3 grid grid-cols-3 gap-2">
        {KIND_ORDER.map((kind) => (
          <div key={kind} className="rounded-2xl bg-white/10 px-3 py-2.5">
            <dt className="text-xs text-brand-100">{KIND_STYLE[kind].label}</dt>
            <dd className="mt-0.5 text-xl font-bold tabular-nums">
              {summary.counts[kind]}
              <span className="ml-0.5 text-sm font-medium">건</span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
