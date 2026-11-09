interface Props {
  query: string
  filterCount: number
  onQueryChange: (query: string) => void
  onOpenFilter: () => void
}

export function SearchBar({ query, filterCount, onQueryChange, onOpenFilter }: Props) {
  return (
    <div className="flex gap-2">
      <label className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl bg-white px-3.5 shadow-sm ring-1 ring-gray-100 focus-within:ring-2 focus-within:ring-brand-500">
        <svg viewBox="0 0 24 24" className="size-5 shrink-0 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="종목명, 업종, 증권사 검색"
          aria-label="검색"
          className="min-w-0 flex-1 bg-transparent py-3 text-base outline-none placeholder:text-gray-400 [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            onClick={() => onQueryChange('')}
            aria-label="검색어 지우기"
            className="flex size-6 shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-500"
          >
            <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={3}>
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </label>
      <button
        onClick={onOpenFilter}
        aria-label={`필터${filterCount > 0 ? ` ${filterCount}개 적용됨` : ''}`}
        className={`relative flex shrink-0 items-center gap-1.5 rounded-2xl px-4 text-sm font-semibold shadow-sm ring-1 ${
          filterCount > 0 ? 'bg-brand-600 text-white ring-brand-600' : 'bg-white text-gray-700 ring-gray-100'
        }`}
      >
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" />
        </svg>
        필터
        {filterCount > 0 && <span className="tabular-nums">{filterCount}</span>}
      </button>
    </div>
  )
}
