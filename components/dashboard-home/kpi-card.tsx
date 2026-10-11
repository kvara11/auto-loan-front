import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Soon } from "@/components/dashboard-home/block"
import { type Kpi, type Tone } from "@/lib/dashboard/kpis"
import { cn } from "@/lib/utils"

const TONE: Record<Tone, string> = {
  pos: "text-[color-mix(in_oklch,var(--success)_85%,var(--foreground))]",
  neg: "text-destructive",
  neu: "text-muted-foreground",
}

// The design's sparkline: a single chart-1 polyline with a dot on the last value.
function Sparkline({ values }: { values: number[] }) {
  const v = values.length > 1 ? values : [0, 0]
  const max = Math.max(...v)
  const min = Math.min(...v)
  const y = (x: number) => 25 - ((x - min) / (max - min || 1)) * 21
  const points = v.map((x, i) => `${((i / (v.length - 1)) * 100).toFixed(1)},${y(x).toFixed(1)}`).join(" ")

  return (
    <div className="relative mt-0.5 h-5 sm:h-7" aria-hidden="true">
      <svg viewBox="0 0 100 28" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible">
        <polyline points={points} fill="none" stroke="var(--chart-1)" strokeWidth={2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      <i className="absolute -mt-[3px] -ml-[3px] size-1.5 rounded-full bg-chart-1 shadow-[0_0_0_2px_var(--card)]" style={{ left: "100%", top: `${(y(v[v.length - 1]) / 28) * 100}%` }} />
    </div>
  )
}

export function KpiCard({ kpi, loading }: { kpi: Kpi; loading?: boolean }) {
  return (
    <Card
      aria-disabled={kpi.soon || undefined}
      className={cn("relative min-w-0 gap-1.5 p-3 pb-2.5 sm:p-3.5 sm:pb-3", kpi.soon && "border-dashed bg-transparent shadow-none")}
    >
      <div className="text-[11px] leading-snug font-semibold text-muted-foreground sm:min-h-8 sm:text-xs">{kpi.label}</div>
      {loading && !kpi.soon ? (
        <div className="flex flex-col gap-2" aria-busy="true">
          <Skeleton className="h-6 w-[70%]" />
          <Skeleton className="h-3 w-[45%]" />
          <Skeleton className="h-6" />
        </div>
      ) : kpi.soon ? (
        <>
          <div className="text-lg font-bold text-muted-foreground sm:text-[22px]">—</div>
          <Soon />
          <span className="text-[11px] text-muted-foreground">{kpi.sub}</span>
        </>
      ) : (
        <>
          <div className="text-lg leading-tight font-bold tracking-tight whitespace-nowrap tabular-nums sm:text-[22px]">{kpi.value}</div>
          <span className={cn("inline-flex items-center gap-1 text-xs font-bold tabular-nums", TONE[kpi.delta.tone])} title={kpi.delta.title}>
            {kpi.delta.text}
          </span>
          <span className="text-[11px] text-muted-foreground tabular-nums">{kpi.sub}</span>
          <Sparkline values={kpi.spark} />
        </>
      )}
    </Card>
  )
}
