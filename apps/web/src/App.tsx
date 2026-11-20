import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useMemo, useState } from 'react'
import { FilterSheet } from './components/FilterSheet'
import { IpoCard } from './components/IpoCard'
import { IpoSheet } from './components/IpoSheet'
import { MonthCalendar } from './components/MonthCalendar'
import { SearchBar } from './components/SearchBar'
import { SortSheet } from './components/SortSheet'
import { StageTabs } from './components/StageTabs'
import { UpdatedBadge } from './components/UpdatedBadge'
import { ViewSwitch } from './components/ViewSwitch'
import { WeekSummary } from './components/WeekSummary'
import { WhatsNewModal } from './components/WhatsNewModal'
import { useDataset } from './data/useDataset'
import { useFavorites } from './data/useFavorites'
import { useUrlState } from './data/useUrlState'
import { useWhatsNew } from './data/useWhatsNew'
import { eventsOf } from './domain/events'
import { activeFilterCount, EMPTY_FILTER, matchesFilter, underwriterOptions } from './domain/filter'
import { todayKst, type Dataset, type Ipo } from './domain/ipo'
import { sortIpos, sortLabel, type SortKey } from './domain/sort'
import { summarize } from './domain/summary'
import { firstNonEmptyTab, groupByTab, tabOf, TABS, type TabId } from './domain/tabs'
import type { UrlState } from './domain/urlState'
import { LATEST_RELEASE } from './domain/whatsNew'

export default function App() {
  const state = useDataset()

  return (
    <main className="mx-auto min-h-dvh max-w-md bg-gray-50 px-4 pt-[max(1.25rem,env(safe-area-inset-top))] pb-10 text-gray-900">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold">
          <span className="text-brand-600">공모주</span> 캘린더
        </h1>
        {state.status === 'ready' && <UpdatedBadge fetchedAt={state.dataset.fetched_at} />}
      </header>
      {state.status === 'loading' && <p className="mt-6 text-sm text-gray-400">불러오는 중…</p>}
      {state.status === 'error' && (
        <p className="mt-6 text-sm text-red-500">데이터를 불러오지 못했어요 ({state.message})</p>
      )}
      {state.status === 'ready' && <Board dataset={state.dataset} />}
      {state.status === 'ready' && <WhatsNew />}
    </main>
  )
}

function WhatsNew() {
  const [open, dismiss] = useWhatsNew(LATEST_RELEASE)
  return <WhatsNewModal open={open} release={LATEST_RELEASE} onClose={dismiss} />
}

function Board({ dataset }: { dataset: Dataset }) {
  const today = todayKst()
  const url = useUrlState()
  const ui = url.state
  const { filter, favoritesOnly } = ui
  const [filterOpen, setFilterOpen] = useState(false)
  const [favorites, toggleFavorite] = useFavorites()
  const closeFilter = useCallback(() => setFilterOpen(false), [])

  const update = (patch: Partial<UrlState>) => url.replace({ ...ui, ...patch })
  const selected = useMemo(
    () => (ui.ipo === null ? null : (dataset.ipos.find((ipo) => ipo.code === ui.ipo) ?? null)),
    [dataset, ui.ipo],
  )
  const open = (ipo: Ipo) => url.push({ ...ui, ipo: ipo.code })
  const { pop } = url
  const close = useCallback(() => pop({ ...ui, ipo: null }), [pop, ui])

  // The weekly summary stays unfiltered; search and filters narrow the calendar and list.
  const summary = useMemo(() => summarize(eventsOf(dataset.ipos, today), today), [dataset, today])
  const underwriters = useMemo(() => underwriterOptions(dataset.ipos), [dataset])
  const visible = useMemo(
    () =>
      dataset.ipos.filter(
        (ipo) =>
          tabOf(ipo, today) !== null &&
          (!favoritesOnly || favorites.has(ipo.code)) &&
          matchesFilter(ipo, filter),
      ),
    [dataset, filter, today, favoritesOnly, favorites],
  )
  const events = useMemo(() => eventsOf(visible, today), [visible, today])
  const filterCount = activeFilterCount(filter)

  return (
    <>
      <div className="mt-4">
        <WeekSummary summary={summary} />
      </div>
      <div className="mt-5">
        <ViewSwitch view={ui.view} onChange={(view) => update({ view })} />
      </div>
      <div className="mt-3">
        <SearchBar
          query={filter.query}
          filterCount={filterCount}
          favoritesOnly={favoritesOnly}
          onQueryChange={(query) => update({ filter: { ...filter, query } })}
          onOpenFilter={() => setFilterOpen(true)}
          onToggleFavoritesOnly={() => update({ favoritesOnly: !favoritesOnly })}
        />
        {(filter.query !== '' || filterCount > 0 || favoritesOnly) && (
          <div className="mt-2 flex items-center justify-between px-1 text-sm">
            <span className="text-gray-500">
              <b className="text-brand-600 tabular-nums">{visible.length}</b>개 종목
            </span>
            <button
              onClick={() => update({ filter: EMPTY_FILTER, favoritesOnly: false })}
              className="text-gray-500 underline-offset-2 active:underline"
            >
              전체 초기화
            </button>
          </div>
        )}
      </div>
      <div className="mt-3">
        {ui.view === 'calendar' ? (
          <MonthCalendar events={events} today={today} onSelect={open} />
        ) : (
          <StageList
            ipos={visible}
            today={today}
            tab={ui.tab}
            sort={ui.sort}
            favorites={favorites}
            emptyText={favoritesOnly && favorites.size === 0 ? '별을 눌러 관심 종목을 추가해 보세요' : undefined}
            onTabChange={(tab) => update({ tab })}
            onSortChange={(sort) => update({ sort })}
            onSelect={open}
            onToggleFavorite={toggleFavorite}
          />
        )}
      </div>
      <IpoSheet
        ipo={selected}
        today={today}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
        onClose={close}
      />
      <FilterSheet
        open={filterOpen}
        filter={filter}
        underwriters={underwriters}
        resultCount={visible.length}
        onChange={(next) => update({ filter: next })}
        onClose={closeFilter}
      />
    </>
  )
}

