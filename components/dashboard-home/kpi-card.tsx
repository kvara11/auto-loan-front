import type { ReactNode } from "react"

import { Badge } from "@/components/ui/badge"

type KpiCardProps = { label: string; value?: string | number; hint?: ReactNode; soon?: boolean }

// A figure the backend can't produce yet shows "—" and a "მალე" badge instead of an invented number.
export function KpiCard({ label, value, hint, soon = false }: KpiCardProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[14px] border bg-card p-4 shadow-sm sm:flex-col sm:items-start sm:gap-2 sm:p-5">
      <div className="flex min-w-0 flex-col gap-1 sm:gap-2">
        <span className="text-xs text-muted-foreground sm:text-[13px]">{label}</span>
        <span className="text-[22px] font-bold tabular-nums sm:text-[30px]">{soon ? "—" : value}</span>
        {hint && !soon ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
      </div>
      {soon ? <Badge variant="outline">მალე</Badge> : null}
    </div>
  )
}
