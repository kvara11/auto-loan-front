import { type ApplicationRecord } from "@/components/applications/applications-types"
import { cn } from "@/lib/utils"

const toNumber = (value: string | number | null | undefined) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

// Semicircle from 9 o'clock (0%) to 3 o'clock (100%+); r = 64, so the arc length is π·64.
const ARC = Math.PI * 64

// Display only: the backend doesn't compute LTV yet (T-404), so this uses the same
// formula as the new-application form: requested amount / market value × 100.
export function LtvCard({ app }: { app: ApplicationRecord }) {
  const marketValue = toNumber(app.market_value)
  const ltv = marketValue > 0 ? (toNumber(app.requested_amount) / marketValue) * 100 : null
  const maxLtv = toNumber(app.max_ltv) || null
  const over = ltv !== null && maxLtv !== null && ltv > maxLtv
  const filled = ltv === null ? 0 : Math.min(ltv, 100) / 100

  return (
    <section className="flex flex-col items-center gap-3 rounded-xl border bg-card p-5 text-center shadow-sm sm:p-[22px]">
      <h2 className="self-start text-[17px] font-semibold">LTV</h2>
      <div className="relative h-[90px] w-[160px]">
        <svg viewBox="0 0 160 90" className="size-full" aria-hidden="true">
          <path d="M16 80 A64 64 0 0 1 144 80" fill="none" strokeWidth="12" strokeLinecap="round" className="stroke-muted" />
          <path
            d="M16 80 A64 64 0 0 1 144 80"
            fill="none"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${ARC * filled} ${ARC}`}
            className={cn(ltv === null ? "stroke-transparent" : over ? "stroke-destructive" : "stroke-success")}
          />
        </svg>
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
          <span className={cn("text-2xl font-bold tabular-nums", over && "text-destructive")}>
            {ltv === null ? "—" : `${Math.round(ltv)}%`}
          </span>
          <span className="text-xs text-muted-foreground">LTV</span>
        </div>
      </div>
      <p className={cn("text-[13px]", over ? "text-destructive" : "text-muted-foreground")}>
        {maxLtv === null
          ? "მაქსიმალური LTV არ არის მითითებული."
          : over
            ? `მაქსიმალური დასაშვები — ${maxLtv}%. ეს განაცხადი აჭარბებს ლიმიტს და საჭიროებს დამატებით განხილვას.`
            : `მაქსიმალური დასაშვები — ${maxLtv}%.`}
      </p>
      <p className="text-xs text-muted-foreground">მოთხოვნილი თანხა / საბაზრო ღირებულება</p>
    </section>
  )
}
