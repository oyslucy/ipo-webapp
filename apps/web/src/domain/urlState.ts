import type { EventKind } from './events'
import { EMPTY_FILTER, type IpoFilter, type NumberRange } from './filter'
import { SORT_OPTIONS, type SortKey } from './sort'
import { TABS, type TabId } from './tabs'

export type View = 'calendar' | 'list'

/** Everything a shared link or a reload should restore. */
export interface UrlState {
  view: View
  /** null lets the list pick the first tab that has items. */
  tab: TabId | null
  sort: SortKey
  filter: IpoFilter
  favoritesOnly: boolean
  /** Code of the IPO whose detail sheet is open. */
  ipo: string | null
}

export const DEFAULT_URL_STATE: UrlState = {
  view: 'calendar',
  tab: null,
  sort: 'schedule',
  filter: EMPTY_FILTER,
  favoritesOnly: false,
  ipo: null,
}

const VIEWS: readonly View[] = ['calendar', 'list']
const EVENT_KINDS: readonly EventKind[] = ['forecast', 'subscription', 'listing']
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

function oneOf<T extends string>(value: string | null, options: readonly T[]): T | null {
  return options.find((option) => option === value) ?? null
}

function parseNumber(value: string | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null
}

function parseRange(value: string | null): NumberRange {
  if (value === null) return { min: null, max: null }
  const [min, max] = value.split('~')
  return { min: parseNumber(min), max: parseNumber(max) }
}

function encodeRange(range: NumberRange): string | null {
  if (range.min === null && range.max === null) return null
  return `${range.min ?? ''}~${range.max ?? ''}`
}

function parseDate(value: string | null): string | null {
  return value !== null && ISO_DATE.test(value) ? value : null
}

function decodeFilter(params: URLSearchParams): IpoFilter {
  return {
    query: params.get('q') ?? '',
    underwriters: params.getAll('uw').filter((name) => name !== ''),
    hopePrice: parseRange(params.get('hp')),
    fixedPrice: parseRange(params.get('fp')),
    dateKind: oneOf(params.get('dk'), EVENT_KINDS) ?? 'any',
    dateFrom: parseDate(params.get('df')),
    dateTo: parseDate(params.get('dt')),
    minRatio: parseNumber(params.get('mr')),
    minInstitutionRatio: parseNumber(params.get('mir')),
  }
}

export function decodeUrlState(search: string): UrlState {
  const params = new URLSearchParams(search)
  return {
    view: oneOf(params.get('view'), VIEWS) ?? DEFAULT_URL_STATE.view,
    tab: oneOf(
      params.get('tab'),
      TABS.map((tab) => tab.id),
    ),
    sort:
      oneOf(
        params.get('sort'),
        SORT_OPTIONS.map((option) => option.key),
      ) ?? DEFAULT_URL_STATE.sort,
    filter: decodeFilter(params),
    favoritesOnly: params.get('fav') === '1',
    ipo: params.get('ipo') || null,
  }
}

/** Only non-default values are written so plain visits keep a clean URL. */
export function encodeUrlState(state: UrlState): string {
  const params = new URLSearchParams()
  const set = (key: string, value: string | number | null) => {
    if (value !== null && value !== '') params.set(key, String(value))
  }
  const { filter } = state
  if (state.view !== DEFAULT_URL_STATE.view) set('view', state.view)
  set('tab', state.tab)
  if (state.sort !== DEFAULT_URL_STATE.sort) set('sort', state.sort)
  set('q', filter.query)
  for (const name of filter.underwriters) params.append('uw', name)
  set('hp', encodeRange(filter.hopePrice))
  set('fp', encodeRange(filter.fixedPrice))
  if (filter.dateKind !== 'any') set('dk', filter.dateKind)
  set('df', filter.dateFrom)
  set('dt', filter.dateTo)
  set('mr', filter.minRatio)
  set('mir', filter.minInstitutionRatio)
  if (state.favoritesOnly) set('fav', '1')
  set('ipo', state.ipo)
  return params.toString()
}
