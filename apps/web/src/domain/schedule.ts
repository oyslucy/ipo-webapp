import type { Ipo } from './ipo'

export type StepKind =
  | 'review'
  | 'approval'
  | 'filing'
  | 'forecast'
  | 'subscription'
  | 'allocation'
  | 'refund'
  | 'listing'

export interface Step {
  kind: StepKind
  label: string
  start: string
  end: string
}

export type StepState = 'done' | 'active' | 'upcoming'

export function scheduleOf(ipo: Ipo): Step[] {
  const candidates: [StepKind, string, string | null, string | null][] = [
    ['review', '예비심사 청구', ipo.review_requested_on, null],
    ['approval', '심사 승인', ipo.approved_on, null],
    ['filing', '증권신고서 제출', ipo.filed_on, null],
    ['forecast', '수요예측', ipo.forecast_start, ipo.forecast_end],
    ['subscription', '청약', ipo.subscription_start, ipo.subscription_end],
    ['allocation', '배정 공고', ipo.allocation_on, null],
    ['refund', '환불 · 납입', ipo.refund_on ?? ipo.payment_on, null],
    ['listing', '상장', ipo.listing_on, null],
  ]
  return candidates.flatMap(([kind, label, start, end]) =>
    start === null ? [] : [{ kind, label, start, end: end ?? start }],
  )
}

export function stepState(step: Step, today: string): StepState {
  if (step.end < today) return 'done'
  if (step.start <= today) return 'active'
  return 'upcoming'
}
