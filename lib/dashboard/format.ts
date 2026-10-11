import { type Person } from "@/lib/dashboard/types"

// Number and text helpers for the dashboard; render the results with `tabular-nums`.

export const fmt = (n: number) => Math.round(n).toLocaleString("en-US")

export const money = (n: number) => `${fmt(n)} ₾`

// 4.14 → "4.14", 18.0 → "18"
export const dec = (n: number, digits = 1) => {
  const text = n.toFixed(digits)
  return text.includes(".") ? text.replace(/\.?0+$/, "") : text
}

// 4,140,000 → "4.14 მლნ ₾", 312,000 → "312 ათ. ₾", 9,800 → "9,800 ₾"
export function compactMoney(n: number) {
  if (n >= 1e6) return `${dec(n / 1e6, 2)} მლნ ₾`
  if (n >= 1e4) return `${fmt(n / 1e3)} ათ. ₾`
  return money(n)
}

// Axis ticks: 1,200,000 → "1.2 მლნ", 45,000 → "45 ათ." (a no-break space: Recharts wraps tick text at spaces).
export function axisNumber(n: number) {
  if (n >= 1e6) return `${dec(n / 1e6)}\u00A0მლნ`
  if (n >= 1e3) return `${fmt(n / 1e3)}\u00A0ათ.`
  return fmt(n)
}

export const percent = (part: number, whole: number) => (whole > 0 ? (part / whole) * 100 : null)

// Hours → "18.6 სთ"; a week or more → "8.2 დღე".
export const hours = (h: number) => (h >= 168 ? `${dec(h / 24)} დღე` : `${dec(h)} სთ`)

const pad = (n: number) => String(n).padStart(2, "0")

// "4 წთ წინ", "3 სთ წინ", "დღეს 10:14", "გუშინ 18:22", "08.10 17:48"
export function relativeTime(iso: string, now = new Date()) {
  const date = new Date(iso)
  const minutes = Math.floor((now.getTime() - date.getTime()) / 60000)
  if (minutes < 1) return "ახლახან"
  if (minutes < 60) return `${minutes} წთ წინ`
  if (minutes < 240) return `${Math.floor(minutes / 60)} სთ წინ`
  const time = `${pad(date.getHours())}:${pad(date.getMinutes())}`
  const days = Math.round((new Date(now).setHours(0, 0, 0, 0) - new Date(date).setHours(0, 0, 0, 0)) / 86400000)
  if (days === 0) return `დღეს ${time}`
  if (days === 1) return `გუშინ ${time}`
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)} ${time}`
}

// How long since: "12 წთ", "6 სთ", "2 დღე 6 სთ", "9 დღე".
export function waited(iso: string | null, now = new Date()) {
  if (!iso) return { text: "—", hours: 0 }
  const totalHours = (now.getTime() - new Date(iso).getTime()) / 3600000
  if (totalHours < 1) return { text: `${Math.max(1, Math.floor(totalHours * 60))} წთ`, hours: totalHours }
  if (totalHours < 48) return { text: `${Math.floor(totalHours)} სთ`, hours: totalHours }
  const days = Math.floor(totalHours / 24)
  const rest = Math.floor(totalHours % 24)
  return { text: days < 7 && rest ? `${days} დღე ${rest} სთ` : `${days} დღე`, hours: totalHours }
}

export const initials = (p: Pick<Person, "first_name" | "last_name"> | null) =>
  p ? `${p.first_name.charAt(0)}${p.last_name.charAt(0)}` : "?"

const GEORGIAN = /[ა-ჿ]$/

// "ნ. ბერიძემ", "ე. გელაშვილმა" — the ergative case the activity sentences need ("X-მა დაამტკიცა").
export function ergative(p: Pick<Person, "first_name" | "last_name">) {
  const last = p.last_name.trim()
  let erg = last
  if (GEORGIAN.test(last)) {
    if (last.endsWith("ი")) erg = `${last.slice(0, -1)}მა`
    else if (/[აეოუ]$/.test(last)) erg = `${last}მ`
    else erg = `${last}მა`
  }
  return `${p.first_name.charAt(0)}. ${erg}`
}

export const shortPerson = (p: Pick<Person, "first_name" | "last_name"> | null) => (p ? `${p.first_name.charAt(0)}. ${p.last_name}` : "—")

// "001-6ACB538199FE4" → "001-6ACB…"
export const shortNo = (no: string | null, id: number) => (no ? (no.length > 9 ? `${no.slice(0, 8)}…` : no) : `#${id}`)
