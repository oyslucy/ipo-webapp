import { weekOf } from './dates'
import { overlaps, type EventKind, type IpoEvent } from './events'

export interface WeekSummary {
  start: string
  end: string
  counts: Record<EventKind, number>
}

export function summarize(events: readonly IpoEvent[], today: string): WeekSummary {
  const { start, end } = weekOf(today)
  const counts: Record<EventKind, number> = { forecast: 0, subscription: 0, listing: 0 }
  for (const event of events) {
    if (overlaps(event, start, end)) counts[event.kind] += 1
  }
  return { start, end, counts }
}
