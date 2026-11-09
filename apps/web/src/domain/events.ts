import { isWeekend } from './dates'
import type { Ipo } from './ipo'
import { tabOf } from './tabs'

export type EventKind = 'forecast' | 'subscription' | 'listing'

export interface IpoEvent {
  kind: EventKind
  ipo: Ipo
  start: string
  end: string
}

export type EventPhase = 'start' | 'ongoing' | 'end' | 'single'

export function eventsOf(ipos: readonly Ipo[], today: string): IpoEvent[] {
  return ipos
    .filter((ipo) => tabOf(ipo, today) !== null)
    .flatMap((ipo) => {
      const events: IpoEvent[] = []
      if (ipo.forecast_start) {
        events.push({
          kind: 'forecast',
          ipo,
          start: ipo.forecast_start,
          end: ipo.forecast_end ?? ipo.forecast_start,
        })
      }
      if (ipo.subscription_start) {
        events.push({
          kind: 'subscription',
          ipo,
          start: ipo.subscription_start,
          end: ipo.subscription_end ?? ipo.subscription_start,
        })
      }
      if (ipo.listing_on) {
        events.push({ kind: 'listing', ipo, start: ipo.listing_on, end: ipo.listing_on })
      }
      return events
    })
}

/** Multi-day events skip weekends in between, since the market is closed. */
export function occursOn(event: IpoEvent, date: string): boolean {
  if (date < event.start || date > event.end) return false
  return date === event.start || date === event.end || !isWeekend(date)
}

export function eventsOn(events: readonly IpoEvent[], date: string): IpoEvent[] {
  return events.filter((event) => occursOn(event, date))
}

export function overlaps(event: IpoEvent, start: string, end: string): boolean {
  return event.start <= end && event.end >= start
}

export function phaseOn(event: IpoEvent, date: string): EventPhase {
  if (event.start === event.end) return 'single'
  if (date === event.start) return 'start'
  if (date === event.end) return 'end'
  return 'ongoing'
}
