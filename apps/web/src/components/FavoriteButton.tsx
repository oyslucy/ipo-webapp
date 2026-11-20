interface Props {
  active: boolean
  name: string
  onToggle: () => void
  className?: string
}

export function FavoriteButton({ active, name, onToggle, className = '' }: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      aria-label={active ? `${name} 관심 종목에서 빼기` : `${name} 관심 종목에 추가`}
      className={`flex size-10 items-center justify-center rounded-full active:bg-gray-100 ${className}`}
    >
      <StarIcon filled={active} />
    </button>
  )
}

export function StarIcon({ filled, className = 'size-6' }: { filled: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`${className} ${filled ? 'text-amber-400' : 'text-gray-300'}`}
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinejoin="round"
    >
      <path d="M12 3.5l2.6 5.3 5.9.9-4.25 4.1 1 5.85L12 16.9l-5.25 2.75 1-5.85L3.5 9.7l5.9-.9z" />
    </svg>
  )
}
