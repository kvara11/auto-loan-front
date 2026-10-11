"use client"

import { useState } from "react"

import { Block, Empty, MiniBar } from "@/components/dashboard-home/block"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { dec, fmt, money } from "@/lib/dashboard/format"
import { type Overview } from "@/lib/dashboard/types"

type Props = { data?: Overview; loading: boolean }

const pct = (n: number, total: number) => (total ? Math.round((n / total) * 100) : 0)

export function RankBlock({ data, loading }: Props) {
  const [tab, setTab] = useState<"make" | "model">("make")
  const list = (tab === "make" ? data?.makes : data?.models) ?? []
  const created = data?.funnel.created ?? 0
  const top = list[0]?.count || 1

  return (
    <Block
      title="ტოპ მარკები / მოდელები"
      action={
        <Tabs value={tab} onValueChange={(v) => setTab(v as "make" | "model")}>
          <TabsList className="h-9 bg-muted">
            <TabsTrigger value="make" className="h-[30px] px-3 text-xs font-semibold">მარკა</TabsTrigger>
            <TabsTrigger value="model" className="h-[30px] px-3 text-xs font-semibold">მოდელი</TabsTrigger>
          </TabsList>
        </Tabs>
      }
      loading={loading}
      skeleton={<div className="flex flex-col gap-2.5">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-3.5" />)}</div>}
      empty={data && list.length === 0 ? <Empty title="ავტომობილები ჯერ არ არის" text="რეიტინგი შეიქმნება განაცხადებიდან." /> : null}
    >
      <ol className="flex flex-col gap-2.5">
        {list.map((row, i) => (
          <li key={row.name} className="grid grid-cols-[22px_minmax(0,1fr)_46px_48px] items-center gap-2.5 text-[13px]">
            <span className="text-xs text-muted-foreground tabular-nums">{i + 1}</span>
            <span className="flex min-w-0 flex-col gap-1.5"><b className="truncate font-semibold">{row.name}</b><MiniBar value={(row.count / top) * 100} /></span>
            <span className="text-end font-bold tabular-nums">{fmt(row.count)}</span>
            <span className="text-end text-xs text-muted-foreground tabular-nums">{pct(row.count, created)}%</span>
          </li>
        ))}
      </ol>
    </Block>
  )
}

export function TermsBlock({ data, loading }: Props) {
  const t = data?.terms
  const cell = (label: string, value: string, wide = false) => (
    <div className={`flex flex-col gap-0.5 rounded-lg bg-muted px-3.5 py-3 ${wide ? "col-span-2" : ""}`}>
      <span className="text-xs text-muted-foreground">{label}</span>
      <b className="text-lg tabular-nums">{value}</b>
    </div>
  )
  const or = (v: number | null | undefined, f: (n: number) => string) => (v === null || v === undefined ? "—" : f(v))

  return (
    <Block
      title="სესხის პირობები"
      meta={data?.period.label}
      loading={loading}
      skeleton={<div className="grid grid-cols-2 gap-2.5">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-[62px]" />)}<Skeleton className="col-span-2 h-[62px]" /></div>}
      empty={t && t.average === null ? <Empty title="პირობები ჯერ არ არის" text="საშუალოები გამოითვლება პირველი განაცხადებიდან." /> : null}
    >
      {t ? (
        <div className="grid grid-cols-2 gap-2.5">
          {cell("საშუალო თანხა", or(t.average, money))}
          {cell("მედიანა", or(t.median, money))}
          {cell("საშუალო ვადა", or(t.term_months, (n) => `${Math.round(n)} თვე`))}
          {cell("საშუალო განაკვეთი", or(t.rate, (n) => `${dec(n)}%`))}
          <div className="col-span-2 flex flex-col gap-0.5 rounded-lg bg-muted px-3.5 py-3">
            <span className="text-xs text-muted-foreground">საშუალო თანამონაწილეობა (წინასწარი შენატანი)</span>
            <div className="flex items-center gap-3">
              <b className="text-lg tabular-nums">{or(t.down_payment_share, (n) => `${dec(n)}%`)}</b>
              <MiniBar value={(t.down_payment_share ?? 0) * 2} className="flex-1 bg-card" />
            </div>
          </div>
        </div>
      ) : null}
    </Block>
  )
}

const INCOME = { employee: ["დასაქმებული", "var(--chart-1)"], entrepreneur: ["მეწარმე", "var(--chart-3)"], lease: ["იჯარა", "var(--chart-2)"] } as const

export function IncomeBlock({ data, loading }: Props) {
  const rows = data?.income ?? []
  const total = rows.reduce((s, r) => s + r.count, 0)
  const aria = rows.map((r) => `${INCOME[r.type][0]} ${pct(r.count, total)}%`).join(", ")

  return (
    <Block
      title="შემოსავლის წყარო"
      meta="განაცხადების წილი"
      loading={loading}
      empty={data && total === 0 ? <Empty title="მონაცემები ჯერ არ არის" /> : null}
    >
      <div className="flex h-3.5 gap-0.5 overflow-hidden rounded-full bg-card" role="img" aria-label={aria}>
        {rows.map((r) => <i key={r.type} className="block h-full" style={{ width: `${(r.count / (total || 1)) * 100}%`, background: INCOME[r.type][1] }} />)}
      </div>
      <div className="flex flex-col gap-2">
        {rows.map((r) => (
          <div key={r.type} className="flex items-center gap-2.5 text-[13px]">
            <i className="size-2.5 flex-none rounded-[3px]" style={{ background: INCOME[r.type][1] }} />
            <span className="flex-1">{INCOME[r.type][0]}</span>
            <span className="text-xs text-muted-foreground tabular-nums">{fmt(r.count)} განაცხადი</span>
            <span className="w-11 text-end font-bold tabular-nums">{pct(r.count, total)}%</span>
          </div>
        ))}
      </div>
    </Block>
  )
}

export function AgeBlock({ data, loading }: Props) {
  const rows = data?.vehicle_age ?? []
  const total = rows.reduce((s, r) => s + r.count, 0)
  const max = Math.max(1, ...rows.map((r) => r.count))

  return (
    <Block
      title="ავტომობილის ასაკი"
      meta="წლები · წილი"
      loading={loading}
      skeleton={<div className="flex h-[150px] items-end gap-2.5">{[30, 60, 95, 55, 25].map((h) => <Skeleton key={h} className="flex-1" style={{ height: `${h}%` }} />)}</div>}
      empty={data && total === 0 ? <Empty title="მონაცემები ჯერ არ არის" /> : null}
    >
      <div className="flex h-[130px] items-end gap-1.5 pt-[18px] sm:h-[150px] sm:gap-2.5">
        {rows.map((r) => (
          <div key={r.label} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5" title={`${r.label}: ${fmt(r.count)} ავტომობილი`}>
            <span className="text-xs font-bold tabular-nums">{pct(r.count, total)}%</span>
            <i className="block w-full max-w-14 rounded-t bg-chart-1" style={{ height: `${(r.count / max) * 100}%` }} />
            <span className="text-[11px] whitespace-nowrap text-muted-foreground">{r.label}</span>
          </div>
        ))}
      </div>
    </Block>
  )
}
