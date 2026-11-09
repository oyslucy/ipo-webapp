import type { EventKind } from '../domain/events'

export const KIND_STYLE: Record<EventKind, { label: string; dot: string; chip: string }> = {
  subscription: { label: '청약', dot: 'bg-brand-600', chip: 'bg-brand-50 text-brand-700' },
  listing: { label: '상장', dot: 'bg-emerald-500', chip: 'bg-emerald-50 text-emerald-700' },
  forecast: { label: '수요예측', dot: 'bg-amber-400', chip: 'bg-amber-50 text-amber-700' },
}

export const KIND_ORDER: readonly EventKind[] = ['subscription', 'listing', 'forecast']
