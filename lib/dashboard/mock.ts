import { type MockPersona, previous, series, total } from "@/lib/dashboard/mock-series"
import { periodLabel, REPORT_LABELS } from "@/lib/dashboard/periods"
import { type ActivityEvent, type AdminOverview, type DashboardQuery, type Overview, type Person, type ReportRow } from "@/lib/dashboard/types"

// The mock data source: same shapes as the API, consistent numbers (see mock-series.ts).
// Used only with ?mock=1 or a ?view= debug state, so the real page never shows invented figures.

const ago = (minutes: number) => new Date(Date.now() - minutes * 60000).toISOString()
const person = (id: number, first: string, last: string): Person => ({ id, first_name: first, last_name: last, avatar_url: null })

const OFFICERS: [Person, number, number, number][] = [
  [person(11, "ეკა", "გელაშვილი"), 0.24, 0.74, 0.08], [person(12, "სანდრო", "ჯაფარიძე"), 0.2, 0.69, 0.12],
  [person(13, "ლიკა", "ცინცაძე"), 0.18, 0.77, 0.06], [person(14, "გიორგი", "ბექაური"), 0.15, 0.61, 0.19],
  [person(15, "თეა", "მესხი"), 0.13, 0.72, 0.09], [person(16, "დათო", "ხუციშვილი"), 0.1, 0.66, 0.16],
]
const RISK = person(21, "ნიკა", "ბერიძე")
const RISK2 = person(22, "თამარ", "ხარაზიშვილი")
const ME = OFFICERS[0][0]

type Ev = [Person, string, string | null, string, string, number, string | null, string | null, number]
// actor, action, from status, to status, application no, amount, car, comment, minutes ago
const EVENTS: Ev[] = [
  [RISK, "approve", "Submitted to Risks", "Approved", "001-6ACB538199FE4", 18400, "Toyota Prius", null, 4],
  [ME, "submit", "Draft", "Submitted to Risks", "001-7F21A0B4C9D11", 24500, null, null, 12],
  [RISK2, "return", "Submitted to Risks", "Returned", "001-5D09E3F2A7B40", 41000, null, "შემოსავლის ცნობა აკლია", 38],
  [OFFICERS[1][0], "created", null, "Draft", "001-8B3E61C0D2F95", 15400, "Hyundai Elantra", null, 64],
  [RISK, "reject", "Submitted to Risks", "Rejected", "001-4C77B9A1E0D23", 33000, null, "LTV 96%", 70],
  [OFFICERS[2][0], "submit", "Draft", "Submitted to Risks", "001-8A10F4D7C3E62", 31000, null, null, 130],
  [RISK2, "approve", "Submitted to Risks", "Approved", "001-6F42C8E5B1A07", 22700, "Subaru Forester", null, 190],
  [OFFICERS[3][0], "submit", "Returned", "Submitted to Risks", "001-5D02A6B3E9C14", 19800, null, null, 300],
  [ME, "created", null, "Draft", "001-9C05D1E8F7A36", 15400, "Hyundai Tucson", null, 360],
  [RISK, "approve", "Submitted to Risks", "Approved", "001-3E88B2C4D6F50", 39900, "Lexus RX", null, 1300],
]

function activity(persona: MockPersona): ActivityEvent[] {
  const mine = (e: Ev) => e[0].id === ME.id || ["approve", "reject", "return"].includes(e[1])
  return EVENTS.filter((e) => persona !== "officer" || mine(e)).map((e, i) => ({
    id: i + 1, action: e[1], from_status: e[2], to_status: e[3], comment: e[7], actor: e[0],
    application: { id: 100 + i, application_no: e[4], status: e[3], amount: e[5], car: e[6] },
    created_at: ago(e[8]),
  }))
}

const QUEUE: [string, string, Person, string, number, number, number][] = [
  ["001-2A17", "ზურაბ კაპანაძე", OFFICERS[3][0], "micro-02", 28600, 88, 74], ["001-2C40", "ნათია გოგია", ME, "micro-01", 16200, 71, 54],
  ["001-3B05", "ირაკლი ლომიძე", OFFICERS[1][0], "micro-01", 9800, 54, 50], ["001-3B19", "თამუნა ბერიძე", OFFICERS[2][0], "micro-03", 34500, 91, 49],
  ["001-4A26", "გიორგი ნოზაძე", OFFICERS[4][0], "micro-02", 21300, 79, 31], ["001-4C02", "ელენე ქავთარაძე", ME, "micro-01", 18900, 66, 26],
  ["001-6B08", "ბექა ჯავახიშვილი", OFFICERS[5][0], "micro-03", 26700, 83, 6], ["001-7F21", "ნინო მაისურაძე", ME, "micro-01", 24500, 91, 0.2],
]

