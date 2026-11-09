import { motion } from 'motion/react'

export type View = 'calendar' | 'list'

const VIEWS: readonly { id: View; label: string }[] = [
  { id: 'calendar', label: '캘린더' },
  { id: 'list', label: '목록' },
]

export function ViewSwitch({ view, onChange }: { view: View; onChange: (view: View) => void }) {
  return (
    <div className="grid grid-cols-2 rounded-2xl bg-gray-200/70 p-1" role="tablist">
      {VIEWS.map((item) => {
        const selected = item.id === view
        return (
          <button
            key={item.id}
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(item.id)}
            className={`relative rounded-xl py-2 text-sm font-semibold ${selected ? 'text-gray-900' : 'text-gray-500'}`}
          >
            {selected && (
              <motion.span
                layoutId="view-pill"
                className="absolute inset-0 rounded-xl bg-white shadow-sm"
                transition={{ type: 'spring', stiffness: 500, damping: 40 }}
              />
            )}
            <span className="relative">{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}
