import { AnimatePresence, motion } from 'motion/react'
import { useEffect } from 'react'
import type { Ipo } from '../domain/ipo'
import {
  formatAmount,
  formatPriceBand,
  formatRange,
  formatRatio,
  formatShares,
  formatWon,
} from '../domain/format'
import { scheduleOf, stepState, type StepState } from '../domain/schedule'

interface Props {
  ipo: Ipo | null
  today: string
  onClose: () => void
}

const DOT: Record<StepState, string> = {
  done: 'bg-gray-300',
  active: 'bg-blue-500 ring-4 ring-blue-100',
  upcoming: 'bg-white border-2 border-gray-300',
}

export function IpoSheet({ ipo, today, onClose }: Props) {
  useEffect(() => {
    if (ipo === null) return
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [ipo, onClose])

  return (
    <AnimatePresence>
      {ipo && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-label={ipo.name}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[85dvh] max-w-md overflow-y-auto rounded-t-3xl bg-white px-5 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 600) onClose()
            }}
          >
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-gray-200" />
            <SheetBody ipo={ipo} today={today} />
          </motion.section>
        </>
      )}
    </AnimatePresence>
  )
}

function SheetBody({ ipo, today }: { ipo: Ipo; today: string }) {
  const facts: [string, string][] = [
    ['희망 공모가', formatPriceBand(ipo.hope_price_low, ipo.hope_price_high)],
    ['확정 공모가', formatWon(ipo.fixed_price)],
    ['청약 경쟁률', formatRatio(ipo.competition_ratio)],
    ['공모 주식수', formatShares(ipo.offered_shares)],
    ['공모 금액', formatAmount(ipo.offering_amount)],
    ['주관사', ipo.underwriters.join(', ') || '-'],
  ]
  const steps = scheduleOf(ipo)

  return (
    <>
      <header>
        <p className="text-xs text-gray-400">
          {[ipo.market, ipo.status_text].filter(Boolean).join(' · ')}
        </p>
        <h2 className="mt-1 text-xl font-bold">{ipo.name}</h2>
        {ipo.industry && <p className="mt-0.5 text-sm text-gray-500">{ipo.industry}</p>}
      </header>

      <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 rounded-2xl bg-gray-50 p-4 text-sm">
        {facts.map(([label, value]) => (
          <div key={label} className="min-w-0">
            <dt className="text-xs text-gray-500">{label}</dt>
            <dd className="mt-0.5 font-medium break-keep tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      {steps.length > 0 && (
        <section className="mt-6">
          <h3 className="text-sm font-semibold">일정</h3>
          <ol className="mt-3">
            {steps.map((step, index) => {
              const state = stepState(step, today)
              return (
                <li key={step.kind} className="relative flex gap-3 pb-4 last:pb-0">
                  {index < steps.length - 1 && (
                    <span className="absolute top-3 left-[5px] h-full w-px bg-gray-200" />
                  )}
                  <span className={`relative mt-1.5 size-3 shrink-0 rounded-full ${DOT[state]}`} />
                  <div className="flex flex-1 justify-between gap-3 text-sm">
                    <span className={state === 'done' ? 'text-gray-400' : 'font-medium'}>
                      {step.label}
                    </span>
                    <span
                      className={`tabular-nums ${state === 'done' ? 'text-gray-400' : 'text-gray-700'}`}
                    >
                      {formatRange(step.start, step.end)}
                    </span>
                  </div>
                </li>
              )
            })}
          </ol>
        </section>
      )}
    </>
  )
}
