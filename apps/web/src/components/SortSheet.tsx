import { SORT_OPTIONS, type SortKey } from '../domain/sort'
import { BottomSheet } from './BottomSheet'

interface Props {
  open: boolean
  value: SortKey
  onChange: (key: SortKey) => void
  onClose: () => void
}

export function SortSheet({ open, value, onChange, onClose }: Props) {
  return (
    <BottomSheet open={open} label="정렬" onClose={onClose}>
      <h2 className="text-xl font-bold">정렬</h2>
      <ul className="mt-3" role="radiogroup">
        {SORT_OPTIONS.map((option) => {
          const selected = option.key === value
          return (
            <li key={option.key}>
              <button
                role="radio"
                aria-checked={selected}
                onClick={() => {
                  onChange(option.key)
                  onClose()
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-3.5 text-left active:bg-gray-100 ${
                  selected ? 'font-semibold text-brand-600' : 'text-gray-800'
                }`}
              >
                {option.label}
                {selected && (
                  <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path d="M5 12l5 5 9-10" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </BottomSheet>
  )
}
