// Shared formatters; render numbers with the `tabular-nums` class so columns line up.
const CURRENCY_SYMBOLS: Record<string, string> = { GEL: "₾", USD: "$", EUR: "€" }

function toNumber(value: string | number | null | undefined) {
  const parsed = typeof value === "number" ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

// 24500 + "GEL" → "24,500 ₾"; "$" goes in front.
export function formatMoney(value: string | number | null | undefined, currency = "GEL") {
  const amount = toNumber(value)
  if (amount === null) return "—"

  const text = amount.toLocaleString("en-US", { maximumFractionDigits: 2 })
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency

  return symbol === "$" ? `$${text}` : `${text} ${symbol}`
}

// ISO date/time → "08.10.2026"; invalid input → "—" instead of throwing.
export function formatDate(value: string | null | undefined) {
  if (!value) return "—"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"

  const pad = (part: number) => String(part).padStart(2, "0")
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`
}

export function formatNumber(value: string | number | null | undefined) {
  const parsed = toNumber(value)
  return parsed === null ? "—" : parsed.toLocaleString("en-US")
}

// ISO date/time → "08.10.2026, 09:05".
export function formatDateTime(value: string | null | undefined) {
  const day = formatDate(value)
  if (day === "—" || !value) return day

  const date = new Date(value)
  const pad = (part: number) => String(part).padStart(2, "0")
  return `${day}, ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

// Lists open on the last `days` days, today included: { start_date, end_date } as local "YYYY-MM-DD"
// (toISOString would shift the date to UTC).
export const RECENT_DAYS = 7

export function recentDateRange(days = RECENT_DAYS) {
  const iso = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
  const today = new Date()
  const start = new Date(today)
  start.setDate(today.getDate() - (days - 1))

  return { start_date: iso(start), end_date: iso(today) }
}
