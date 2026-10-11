import { AlertTriangle } from "lucide-react"

import { Block, Chip, Empty, MiniBar, SkeletonRows } from "@/components/dashboard-home/block"
import { UserAvatar } from "@/components/dashboard/user-avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { fmt, percent } from "@/lib/dashboard/format"
import { type TeamRow } from "@/lib/dashboard/types"
import { cn } from "@/lib/utils"

const RETURN_LIMIT = 15

function Rank({ n }: { n: number }) {
  return (
    <span className={cn("inline-flex size-[22px] items-center justify-center rounded-md text-[11px] font-bold tabular-nums",
      n <= 3 ? "bg-[color-mix(in_oklch,var(--accent)_35%,var(--card))] text-accent-foreground" : "bg-muted text-muted-foreground")}>
      {n}
    </span>
  )
}

const rate = (part: number, whole: number) => {
  const p = percent(part, whole)
  return p === null ? "—" : `${Math.round(p)}%`
}

// A return rate above 15% gets a warning chip (icon + text, not colour alone).
function ReturnChip({ row }: { row: TeamRow }) {
  const p = percent(row.returned, row.decided)
  if (p === null) return <Chip tone="m">—</Chip>
  return p > RETURN_LIMIT
    ? <Chip tone="w"><AlertTriangle className="size-3" aria-hidden="true" />{Math.round(p)}% · მაღალი</Chip>
    : <Chip tone="m">{Math.round(p)}%</Chip>
}

export function TeamBlock({ rows, periodLabel, loading }: { rows?: TeamRow[] | null; periodLabel?: string; loading: boolean }) {
  const top = rows?.[0]?.amount || 1

  return (
    <Block
      title="გუნდი — ოფიცრების რეიტინგი"
      meta={periodLabel ? `${periodLabel} · დალაგებულია თანხით` : null}
      loading={loading}
      skeleton={<SkeletonRows count={5} className="h-[34px]" />}
      empty={rows && rows.length === 0 ? <Empty title="გუნდის აქტივობა ჯერ არ არის" text="რეიტინგი გამოჩნდება ოფიცრების პირველი განაცხადების შემდეგ." /> : null}
    >
      <div className="hidden md:block">
        <Table className="[&_td]:px-2.5 [&_th]:px-2.5">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>#</TableHead><TableHead>ოფიცერი</TableHead><TableHead className="text-right">განაცხადები</TableHead>
              <TableHead className="text-right">თანხა, ₾</TableHead><TableHead className="text-right">დამტკიცება</TableHead><TableHead className="text-right">დაბრუნება</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows?.map((row, i) => (
              <TableRow key={row.officer.id}>
                <TableCell><Rank n={i + 1} /></TableCell>
                <TableCell>
                  <span className="flex min-w-0 items-center gap-2.5">
                    <UserAvatar user={row.officer} className="size-[30px]" fallbackClassName="text-[11px]" />
                    <span className="font-semibold">{row.officer.first_name} {row.officer.last_name}</span>
                  </span>
                </TableCell>
                <TableCell className="text-right tabular-nums">{fmt(row.applications)}</TableCell>
                <TableCell className="text-right tabular-nums">
                  <span className="flex flex-col items-end gap-1">{fmt(row.amount)}<MiniBar value={(row.amount / top) * 100} className="w-20" /></span>
                </TableCell>
                <TableCell className="text-right tabular-nums">{rate(row.approved, row.decided)}</TableCell>
                <TableCell className="text-right"><ReturnChip row={row} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col md:hidden">
        {rows?.map((row, i) => (
          <div key={row.officer.id} className="flex flex-col gap-1.5 border-b py-3 last:border-b-0">
            <div className="flex items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-2.5"><Rank n={i + 1} /><UserAvatar user={row.officer} className="size-[30px]" fallbackClassName="text-[11px]" />
                <b className="truncate text-[13px]">{row.officer.first_name} {row.officer.last_name}</b></span>
              <b className="tabular-nums">{fmt(row.amount)} ₾</b>
            </div>
            <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-xs text-muted-foreground tabular-nums">
              <span>განაცხადები <b className="text-foreground">{fmt(row.applications)}</b></span>
              <span>დამტკიცება <b className="text-foreground">{rate(row.approved, row.decided)}</b></span>
              <span className="inline-flex items-center gap-1">დაბრუნება <ReturnChip row={row} /></span>
            </div>
          </div>
        ))}
      </div>
    </Block>
  )
}
