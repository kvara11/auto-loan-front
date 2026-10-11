import { KpiCard } from "@/components/dashboard-home/kpi-card"
import { Soon } from "@/components/dashboard-home/block"
import { type Kpi } from "@/lib/dashboard/kpis"
import { cn } from "@/lib/utils"

// 7 cards in a row on desktop, 4 from ~768px, 2 on phones; the risk view's 4 cards sit 2×2 beside the queue.
export function KpiGrid({ kpis, loading, compact }: { kpis: Kpi[]; loading?: boolean; compact?: boolean }) {
  return (
    <div className={cn("grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-4", compact ? "xl:grid-cols-2" : "xl:grid-cols-7")}>
      {kpis.map((kpi) => <KpiCard key={kpi.key} kpi={kpi} loading={loading} />)}
    </div>
  )
}

const FUTURE = ["აქტიური პორტფელი", "PAR 30", "ვადაგადაცილება"]

// Portfolio metrics arrive with the disbursement module: a faded placeholder row, never numbers.
export function PortfolioRow() {
  return (
    <div className="grid grid-cols-3 items-stretch gap-3 opacity-60 md:grid-cols-[auto_repeat(3,minmax(0,1fr))]" aria-label="პორტფელის მაჩვენებლები — მალე">
      <div className="col-span-3 flex items-center gap-2 text-xs font-bold text-muted-foreground md:col-span-1 md:flex-col md:items-start md:justify-center md:gap-1">
        <span>პორტფელი</span>
        <Soon />
      </div>
      {FUTURE.map((label) => (
        <div key={label} className="flex min-w-0 flex-col items-start justify-between gap-2 rounded-xl border border-dashed px-2.5 py-2.5 sm:px-3.5 sm:py-3 md:flex-row md:items-center">
          <b className="text-xs leading-snug font-semibold [overflow-wrap:anywhere] text-muted-foreground">{label}</b>
          <span className="text-[15px] font-bold text-muted-foreground sm:text-lg">—</span>
        </div>
      ))}
    </div>
  )
}
