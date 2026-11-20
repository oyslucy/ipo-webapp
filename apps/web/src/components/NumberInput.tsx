export const FIELD =
  'w-full min-w-0 rounded-xl bg-gray-50 px-3 py-2.5 text-base tabular-nums ring-1 ring-gray-200 outline-none focus:ring-2 focus:ring-brand-500'

function parseNumber(text: string): number | null {
  const digits = text.replace(/[^\d.]/g, '')
  return digits === '' ? null : Number(digits)
}

export function NumberInput(props: {
  label: string
  placeholder?: string
  value: number | null
  suffix?: string
  onChange: (value: number | null) => void
}) {
  return (
    <label className="flex flex-1 items-center gap-2">
      <input
        inputMode="numeric"
        aria-label={props.label}
        placeholder={props.placeholder ?? props.label}
        value={props.value === null ? '' : props.value.toLocaleString('ko-KR')}
        onChange={(event) => props.onChange(parseNumber(event.target.value))}
        className={FIELD}
      />
      {props.suffix && <span className="shrink-0 text-sm text-gray-500">{props.suffix}</span>}
    </label>
  )
}
