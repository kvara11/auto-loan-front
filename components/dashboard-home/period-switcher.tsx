"use client"

import { CalendarDays } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PERIODS } from "@/lib/dashboard/periods"
import { type DashboardQuery, type PeriodKey } from "@/lib/dashboard/types"

const dm = (iso: string) => `${iso.slice(8, 10)}.${iso.slice(5, 7)}`

// Tabs on desktop, a Select on phones; "შუალედი" adds two date fields. The value lives in the URL.
export function PeriodSwitcher({ query, onChange }: { query: DashboardQuery; onChange: (q: DashboardQuery) => void }) {
  const pick = (period: string) => onChange({ period: period as PeriodKey, from: "", to: "" })
  const today = new Date().toISOString().slice(0, 10)

  return (
    <div className="flex w-full flex-wrap items-center gap-2.5 md:w-auto">
      <Tabs value={query.period} onValueChange={pick} className="hidden md:flex">
        <TabsList className="h-10 bg-muted" aria-label="პერიოდი">
          {PERIODS.map((p) => (
            <TabsTrigger key={p.key} value={p.key} className="h-[34px] px-3 text-[13px] font-semibold">{p.label}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="w-full md:hidden">
        <Select value={query.period} onValueChange={pick}>
          <SelectTrigger className="h-11 w-full text-sm font-semibold" aria-label="პერიოდი"><SelectValue /></SelectTrigger>
          <SelectContent>
            {PERIODS.map((p) => (
              <SelectItem key={p.key} value={p.key}>
                {p.key === "range" && query.period === "range" ? `შუალედი · ${dm(query.from)} – ${dm(query.to)}` : p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {query.period === "range" ? (
        <div className="flex w-full items-center gap-2 md:w-auto">
          <CalendarDays className="hidden size-4 text-muted-foreground md:block" aria-hidden="true" />
          <Input type="date" aria-label="შუალედის დასაწყისი" className="h-10 min-w-0 flex-1 tabular-nums md:w-38 md:flex-none" value={query.from} max={query.to}
            onChange={(e) => e.target.value && onChange({ ...query, from: e.target.value })} />
          <span className="text-muted-foreground" aria-hidden="true">–</span>
          <Input type="date" aria-label="შუალედის დასასრული" className="h-10 min-w-0 flex-1 tabular-nums md:w-38 md:flex-none" value={query.to} min={query.from} max={today}
            onChange={(e) => e.target.value && onChange({ ...query, to: e.target.value })} />
        </div>
      ) : null}
    </div>
  )
}
