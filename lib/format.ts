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