interface StageListProps {
  ipos: readonly Ipo[]
  today: string
  /** null picks the first tab that has items. */
  tab: TabId | null
  sort: SortKey
  favorites: ReadonlySet<string>
  emptyText?: string
  onTabChange: (tab: TabId) => void
  onSortChange: (sort: SortKey) => void
  onSelect: (ipo: Ipo) => void
  onToggleFavorite: (code: string) => void
}

function StageList(props: StageListProps) {
  const { ipos, today, sort, favorites, emptyText, onSelect, onToggleFavorite } = props
  const groups = useMemo(() => groupByTab(ipos, today), [ipos, today])
  const counts = useMemo(
    () => Object.fromEntries(TABS.map((t) => [t.id, groups[t.id].length])) as Record<TabId, number>,
    [groups],
  )
  const tab = props.tab ?? firstNonEmptyTab(groups)
  const [sortOpen, setSortOpen] = useState(false)
  const closeSort = useCallback(() => setSortOpen(false), [])
  const items = useMemo(() => sortIpos(groups[tab], sort), [groups, tab, sort])

  return (
    <>
      <div className="sticky top-0 z-10 -mx-4 bg-gray-50/90 px-4 py-2 backdrop-blur">
        <StageTabs active={tab} counts={counts} onChange={props.onTabChange} />
      </div>
      <div className="mt-1 flex items-center justify-between px-1">
        <span className="text-sm text-gray-500 tabular-nums">{items.length}개</span>
        <button
          onClick={() => setSortOpen(true)}
          className={`-mr-2 flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium active:bg-gray-100 ${
            sort === 'schedule' ? 'text-gray-600' : 'text-brand-600'
          }`}
        >
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M7 4v16M7 20l-3-3M7 20l3-3M17 20V4M17 4l-3 3M17 4l3 3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {sortLabel(sort)}
        </button>
      </div>
      <AnimatePresence mode="wait">
        <motion.ul
          key={`${tab}-${sort}`}
          className="mt-2 space-y-3"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
        >
          {items.length === 0 && (
            <li className="py-16 text-center text-sm text-gray-400">
              {emptyText ?? '조건에 맞는 종목이 없어요'}
            </li>
          )}
          {items.map((ipo) => (
            <li key={ipo.code}>
              <IpoCard
                ipo={ipo}
                tab={tab}
                favorite={favorites.has(ipo.code)}
                onSelect={onSelect}
                onToggleFavorite={onToggleFavorite}
              />
            </li>
          ))}
        </motion.ul>
      </AnimatePresence>
      <SortSheet open={sortOpen} value={sort} onChange={props.onSortChange} onClose={closeSort} />
    </>
  )
}
