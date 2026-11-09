import type { ReactNode } from 'react'
import type { EventKind } from '../domain/events'
import { EMPTY_FILTER, type IpoFilter, type NumberRange } from '../domain/filter'
import { BottomSheet } from './BottomSheet'

interface Props {
  open: boolean
  filter: IpoFilter
  underwriters: readonly string[]
  resultCount: number
  onChange: (filter: IpoFilter) => void
  onClose: () => void
}

const DATE_KINDS: readonly { id: EventKind | 'any'; label: string }[] = [
  { id: 'any', label: '전체' },
  { id: 'subscription', label: '청약' },
  { id: 'listing', label: '상장' },
  { id: 'forecast', label: '수요예측' },
]

const INSTITUTION_PRESETS = [300, 500, 1000] as const
const RATIO_PRESETS = [100, 500, 1000] as const

export function FilterSheet({ open, filter, underwriters, resultCount, onChange, onClose }: Props) {
  const set = (patch: Partial<IpoFilter>) => onChange({ ...filter, ...patch })
  const toggleUnderwriter = (name: string) =>
    set({
      underwriters: filter.underwriters.includes(name)
        ? filter.underwriters.filter((n) => n !== name)
        : [...filter.underwriters, name],
    })

  const footer = (
    <div className="flex gap-2">
      <button
        onClick={() => onChange({ ...EMPTY_FILTER, query: filter.query })}
        className="rounded-2xl px-5 py-3.5 font-semibold text-gray-600 active:bg-gray-100"
      >
        초기화
      </button>
      <button
        onClick={onClose}
        className="flex-1 rounded-2xl bg-brand-600 py-3.5 font-semibold text-white active:bg-brand-700"
      >
        {resultCount}개 종목 보기
      </button>
    </div>
  )

  return (
    <BottomSheet open={open} label="필터" onClose={onClose} footer={footer}>
      <h2 className="text-xl font-bold">필터</h2>

      <Section title="증권사 (주관사)">
        <div className="flex flex-wrap gap-2">
          {underwriters.map((name) => (
            <Chip key={name} selected={filter.underwriters.includes(name)} onClick={() => toggleUnderwriter(name)}>
              {name}
            </Chip>
          ))}
        </div>
      </Section>

      <Section title="희망 공모가 (원)">
        <RangeInput range={filter.hopePrice} onChange={(hopePrice) => set({ hopePrice })} />
      </Section>

      <Section title="확정 공모가 (원)">
        <RangeInput range={filter.fixedPrice} onChange={(fixedPrice) => set({ fixedPrice })} />
      </Section>

      <Section title="일정 날짜">
        <div className="flex flex-wrap gap-2">
          {DATE_KINDS.map((kind) => (
            <Chip key={kind.id} selected={filter.dateKind === kind.id} onClick={() => set({ dateKind: kind.id })}>
              {kind.label}
            </Chip>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <DateInput label="시작일" value={filter.dateFrom} onChange={(dateFrom) => set({ dateFrom })} />
          <span className="text-gray-400">~</span>
          <DateInput label="종료일" value={filter.dateTo} onChange={(dateTo) => set({ dateTo })} />
        </div>
      </Section>

      <RatioSection
        title="기관 경쟁률 (최소)"
        value={filter.minInstitutionRatio}
        presets={INSTITUTION_PRESETS}
        onChange={(minInstitutionRatio) => set({ minInstitutionRatio })}
      />

      <RatioSection
        title="청약 경쟁률 (최소)"
        value={filter.minRatio}
        presets={RATIO_PRESETS}
        onChange={(minRatio) => set({ minRatio })}
      />
    </BottomSheet>
  )
}

function RatioSection(props: {
  title: string
  value: number | null
  presets: readonly number[]
  onChange: (value: number | null) => void
}) {
  return (
    <Section title={props.title}>
      <div className="flex flex-wrap gap-2">
        {props.presets.map((ratio) => (
          <Chip
            key={ratio}
            selected={props.value === ratio}
            onClick={() => props.onChange(props.value === ratio ? null : ratio)}
          >
            {ratio.toLocaleString('ko-KR')} : 1 이상
          </Chip>
        ))}
      </div>
      <div className="mt-3">
        <NumberInput label={`${props.title} 직접 입력`} placeholder="직접 입력" value={props.value} suffix=": 1 이상" onChange={props.onChange} />
      </div>
    </Section>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-6">
      <h3 className="mb-2.5 text-sm font-semibold text-gray-700">{title}</h3>
      {children}
    </section>
  )
}

function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={selected}
      className={`rounded-full px-3.5 py-1.5 text-sm ring-1 transition-colors ${
        selected ? 'bg-brand-600 font-medium text-white ring-brand-600' : 'bg-white text-gray-700 ring-gray-200'
      }`}
    >
      {children}
    </button>
  )
}

const FIELD = 'w-full min-w-0 rounded-xl bg-gray-50 px-3 py-2.5 text-base tabular-nums ring-1 ring-gray-200 outline-none focus:ring-2 focus:ring-brand-500'

function parseNumber(text: string): number | null {
  const digits = text.replace(/[^\d.]/g, '')
  return digits === '' ? null : Number(digits)
}

function NumberInput(props: {
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

function RangeInput({ range, onChange }: { range: NumberRange; onChange: (range: NumberRange) => void }) {
  return (
    <div className="flex items-center gap-2">
      <NumberInput label="최소" value={range.min} onChange={(min) => onChange({ ...range, min })} />
      <span className="text-gray-400">~</span>
      <NumberInput label="최대" value={range.max} onChange={(max) => onChange({ ...range, max })} />
    </div>
  )
}

function DateInput(props: { label: string; value: string | null; onChange: (value: string | null) => void }) {
  return (
    <input
      type="date"
      aria-label={props.label}
      value={props.value ?? ''}
      onChange={(event) => props.onChange(event.target.value || null)}
      className={FIELD}
    />
  )
}
