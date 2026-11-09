import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useMemo, useState } from 'react'
import { IpoCard } from './components/IpoCard'
import { IpoSheet } from './components/IpoSheet'
import { MonthCalendar } from './components/MonthCalendar'
import { StageTabs } from './components/StageTabs'
import { ViewSwitch, type View } from './components/ViewSwitch'
import { WeekSummary } from './components/WeekSummary'
import { useDataset } from './data/useDataset'
import { eventsOf } from './domain/events'
import { todayKst, type Dataset, type Ipo } from './domain/ipo'
import { summarize } from './domain/summary'
import { firstNonEmptyTab, groupByTab, TABS, type TabId } from './domain/tabs'

export default function App() {
  const state = useDataset()

  return (
    <main className="mx-auto min-h-dvh max-w-md bg-gray-50 px-4 pt-[max(1.25rem,env(safe-area-inset-top))] pb-10 text-gray-900">
      <h1 className="text-xl font-bold">
        <span className="text-brand-600">공모주</span> 캘린더
      </h1>
      {state.status === 'loading' && <p className="mt-6 text-sm text-gray-400">불러오는 중…</p>}
      {state.status === 'error' && (
        <p className="mt-6 text-sm text-red-500">데이터를 불러오지 못했어요 ({state.message})</p>
      )}
      {state.status === 'ready' && <Board dataset={state.dataset} />}
    </main>
  )
}

function Board({ dataset }: { dataset: Dataset }) {
  const today = todayKst()
  const events = useMemo(() => eventsOf(dataset.ipos, today), [dataset, today])
  const summary = useMemo(() => summarize(events, today), [events, today])
  const [view, setView] = useState<View>('calendar')
  const [selected, setSelected] = useState<Ipo | null>(null)
  const close = useCallback(() => setSelected(null), [])

  return (
    <>
      <p className="mt-1 text-xs text-gray-400">
        {new Date(dataset.fetched_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })} 기준
      </p>
      <div className="mt-4">
        <WeekSummary summary={summary} />
      </div>
      <div className="mt-5">
        <ViewSwitch view={view} onChange={setView} />
      </div>
      <div className="mt-3">
        {view === 'calendar' ? (
          <MonthCalendar events={events} today={today} onSelect={setSelected} />
        ) : (
          <StageList ipos={dataset.ipos} today={today} onSelect={setSelected} />
        )}
      </div>
      <IpoSheet ipo={selected} today={today} onClose={close} />
    </>
  )
}

interface StageListProps {
  ipos: readonly Ipo[]
  today: string
  onSelect: (ipo: Ipo) => void
}

function StageList({ ipos, today, onSelect }: StageListProps) {
  const groups = useMemo(() => groupByTab(ipos, today), [ipos, today])
  const counts = useMemo(
    () => Object.fromEntries(TABS.map((t) => [t.id, groups[t.id].length])) as Record<TabId, number>,
    [groups],
  )
  const [tab, setTab] = useState<TabId>(() => firstNonEmptyTab(groups))

  return (
    <>
      <div className="sticky top-0 z-10 -mx-4 bg-gray-50/90 px-4 py-2 backdrop-blur">
        <StageTabs active={tab} counts={counts} onChange={setTab} />
      </div>
      <AnimatePresence mode="wait">
        <motion.ul
          key={tab}
          className="mt-2 space-y-3"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
        >
          {groups[tab].length === 0 && (
            <li className="py-16 text-center text-sm text-gray-400">해당 종목이 없어요</li>
          )}
          {groups[tab].map((ipo) => (
            <li key={ipo.code}>
              <IpoCard ipo={ipo} tab={tab} onSelect={onSelect} />
            </li>
          ))}
        </motion.ul>
      </AnimatePresence>
    </>
  )
}
