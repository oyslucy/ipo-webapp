import { AnimatePresence, motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { addMonths, monthGrid, monthKey } from '../domain/dates'
import { eventsOn, type EventKind, type IpoEvent } from '../domain/events'
import { formatDate } from '../domain/format'
import type { Ipo } from '../domain/ipo'
import { EventRow } from './EventRow'
import { KIND_ORDER, KIND_STYLE } from './kindStyle'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const

interface Props {
  events: readonly IpoEvent[]
  today: string
  onSelect: (ipo: Ipo) => void
}

export function MonthCalendar({ events, today, onSelect }: Props) {
  const [month, setMonth] = useState(() => monthKey(today))
  const [selected, setSelected] = useState(today)
  const [direction, setDirection] = useState(0)
  const grid = useMemo(() => monthGrid(month), [month])
  const selectedEvents = useMemo(
    () =>
      eventsOn(events, selected).sort(
        (a, b) => KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind),
      ),
    [events, selected],
  )

  const moveMonth = (delta: number) => {
    const next = addMonths(month, delta)
    setDirection(delta)
    setMonth(next)
    setSelected(monthKey(today) === next ? today : `${next}-01`)
  }
  const goToday = () => {
    setDirection(0)
    setMonth(monthKey(today))
    setSelected(today)
  }
  const [year, monthNumber] = month.split('-').map(Number)

  return (
    <section className="rounded-3xl bg-white p-4 shadow-sm">
      <header className="flex items-center gap-1">
        <h2 className="mr-auto text-lg font-bold tabular-nums">
          {year}년 {monthNumber}월
        </h2>
        <button onClick={goToday} className="rounded-full px-3 py-1.5 text-sm text-brand-600 active:bg-brand-50">
          오늘
        </button>
        <NavButton label="이전 달" onClick={() => moveMonth(-1)} path="M15 6l-6 6 6 6" />
        <NavButton label="다음 달" onClick={() => moveMonth(1)} path="M9 6l6 6-6 6" />
      </header>

      <div className="mt-3 grid grid-cols-7 text-center text-xs text-gray-400">
        {WEEKDAYS.map((day, i) => (
          <span key={day} className={i === 0 ? 'text-red-400' : i === 6 ? 'text-brand-500' : ''}>
            {day}
          </span>
        ))}
      </div>

      <div className="relative mt-1 overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <motion.div
            key={month}
            custom={direction}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-7"
          >
            {grid.map((date) => (
              <DayCell
                key={date}
                date={date}
                inMonth={monthKey(date) === month}
                isToday={date === today}
                isSelected={date === selected}
                kinds={kindsOn(events, date)}
                onClick={() => setSelected(date)}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-3 flex justify-center gap-4 text-xs text-gray-500">
        {KIND_ORDER.map((kind) => (
          <span key={kind} className="flex items-center gap-1.5">
            <span className={`size-2 rounded-full ${KIND_STYLE[kind].dot}`} />
            {KIND_STYLE[kind].label}
          </span>
        ))}
      </div>

      <div className="mt-4 border-t border-gray-100 pt-3">
        <p className="px-3 text-sm font-semibold">{formatDate(selected)}</p>
        {selectedEvents.length === 0 ? (
          <p className="px-3 py-3 text-sm text-gray-400">일정이 없어요</p>
        ) : (
          <div className="mt-1">
            {selectedEvents.map((event) => (
              <EventRow key={`${event.kind}-${event.ipo.code}`} event={event} date={selected} onSelect={onSelect} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function kindsOn(events: readonly IpoEvent[], date: string): EventKind[] {
  const present = new Set(eventsOn(events, date).map((event) => event.kind))
  return KIND_ORDER.filter((kind) => present.has(kind))
}

interface DayCellProps {
  date: string
  inMonth: boolean
  isToday: boolean
  isSelected: boolean
  kinds: EventKind[]
  onClick: () => void
}

function DayCell({ date, inMonth, isToday, isSelected, kinds, onClick }: DayCellProps) {
  const day = Number(date.slice(8))
  const circle = isSelected
    ? 'bg-brand-600 text-white font-semibold'
    : isToday
      ? 'text-brand-600 font-semibold ring-1 ring-brand-600'
      : ''
  return (
    <button
      onClick={onClick}
      aria-label={date}
      aria-pressed={isSelected}
      className={`flex h-12 flex-col items-center justify-start gap-1 pt-1 ${inMonth ? '' : 'opacity-30'}`}
    >
      <span className={`flex size-7 items-center justify-center rounded-full text-sm tabular-nums ${circle}`}>
        {day}
      </span>
      <span className="flex h-1.5 gap-0.5">
        {kinds.map((kind) => (
          <span key={kind} className={`size-1.5 rounded-full ${KIND_STYLE[kind].dot}`} />
        ))}
      </span>
    </button>
  )
}

function NavButton({ label, onClick, path }: { label: string; onClick: () => void; path: string }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="flex size-9 items-center justify-center rounded-full text-gray-600 active:bg-gray-100"
    >
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d={path} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}
