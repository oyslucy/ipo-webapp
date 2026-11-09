import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useMemo, useState } from 'react'
import { IpoCard } from './components/IpoCard'
import { IpoSheet } from './components/IpoSheet'
import { StageTabs } from './components/StageTabs'
import { useDataset } from './data/useDataset'
import { todayKst, type Dataset, type Ipo } from './domain/ipo'
import { firstNonEmptyTab, groupByTab, TABS, type TabId } from './domain/tabs'

export default function App() {
  const state = useDataset()

  return (
    <main className="mx-auto min-h-dvh max-w-md bg-gray-50 px-4 pt-[max(1.25rem,env(safe-area-inset-top))] pb-10 text-gray-900">
      <h1 className="text-xl font-bold">공모주</h1>
      {state.status === 'loading' && <p className="mt-6 text-sm text-gray-400">불러오는 중…</p>}
      {state.status === 'error' && (
        <p className="mt-6 text-sm text-red-500">데이터를 불러오지 못했어요 ({state.message})</p>
      )}
      {state.status === 'ready' && <IpoBoard dataset={state.dataset} />}
    </main>
  )
}

function IpoBoard({ dataset }: { dataset: Dataset }) {
  const today = todayKst()
  const groups = useMemo(() => groupByTab(dataset.ipos, today), [dataset, today])
  const counts = useMemo(
    () => Object.fromEntries(TABS.map((t) => [t.id, groups[t.id].length])) as Record<TabId, number>,
    [groups],
  )
  const [tab, setTab] = useState<TabId>(() => firstNonEmptyTab(groups))
  const [selected, setSelected] = useState<Ipo | null>(null)
  const close = useCallback(() => setSelected(null), [])

  return (
    <>
      <p className="mt-1 text-xs text-gray-400">
        {new Date(dataset.fetched_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })} 기준
      </p>
      <div className="sticky top-0 z-10 -mx-4 mt-4 bg-gray-50/90 px-4 py-2 backdrop-blur">
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
              <IpoCard ipo={ipo} tab={tab} onSelect={setSelected} />
            </li>
          ))}
        </motion.ul>
      </AnimatePresence>
      <IpoSheet ipo={selected} today={today} onClose={close} />
    </>
  )
}
