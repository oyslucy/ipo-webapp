import type { Ipo } from './ipo'

export type TabId = 'subscription' | 'upcoming' | 'forecast' | 'listing' | 'examination' | 'listed'

export const TABS: readonly { id: TabId; label: string }[] = [
  { id: 'subscription', label: '청약' },
  { id: 'upcoming', label: '청약 예정' },
  { id: 'forecast', label: '수요예측' },
  { id: 'listing', label: '상장 예정' },
  { id: 'examination', label: '심사 중' },
  { id: 'listed', label: '상장 완료' },
]

export function isWithdrawn(ipo: Ipo): boolean {
  return ipo.status_text?.includes('철회') ?? false
}

export function tabOf(ipo: Ipo, today: string): TabId | null {
  if (ipo.listing_on !== null && ipo.listing_on <= today) return 'listed'
  // Records that left the feed without a past listing date are stale; hide them.
  if (!ipo.in_feed) return null
  switch (ipo.stage) {
    case 'subscription':
    case 'subscription_done':
      return 'subscription'
    // Demand forecast is over and only the subscription is left.
    case 'forecast_done':
      return 'upcoming'
    case 'demand_forecast':
      return 'forecast'
    case 'listing':
      return 'listing'
    case 'examination':
      return 'examination'
  }
}

export function groupByTab(ipos: readonly Ipo[], today: string): Record<TabId, Ipo[]> {
  const groups: Record<TabId, Ipo[]> = {
    subscription: [],
    upcoming: [],
    forecast: [],
    listing: [],
    examination: [],
    listed: [],
  }
  for (const ipo of ipos) {
    const tab = tabOf(ipo, today)
    if (tab !== null) groups[tab].push(ipo)
  }
  groups.examination.sort((a, b) => Number(isWithdrawn(a)) - Number(isWithdrawn(b)))
  groups.listed.reverse()
  return groups
}

export function firstNonEmptyTab(groups: Record<TabId, Ipo[]>): TabId {
  return TABS.find((tab) => groups[tab.id].length > 0)?.id ?? 'subscription'
}
