import { expectedEqualShares } from './broker'
import type { Broker, Ipo } from './ipo'

/** Most Korean IPOs ask for half the subscription amount up front. */
export const DEFAULT_MARGIN_RATIO = 50

export interface OfferPrice {
  price: number
  /** True while only the hoped-for band is known; the top of the band is used. */
  estimated: boolean
}

export function offerPrice(ipo: Ipo): OfferPrice | null {
  if (ipo.fixed_price !== null) return { price: ipo.fixed_price, estimated: false }
  if (ipo.hope_price_high !== null) return { price: ipo.hope_price_high, estimated: true }
  return null
}

export interface EqualEstimate {
  /** Cash needed to place the minimum order in every account. */
  deposit: number | null
  /** Expected equal-pool shares across all accounts; below 1 per account it is a lottery. */
  shares: number | null
  /** Value of those shares at the offer price. */
  amount: number | null
  /** Gain or loss if they are sold at the given price. */
  profit: number | null
}

export interface EstimateInput {
  price: number
  marginRatio: number
  accounts: number
  sellPrice: number | null
}

export function estimateEqual(broker: Broker, input: EstimateInput): EqualEstimate {
  const { price, marginRatio, accounts, sellPrice } = input
  const expected = expectedEqualShares(broker)
  // An account applying for the minimum cannot be allotted more than it asked for.
  const perAccount =
    expected === null || broker.min_shares === null ? expected : Math.min(expected, broker.min_shares)
  const shares = perAccount === null ? null : perAccount * accounts
  return {
    deposit: broker.min_shares === null ? null : broker.min_shares * price * (marginRatio / 100) * accounts,
    shares,
    amount: shares === null ? null : shares * price,
    profit: shares === null || sellPrice === null ? null : shares * (sellPrice - price),
  }
}
