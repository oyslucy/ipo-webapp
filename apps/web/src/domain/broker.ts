import type { Broker } from './ipo'

/** Shares each applicant gets from the equal (균등) pool if subscriptions stopped now. */
export function expectedEqualShares(broker: Broker): number | null {
  if (broker.equal_shares === null || !broker.applications) return null
  return broker.equal_shares / broker.applications
}

export function formatExpectedShares(value: number | null): string {
  if (value === null) return '-'
  const shares = `약 ${value.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}주`
  // Below one share per person the equal pool is handed out by lottery.
  return value < 1 ? `${shares} (추첨)` : shares
}
