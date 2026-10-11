import { compactMoney, dec, fmt, hours, money, percent, waited } from "@/lib/dashboard/format"
import { type Overview, type SeriesPoint } from "@/lib/dashboard/types"

// KPI cards derived from the raw overview. Delta colour means good or bad, not direction:
// for the queue and the decision time a decrease is good. The arrow and the number always come with it.

export type Tone = "pos" | "neg" | "neu"

export type Kpi = {
  key: string
  label: string
  value: string
  delta: { text: string; tone: Tone; title: string }
  sub: string
  spark: number[]
  soon?: boolean
}

const UNCHANGED = { text: "● უცვლელი", tone: "neu" as Tone }

function shaped(change: number, unit: string, goodUp: boolean, digits = 1) {
  if (Math.abs(change) < 0.05) return UNCHANGED
  const arrow = change > 0 ? "▲" : "▼"
  return { text: `${arrow} ${dec(Math.abs(change), digits)}${unit}`, tone: (change > 0) === goodUp ? ("pos" as Tone) : ("neg" as Tone) }
}

// Relative change in %; a previous 0 has no percentage.
function pct(current: number, prev: number, goodUp = true) {
  if (prev === 0) return current === 0 ? UNCHANGED : { text: "წინა: 0", tone: "neu" as Tone }
  return shaped(((current - prev) / prev) * 100, "%", goodUp)
}

// Up to 12 points: longer series are summed in groups.
export function chunk(values: number[], size = 12) {
  if (values.length <= size) return values
  const step = values.length / size
  return Array.from({ length: size }, (_, i) => values.slice(Math.floor(i * step), Math.floor((i + 1) * step)).reduce((s, v) => s + v, 0))
}

const pick = (series: SeriesPoint[], key: keyof SeriesPoint) => chunk(series.map((p) => Number(p[key] ?? 0)))

function rateSeries(series: SeriesPoint[]) {
  const decided = pick(series, "decided")
  const approved = pick(series, "approved")
  return decided.map((d, i) => (d ? (approved[i] / d) * 100 : 0))
}

export function buildKpis(o: Overview): Kpi[] {
  const { totals: t, previous: p, series } = o.trend
  const title = `შედარება: წინა პერიოდი (${o.period.previous_from || "—"} – ${o.period.previous_to || "—"})`
  const rate = percent(t.approved, t.decided)
  const prevRate = percent(p.approved, p.decided)
  const oldest = waited(o.queue.oldest_submitted_at)

  const queue: Kpi = {
    key: "queue", label: "რიგში", value: fmt(o.queue.count),
    delta: { ...shaped(o.queue.count - o.queue.yesterday, " გუშინდელთან", false, 0), title: "შედარება: გუშინ ამავე დროს" },
    sub: o.queue.count ? `უძველესი: ${oldest.hours >= 24 ? `${Math.floor(oldest.hours / 24)} დღე` : oldest.text}` : "რიგი ცარიელია",
    spark: o.queue.series,
  }
  const time: Kpi = {
    key: "time", label: "გადაწყვეტის საშუალო დრო", value: t.decision_hours === null ? "—" : hours(t.decision_hours),
    delta: { ...(t.decision_hours !== null && p.decision_hours !== null ? shaped(t.decision_hours - p.decision_hours, " სთ", false) : UNCHANGED), title },
    sub: "გაგზავნიდან გადაწყვეტილებამდე",
    spark: chunk(series.map((s) => s.decision_hours ?? 0)),
  }
  const approval: Kpi = {
    key: "rate", label: "დამტკიცების მაჩვენებელი", value: rate === null ? "—" : `${dec(rate)}%`,
    delta: { ...(rate !== null && prevRate !== null ? shaped(rate - prevRate, " პ.პ.", true) : UNCHANGED), title },
    sub: "დამტკიცებული / გადაწყვეტილი", spark: rateSeries(series),
  }

  if (o.persona === "risk" && o.today) {
    return [queue, {
      key: "today", label: "დღეს გადაწყვეტილი", value: fmt(o.today.decided),
      delta: { ...pct(o.today.decided, o.today.decided_yesterday), title: "შედარება: გუშინ ამავე დროს" },
      sub: `დამტკიცდა ${fmt(o.today.approved)}`, spark: o.today.decided_series,
    }, time, approval]
  }

  return [
    { key: "created", label: "ახალი განაცხადები", value: fmt(t.created), delta: { ...pct(t.created, p.created), title }, sub: o.period.label, spark: pick(series, "created") },
    { key: "requested", label: "მოთხოვნილი თანხა", value: compactMoney(t.requested), delta: { ...pct(t.requested, p.requested), title },
      sub: `საშ. ${money(t.created ? t.requested / t.created : 0)}`, spark: pick(series, "requested") },
    { key: "approved", label: "დამტკიცებული თანხა", value: compactMoney(t.approved_amount), delta: { ...pct(t.approved_amount, p.approved_amount), title },
      sub: `${fmt(t.approved)} განაცხადი`, spark: pick(series, "approved_amount") },
    approval, queue, time,
    { key: "disbursed", label: "გაცემული თანხა", value: "—", delta: { ...UNCHANGED, title: "" }, sub: "გაცემის მოდული მზადდება", spark: [], soon: true },
  ]
}
