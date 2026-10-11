import { Download } from "lucide-react"

import { Block, Chip, SkeletonRows, Soon } from "@/components/dashboard-home/block"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { compactMoney, dec, fmt } from "@/lib/dashboard/format"
import { REPORT_LABELS } from "@/lib/dashboard/periods"
import { type PeriodKey, type ReportRow } from "@/lib/dashboard/types"
import { cn } from "@/lib/utils"

const rate = (r: ReportRow) => (r.decided ? `${dec((r.approved / r.decided) * 100)}%` : "—")

// The standard periods side by side; the selected period's row is highlighted.
export function ReportBlock({ rows, current, loading }: { rows?: ReportRow[]; current: PeriodKey; loading: boolean }) {
  return (
    <Block
      title="ანგარიში"
      action={
        <Button variant="outline" size="sm" className="h-[34px] gap-2" disabled aria-disabled="true">
          <Download className="size-3.5" aria-hidden="true" />ექსპორტი <Soon />
        </Button>
      }
      loading={loading}
      skeleton={<SkeletonRows count={5} className="h-[30px]" />}
    >
      <div className="hidden md:block">
        <Table className="[&_td]:px-2.5 [&_th]:px-2.5">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>პერიოდი</TableHead><TableHead className="text-right">შექმნილი</TableHead><TableHead className="text-right">გაგზავნილი</TableHead>
              <TableHead className="text-right">დამტკიცებული (რაოდ. · ₾)</TableHead><TableHead className="text-right">უარყოფილი</TableHead>
              <TableHead className="text-right">დაბრუნებული</TableHead><TableHead className="text-right">დამტკიცების %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows?.map((r) => (
              <TableRow key={r.key} className={cn(r.key === current && "bg-[color-mix(in_oklch,var(--primary)_7%,var(--card))]")} aria-current={r.key === current || undefined}>
                <TableCell className="font-semibold">{REPORT_LABELS[r.key]}</TableCell>
                <TableCell className="text-right tabular-nums">{fmt(r.created)}</TableCell>
                <TableCell className="text-right tabular-nums">{fmt(r.submitted)}</TableCell>
                <TableCell className="text-right tabular-nums"><b>{fmt(r.approved)}</b> · {compactMoney(r.approved_amount)}</TableCell>
                <TableCell className="text-right tabular-nums">{fmt(r.rejected)}</TableCell>
                <TableCell className="text-right tabular-nums">{fmt(r.returned)}</TableCell>
                <TableCell className="text-right tabular-nums"><b>{rate(r)}</b></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col md:hidden">
        {rows?.map((r) => (
          <div key={r.key} className={cn("flex flex-col gap-1.5 border-b px-1 py-3 last:border-b-0", r.key === current && "rounded-md bg-[color-mix(in_oklch,var(--primary)_7%,var(--card))]")}>
            <div className="flex items-center justify-between gap-2"><b className="text-[13px]">{REPORT_LABELS[r.key]}</b><Chip tone="ok">{rate(r)}</Chip></div>
            <div className="flex flex-wrap gap-x-3.5 gap-y-1 text-xs text-muted-foreground tabular-nums">
              <span>შექმნილი <b className="text-foreground">{fmt(r.created)}</b></span>
              <span>გაგზავნილი <b className="text-foreground">{fmt(r.submitted)}</b></span>
              <span>დამტკიცებული <b className="text-foreground">{fmt(r.approved)}</b> · {compactMoney(r.approved_amount)}</span>
              <span>უარყოფილი <b className="text-foreground">{fmt(r.rejected)}</b></span>
              <span>დაბრუნებული <b className="text-foreground">{fmt(r.returned)}</b></span>
            </div>
          </div>
        ))}
      </div>
    </Block>
  )
}