const MINE: [string, string, string, number, string, number, string | null, string[], boolean][] = [
  ["001-5D09", "ლევან აბაშიძე", "VW Tiguan 2017", 41000, "Returned", 38, "შემოსავლის ცნობა აკლია", [], true],
  ["001-3F70", "მაკა ჩხეიძე", "Kia Sportage 2019", 22800, "Returned", 2880, "LTV 89% — შეამცირეთ თანხა ან დაამატეთ თავდები", [], true],
  ["001-4B12", "დათო ხუციშვილი", "Toyota RAV4 2016", 32000, "Draft", 12960, null, [], true],
  ["001-6E31", "გიორგი ნოზაძე", "Toyota Prius 2015", 11900, "Draft", 4320, null, [], false],
  ["001-9C05", "ანი წერეთელი", "Hyundai Tucson 2018", 15400, "Draft", 90, null, ["car_year", "market_value"], false],
]

export function mockOverview(query: DashboardQuery, persona: MockPersona, empty: boolean): Overview {
  const points = series(query.period, persona, empty, query.from, query.to)
  const totals = total(points)
  const c = totals.created
  const share = (list: [string, number][]) => (empty ? [] : list.map(([name, s]) => ({ name, count: Math.round(c * s) })))
  const report: ReportRow[] = (["today", "7d", "30d", "month", "year"] as const).map((key) => {
    const t = total(series(key, persona, empty))
    return { key, label: REPORT_LABELS[key], created: t.created, submitted: t.submitted, decided: t.decided, approved: t.approved,
      approved_amount: t.approved_amount, rejected: t.rejected, returned: t.returned }
  })
  const q = empty ? 0 : { manager: 9, officer: 3, risk: 23 }[persona]
  const today = total(series("today", persona, empty))

  return {
    persona,
    period: { key: query.period, label: periodLabel(query), unit: "day", from: query.from, to: query.to, previous_from: "", previous_to: "" },
    trend: { series: points, totals, previous: previous(totals, query.period, persona) },
    queue: { count: q, yesterday: Math.max(0, q - 2), oldest_submitted_at: q ? ago(3 * 1440 + 60) : null,
      series: [12, 11, 13, 10, 9, 11, 10, 8, 9, 10, 9, 8].map((x) => Math.round((x * q) / 9)) },
    funnel: { created: c, submitted: totals.submitted, decided: totals.decided, approved: totals.approved },
    statuses: [
      { status: "Draft", count: c - totals.submitted, amount: (c - totals.submitted) * 21800 },
      { status: "Submitted to Risks", count: totals.submitted - totals.decided, amount: (totals.submitted - totals.decided) * 22400 },
      { status: "Approved", count: totals.approved, amount: totals.approved_amount },
      { status: "Returned", count: totals.returned, amount: totals.returned * 20700 },
      { status: "Rejected", count: totals.rejected, amount: totals.rejected * 23900 },
    ],
    attention: empty ? { waiting_48h: 0, returned: 0, old_drafts: 0, without_attachments: 0, over_ltv: 0 }
      : { manager: { waiting_48h: 4, returned: 6, old_drafts: 9, without_attachments: 3, over_ltv: 2 },
        officer: { waiting_48h: 1, returned: 2, old_drafts: 1, without_attachments: 1, over_ltv: 0 },
        risk: { waiting_48h: 4, returned: 0, old_drafts: 0, without_attachments: 3, over_ltv: 5 } }[persona],
    makes: share([["Toyota", 0.31], ["Hyundai", 0.17], ["Mercedes-Benz", 0.12], ["Subaru", 0.09], ["Lexus", 0.07], ["Ford", 0.06]]),
    models: share([["Toyota Prius", 0.14], ["Toyota Camry", 0.09], ["Hyundai Elantra", 0.08], ["Mercedes-Benz E-Class", 0.06], ["Subaru Forester", 0.05], ["Hyundai Sonata", 0.05]]),
    terms: empty ? { average: null, median: null, term_months: null, rate: null, down_payment_share: null }
      : { average: Math.round(totals.requested / c / 100) * 100, median: Math.round((totals.requested / c) * 0.86 / 100) * 100, term_months: 36, rate: 16.9, down_payment_share: 22.4 },
    income: (["employee", "entrepreneur", "lease"] as const).map((type, i) => ({ type, count: Math.round(c * [0.58, 0.27, 0.15][i]) })),
    vehicle_age: [["0–3 წ.", 0.09], ["4–7 წ.", 0.24], ["8–12 წ.", 0.38], ["13–17 წ.", 0.21], ["18+ წ.", 0.08]].map(([label, s]) => ({ label: label as string, count: Math.round(c * (s as number)) })),
    team: persona !== "manager" || empty ? (persona === "manager" ? [] : null) : OFFICERS.map(([officer, s, rate, ret]) => {
      const decided = Math.round(totals.decided * s)
      return { officer, applications: Math.round(c * s), amount: Math.round((totals.requested * s) / 100) * 100, decided,
        approved: Math.round(decided * rate), returned: Math.round(decided * ret) }
    }),
    activity: empty ? [] : activity(persona),
    report,
    queue_items: persona !== "risk" ? null : empty ? [] : QUEUE.map(([no, client, officer, branch, amount, ltv, waitedHours], i) => ({
      id: 200 + i, application_no: no, client, officer, branch_code: branch, amount, ltv, max_ltv: 85, submitted_at: ago(waitedHours * 60),
    })),
    mine: persona !== "officer" ? null : empty ? { drafts: 0, returned: 0, items: [] } : {
      drafts: 3, returned: 2,
      items: MINE.map(([no, client, car, amount, status, minutes, reason, missing, files], i) => ({
        id: 300 + i, application_no: no, status, client, car, amount, since: ago(minutes), reason, missing, has_attachments: files,
      })),
    },
    today: persona !== "risk" ? null : { decided: today.decided, approved: today.approved, decided_yesterday: Math.round(today.decided * 0.9),
      decided_series: series("7d", persona, empty).map((p) => p.decided) },
  }
}

