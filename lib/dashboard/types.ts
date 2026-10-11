// The dashboard's data, as GET /api/dashboard/overview and /admin return it (raw numbers; the UI derives
// deltas, rates and labels in lib/dashboard/kpis.ts). The mock (mock.ts) returns the same shapes.

export type PeriodKey = "today" | "7d" | "30d" | "month" | "quarter" | "year" | "range"

export type Persona = "manager" | "officer" | "risk"

export type Figures = {
  created: number
  requested: number
  submitted: number
  decided: number
  approved: number
  approved_amount: number
  rejected: number
  returned: number
  decision_hours: number | null
}

export type SeriesPoint = Figures & { label: string }

export type Person = { id: number; first_name: string; last_name: string; avatar_url?: string | null }

export type PeriodMeta = {
  key: PeriodKey
  label: string
  unit: "hour" | "day" | "week" | "month"
  from: string
  to: string
  previous_from: string
  previous_to: string
}

export type TeamRow = { officer: Person; applications: number; amount: number; decided: number; approved: number; returned: number }

export type ActivityEvent = {
  id: number
  action: string
  from_status: string | null
  to_status: string | null
  comment: string | null
  actor: Person | null
  application: { id: number; application_no: string | null; status: string; amount: number; car: string | null } | null
  created_at: string
}

export type ReportRow = Pick<Figures, "created" | "submitted" | "decided" | "approved" | "approved_amount" | "rejected" | "returned"> & {
  key: Exclude<PeriodKey, "quarter" | "range">
  label: string
}

export type QueueItem = {
  id: number
  application_no: string | null
  client: string | null
  officer: Person | null
  branch_code: string | null
  amount: number
  ltv: number | null
  max_ltv: number | null
  submitted_at: string | null
}

export type MyItem = {
  id: number
  application_no: string | null
  status: string
  client: string | null
  car: string | null
  amount: number
  since: string | null
  reason: string | null
  missing: string[]
  has_attachments: boolean
}

export type Overview = {
  persona: Persona
  period: PeriodMeta
  trend: { series: SeriesPoint[]; totals: Figures; previous: Figures }
  queue: { count: number; yesterday: number; oldest_submitted_at: string | null; series: number[] }
  funnel: { created: number; submitted: number; decided: number; approved: number }
  statuses: { status: string; count: number; amount: number }[]
  attention: { waiting_48h: number; returned: number; old_drafts: number; without_attachments: number; over_ltv: number }
  makes: { name: string; count: number }[]
  models: { name: string; count: number }[]
  terms: { average: number | null; median: number | null; term_months: number | null; rate: number | null; down_payment_share: number | null }
  income: { type: "employee" | "entrepreneur" | "lease"; count: number }[]
  vehicle_age: { label: string; count: number }[]
  team: TeamRow[] | null
  activity: ActivityEvent[]
  report: ReportRow[]
  queue_items: QueueItem[] | null
  mine: { drafts: number; returned: number; items: MyItem[] } | null
  today: { decided: number; approved: number; decided_yesterday: number; decided_series: number[] } | null
}

export type AdminOverview = {
  users: { total: number; active: number; roles: { name: string; label: string; count: number }[] } | null
  branches: { total: number; active: number; items: { code: string; name: string; users: number; active: boolean }[] } | null
  failed_sign_ins: { count: number; accounts: { username: string | null; attempts: number; last_at: string; ip: string | null }[] } | null
  changes: { id: number; action: string; action_label: string; subject: string | null; by: { first_name: string; last_name: string } | null; created_at: string }[] | null
}

// ?view= debug states; "data" is the normal page.
export type DashboardView = "data" | "loading" | "empty" | "error"

export type DashboardQuery = { period: PeriodKey; from: string; to: string }
