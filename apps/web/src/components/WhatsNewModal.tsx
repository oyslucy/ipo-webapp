import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef } from 'react'
import type { Release } from '../domain/whatsNew'

interface Props {
  open: boolean
  release: Release
  onClose: () => void
}

export function WhatsNewModal({ open, release, onClose }: Props) {
  const confirmRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    confirmRef.current?.focus()
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="whats-new-title"
            className="flex max-h-[85dvh] w-full max-w-sm flex-col rounded-3xl bg-white shadow-xl"
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            onClick={(event) => event.stopPropagation()}
          >
            <header className="px-6 pt-6">
              <p className="text-xs font-semibold text-brand-600">업데이트</p>
              <h2 id="whats-new-title" className="mt-1 text-xl font-bold">
                새로운 기능이 추가됐어요
              </h2>
            </header>
            <ul className="mt-4 min-h-0 flex-1 space-y-4 overflow-y-auto px-6">
              {release.items.map((item) => (
                <li key={item.title} className="flex gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-xl" aria-hidden>
                    {item.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold">{item.title}</p>
                    <p className="mt-0.5 text-sm leading-snug break-keep text-gray-500">{item.body}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="p-6 pt-5">
              <button
                ref={confirmRef}
                onClick={onClose}
                className="w-full rounded-2xl bg-brand-600 py-3.5 font-semibold text-white active:bg-brand-700"
              >
                확인
              </button>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