export function mockAdmin(empty: boolean): AdminOverview {
  return {
    users: empty ? { total: 1, active: 1, roles: [{ name: "administrator", label: "ადმინისტრატორი", count: 1 }] } : {
      total: 42, active: 38,
      roles: [["credit-officer", "საკრედიტო ოფიცერი", 24], ["branch-manager", "ფილიალის მენეჯერი", 6], ["risk-manager", "რისკების მენეჯერი", 5],
        ["auditor", "აუდიტორი", 3], ["administrator", "ადმინისტრატორი", 4]].map(([name, label, count]) => ({ name: name as string, label: label as string, count: count as number })),
    },
    branches: empty ? { total: 0, active: 0, items: [] } : { total: 7, active: 6, items: [
      { code: "micro-01", name: "ვაკე", users: 11, active: true }, { code: "micro-02", name: "საბურთალო", users: 8, active: true },
      { code: "micro-03", name: "ქუთაისი", users: 7, active: true }, { code: "micro-00", name: "ბათუმი", users: 0, active: false }] },
    failed_sign_ins: empty ? { count: 0, accounts: [] } : { count: 5, accounts: [
      { username: "g.bekauri", attempts: 3, last_at: ago(95), ip: "85.114.•••.12" }, { username: "admin1", attempts: 1, last_at: ago(480), ip: "185.70.•••.4" },
      { username: "m.lomaia", attempts: 1, last_at: ago(190), ip: "85.114.•••.40" }] },
    changes: empty ? [] : [
      ["user_created", "მომხმარებელი შეიქმნა", "s.japaridze", 30], ["user_role_changed", "მომხმარებლის როლი შეიცვალა", "m.lomaia", 72],
      ["branch_updated", "ფილიალი შეიცვალა", "micro-00 · ბათუმი", 1100], ["user_updated", "მომხმარებელი შეიცვალა", "l.tsintsadze", 2000],
      ["user_password_reset", "პაროლი აღადგინა ადმინისტრატორმა", "t.meskhi", 2200], ["user_deactivated", "მომხმარებელი დაიბლოკა", "d.kakhidze", 3800],
    ].map(([action, label, subject, minutes], i) => ({ id: i + 1, action: action as string, action_label: label as string, subject: subject as string,
      by: { first_name: "დავით", last_name: "ჩიქოვანი" }, created_at: ago(minutes as number) })),
  }
}
