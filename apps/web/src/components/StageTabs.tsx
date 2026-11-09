import { motion } from 'motion/react'
import { TABS, type TabId } from '../domain/tabs'

interface Props {
  active: TabId
  counts: Record<TabId, number>
  onChange: (tab: TabId) => void
}

export function StageTabs({ active, counts, onChange }: Props) {
  return (
    <nav className="-mx-4 flex gap-1 overflow-x-auto px-4 [scrollbar-width:none]" role="tablist">
      {TABS.map((tab) => {
        const selected = tab.id === active
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab.id)}
            className={`relative shrink-0 rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
              selected ? 'text-white' : 'text-gray-600 active:bg-gray-100'
            }`}
          >
            {selected && (
              <motion.span
                layoutId="tab-pill"
                className="absolute inset-0 rounded-full bg-gray-900"
                transition={{ type: 'spring', stiffness: 500, damping: 40 }}
              />
            )}
            <span className="relative">
              {tab.label}
              <span className={`ml-1 ${selected ? 'text-gray-300' : 'text-gray-400'}`}>
                {counts[tab.id]}
              </span>
            </span>
          </button>
        )
      })}
    </nav>
  )
}
