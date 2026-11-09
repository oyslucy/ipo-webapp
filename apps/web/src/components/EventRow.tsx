import type { EventPhase, IpoEvent } from '../domain/events'
import { phaseOn } from '../domain/events'
import { formatRange, formatWon } from '../domain/format'
import type { Ipo } from '../domain/ipo'
import { KIND_STYLE } from './kindStyle'

const PHASE_SUFFIX: Record<EventPhase, string> = {
  start: ' 시작',
  ongoing: ' 중',
  end: ' 마감',
  single: '',
}

interface Props {
  event: IpoEvent
  date: string
  onSelect: (ipo: Ipo) => void
}

export function EventRow({ event, date, onSelect }: Props) {
  const style = KIND_STYLE[event.kind]
  const price = event.ipo.fixed_price ?? event.ipo.hope_price_high
  return (
    <button
      onClick={() => onSelect(event.ipo)}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left active:bg-gray-100"
    >
      <span className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-medium ${style.chip}`}>
        {style.label}
        {PHASE_SUFFIX[phaseOn(event, date)]}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{event.ipo.name}</span>
        <span className="block truncate text-xs text-gray-400 tabular-nums">
          {[
            event.start === event.end ? formatWon(price) : formatRange(event.start, event.end),
            ...event.ipo.underwriters,
          ].join(' · ')}
        </span>
      </span>
    </button>
  )
}
