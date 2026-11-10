import { useEffect, useState } from 'react'
import { freshnessOf } from '../domain/freshness'

const TICK_MS = 60_000

export function UpdatedBadge({ fetchedAt }: { fetchedAt: string }) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), TICK_MS)
    return () => clearInterval(id)
  }, [])
  const { stamp, age, stale } = freshnessOf(fetchedAt, now)

  return (
    <p
      title={stale ? '자동 수집이 늦어지고 있어요' : undefined}
      className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs tabular-nums ${
        stale ? 'bg-amber-50 text-amber-700' : 'bg-white text-gray-500 ring-1 ring-gray-100'
      }`}
    >
      <span className={`size-1.5 rounded-full ${stale ? 'bg-amber-500' : 'bg-brand-500'}`} />
      {stamp} 갱신 · {age}
    </p>
  )
}
