import { type Figures, type PeriodKey, type SeriesPoint } from "@/lib/dashboard/types"

// Deterministic mock series (?mock=1 and the ?view= debug states only — never the real page).
// Every total, funnel step, status count and report row is summed from these points, so they add up.

export type MockPersona = "manager" | "officer" | "risk"

const PERSONA_INDEX: Record<MockPersona, number> = { manager: 0, officer: 1, risk: 2 }
const SCALE: Record<MockPersona, number> = { manager: 1, officer: 0.16, risk: 1.9 }
const SEED: Record<PeriodKey, number> = { today: 11, "7d": 23, "30d": 37, month: 41, quarter: 53, year: 67, range: 79 }
const MONTHS = ["იან", "თებ", "მარ", "აპრ", "მაი", "ივნ", "ივლ", "აგვ", "სექ", "ოქტ", "ნოე", "დეკ"]

// mulberry32
export function rng(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const pad = (n: number) => String(n).padStart(2, "0")
const dayLabel = (d: Date) => `${pad(d.getDate())}.${pad(d.getMonth() + 1)}`

function daysBack(n: number, step = 1) {
  const out: { label: string; days: number }[] = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i * step - (step - 1))
    out.push({ label: dayLabel(d), days: step })
  }
  return out
}

export function buckets(period: PeriodKey, from?: string, to?: string) {
  const now = new Date()
  if (period === "today") {
    return [0.05, 0.1, 0.13, 0.12, 0.09, 0.11, 0.13, 0.12, 0.09, 0.06].map((days, i) => ({ label: `${pad(9 + i)}:00`, days }))
  }
  if (period === "7d") return daysBack(7)
  if (period === "30d") return daysBack(30)
  if (period === "month") return daysBack(now.getDate())
  if (period === "quarter") return daysBack(13, 7)
  if (period === "year") {
    return MONTHS.slice(0, now.getMonth() + 1).map((label, i) => ({
      label,
      days: i === now.getMonth() ? now.getDate() : new Date(now.getFullYear(), i + 1, 0).getDate(),
    }))
  }
  const start = from ? new Date(from) : new Date(now.getTime() - 29 * 86400000)
  const end = to ? new Date(to) : now
  const count = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1)
  return Array.from({ length: Math.min(count, 62) }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return { label: dayLabel(d), days: 1 }
  })
}

export function series(period: PeriodKey, persona: MockPersona, empty: boolean, from?: string, to?: string): SeriesPoint[] {
  const r = rng(SEED[period] * 97 + PERSONA_INDEX[persona] * 13)
  const scale = empty ? 0 : SCALE[persona]

  return buckets(period, from, to).map(({ label, days }) => {
    const n = () => 0.78 + r() * 0.44
    const created = Math.max(0, Math.round(14 * scale * days * n()))
    const submitted = Math.min(created, Math.round(created * 0.82 * n()))
    const decided = Math.min(submitted, Math.round(submitted * 0.9 * n()))
    const approved = Math.min(decided, Math.round(decided * 0.71 * n()))
    const rejected = Math.round((decided - approved) * 0.62)
    return {
      label,
      created,
      requested: Math.round((created * 21800 * n()) / 100) * 100,
      submitted,
      decided,
      approved,
      approved_amount: Math.round((approved * 19600 * n()) / 100) * 100,
      rejected,
      returned: decided - approved - rejected,
      decision_hours: decided ? Math.round((14 + r() * 8) * 10) / 10 : null,
    }
  })
}

const ZERO: Figures = { created: 0, requested: 0, submitted: 0, decided: 0, approved: 0, approved_amount: 0, rejected: 0, returned: 0, decision_hours: null }

export function total(points: SeriesPoint[]): Figures {
  const sum = points.reduce<Figures>((t, p) => ({
    created: t.created + p.created,
    requested: t.requested + p.requested,
    submitted: t.submitted + p.submitted,
    decided: t.decided + p.decided,
    approved: t.approved + p.approved,
    approved_amount: t.approved_amount + p.approved_amount,
    rejected: t.rejected + p.rejected,
    returned: t.returned + p.returned,
    decision_hours: null,
  }), ZERO)
  const timed = points.filter((p) => p.decision_hours !== null)
  const weight = timed.reduce((s, p) => s + p.decided, 0)
  return { ...sum, decision_hours: weight ? Math.round((timed.reduce((s, p) => s + p.decision_hours! * p.decided, 0) / weight) * 10) / 10 : null }
}

// The previous period: the same totals moved by a per-period, per-persona random change (-9%…+21%).
export function previous(t: Figures, period: PeriodKey, persona: MockPersona): Figures {
  const r = rng(SEED[period] * 31 + PERSONA_INDEX[persona] * 7)
  const k = () => 1 / (1 + (r() * 30 - 9) / 100)
  const n = (v: number) => Math.round(v * k())
  return {
    created: n(t.created), requested: n(t.requested), submitted: n(t.submitted), decided: n(t.decided),
    approved: n(t.approved), approved_amount: n(t.approved_amount), rejected: n(t.rejected), returned: n(t.returned),
    decision_hours: t.decision_hours === null ? null : Math.round(t.decision_hours * (1 + r() * 0.12) * 10) / 10,
  }
}
