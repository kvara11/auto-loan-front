import { type DashboardQuery, type DashboardView, type PeriodKey } from "@/lib/dashboard/types"

export const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: "today", label: "დღეს" },
  { key: "7d", label: "7 დღე" },
  { key: "30d", label: "30 დღე" },
  { key: "month", label: "ეს თვე" },
  { key: "quarter", label: "კვარტალი" },
  { key: "year", label: "წელი" },
  { key: "range", label: "შუალედი" },
]

export const DEFAULT_PERIOD: PeriodKey = "30d"

// The report table's rows (the backend's DashboardPeriod::REPORT_KEYS) with the switcher's labels.
export const REPORT_LABELS: Record<string, string> = { today: "დღეს", "7d": "7 დღე", "30d": "30 დღე", month: "ეს თვე", year: "წელი" }

const VIEWS: DashboardView[] = ["data", "loading", "empty", "error"]

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`

// A new range starts as the last 30 days.
export function defaultRange() {
  const to = new Date()
  const from = new Date(to)
  from.setDate(to.getDate() - 29)
  return { from: iso(from), to: iso(to) }
}

const DATE = /^\d{4}-\d{2}-\d{2}$/

// ?period=&from=&to= (range only) — anything unknown falls back to the default.
export function readQuery(params: URLSearchParams): DashboardQuery {
  const raw = params.get("period") as PeriodKey | null
  const period = PERIODS.some((p) => p.key === raw) ? (raw as PeriodKey) : DEFAULT_PERIOD
  if (period !== "range") return { period, from: "", to: "" }

  const fallback = defaultRange()
  const from = DATE.test(params.get("from") ?? "") ? params.get("from")! : fallback.from
  const to = DATE.test(params.get("to") ?? "") ? params.get("to")! : fallback.to
  return from <= to ? { period, from, to } : { period, from: to, to: from }
}

export const readView = (params: URLSearchParams): DashboardView => {
  const raw = params.get("view") as DashboardView | null
  return raw && VIEWS.includes(raw) ? raw : "data"
}

const MONTHS = ["იანვარი", "თებერვალი", "მარტი", "აპრილი", "მაისი", "ივნისი", "ივლისი", "აგვისტო", "სექტემბერი", "ოქტომბერი", "ნოემბერი", "დეკემბერი"]

const dm = (d: string) => `${d.slice(8, 10)}.${d.slice(5, 7)}`

// The same labels the backend's DashboardPeriod gives (used by the mock).
export function periodLabel(query: DashboardQuery, now = new Date()) {
  switch (query.period) {
    case "today": return "დღეს"
    case "7d": return "ბოლო 7 დღე"
    case "30d": return "ბოლო 30 დღე"
    case "month": return `${MONTHS[now.getMonth()]} ${now.getFullYear()}`
    case "quarter": return "ბოლო 13 კვირა"
    case "year": return `${now.getFullYear()} წელი`
    default: return `${dm(query.from)} – ${dm(query.to)}.${query.to.slice(0, 4)}`
  }
}
