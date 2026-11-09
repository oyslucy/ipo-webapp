export type FeedStage =
  | 'examination'
  | 'demand_forecast'
  | 'forecast_done'
  | 'subscription'
  | 'subscription_done'
  | 'listing'

export interface Ipo {
  code: string
  name: string
  market: string | null
  industry: string | null
  stage: FeedStage
  status_text: string | null
  underwriters: string[]
  hope_price_low: number | null
  hope_price_high: number | null
  fixed_price: number | null
  offered_shares: number | null
  offering_amount: number | null
  competition_ratio: number | null
  review_requested_on: string | null
  approved_on: string | null
  filed_on: string | null
  forecast_start: string | null
  forecast_end: string | null
  subscription_start: string | null
  subscription_end: string | null
  allocation_on: string | null
  payment_on: string | null
  refund_on: string | null
  listing_on: string | null
  last_seen_on: string
  in_feed: boolean
}

export interface Dataset {
  fetched_at: string
  ipos: Ipo[]
}

/** ISO date (YYYY-MM-DD) in Korea time, so "today" matches the market calendar. */
export function todayKst(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(now)
}
