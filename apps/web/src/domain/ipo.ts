export type FeedStage =
  | 'examination'
  | 'demand_forecast'
  | 'forecast_done'
  | 'subscription'
  | 'subscription_done'
  | 'listing'

export interface Company {
  founded_on: string | null
  ceo: string | null
  employees: number | null
  products: string | null
  homepage: string | null
  largest_shareholder: string | null
  largest_share_ratio: number | null
  company_class: string | null
  address: string | null
}

export interface Financial {
  period: string
  sales: number | null
  operating_profit: number | null
  net_profit: number | null
}

export interface Broker {
  name: string
  role: string | null
  allocated_shares: number | null
  min_shares: number | null
  equal_shares: number | null
  proportional_shares: number | null
  total_ratio: number | null
  proportional_ratio: number | null
  applications: number | null
  updated_at: string | null
}

export interface IpoDocument {
  title: string
  url: string
}

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
  offering_amount_low: number | null
  offering_amount_high: number | null
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
  withdrawn_on: string | null
  last_seen_on: string
  in_feed: boolean
  /** 기관 수요예측 경쟁률 */
  institution_ratio: number | null
  general_shares_min: number | null
  general_shares_max: number | null
  margin_ratio: number | null
  company: Company | null
  financials: Financial[]
  brokers: Broker[]
  documents: IpoDocument[]
}

export interface Dataset {
  fetched_at: string
  ipos: Ipo[]
}

/** ISO date (YYYY-MM-DD) in Korea time, so "today" matches the market calendar. */
export function todayKst(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(now)
}
