"use client"

import { Area, Bar, BarChart, CartesianGrid, ComposedChart, XAxis, YAxis } from "recharts"
import { BarChart3 } from "lucide-react"

import { Block, Empty } from "@/components/dashboard-home/block"
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { axisNumber, compactMoney, fmt, money } from "@/lib/dashboard/format"
import { type Overview, type SeriesPoint } from "@/lib/dashboard/types"

// Grouped bars (counts) and, below, the approved ₾ as its own small line chart: never one dual-axis chart.
// Both share the x categories and the hover (syncId), so the tooltip and the crosshair move together.
const SERIES = [
  { key: "created", label: "შექმნილი", color: "var(--chart-1)" },
  { key: "submitted", label: "გაგზავნილი", color: "var(--chart-3)" },
  { key: "decided", label: "გადაწყვეტილი", color: "var(--chart-2)" },
] as const

const config = Object.fromEntries([...SERIES.map((s) => [s.key, { label: s.label, color: s.color }]),
  ["approved_amount", { label: "დამტკიცებული", color: "var(--status-approved)" }]]) as ChartConfig

// Wide enough for "1.2 მლნ" on one line; both charts use it so their plot areas line up.
const AXIS_WIDTH = 58

type TipProps = { active?: boolean; payload?: { payload: SeriesPoint }[] }

function TrendTip({ active, payload }: TipProps) {
  const point = active ? payload?.[0]?.payload : undefined
  if (!point) return null
  const row = (color: string, label: string, value: string, line = false) => (
    <div className="flex items-center justify-between gap-3.5 tabular-nums">
      <span className="inline-flex items-center gap-1.5 text-muted-foreground"><i className={line ? "h-0.5 w-2" : "size-2 rounded-[2px]"} style={{ background: color }} />{label}</span>
      <strong>{value}</strong>
    </div>
  )
  return (
    <div className="flex min-w-[168px] flex-col gap-1.5 rounded-lg border bg-popover px-3 py-2.5 text-xs text-popover-foreground shadow-lg">
      <b className="text-[13px]">{point.label}</b>
      {SERIES.map((s) => <div key={s.key}>{row(s.color, s.label, fmt(point[s.key]))}</div>)}
      <div className="border-t pt-1.5">{row("var(--status-approved)", "დამტკიცებული", money(point.approved_amount), true)}</div>
    </div>
  )
}

export function TrendBlock({ data, loading }: { data?: Overview["trend"]; loading: boolean }) {
  const t = data?.totals
  const legend = t ? [...SERIES.map((s) => ({ ...s, value: fmt(t[s.key]) })), { key: "amt", label: "დამტკიცებული ₾", color: "var(--status-approved)", value: compactMoney(t.approved_amount) }] : []

  return (
    <Block
      title="დინამიკა"
      action={t ? (
        <div className="flex flex-wrap gap-x-[18px] gap-y-1.5 text-xs">
          {legend.map((l) => (
            <span key={l.key} className="inline-flex items-center gap-1.5 text-muted-foreground">
              <i className={l.key === "amt" ? "h-0.5 w-3.5 rounded-sm" : "size-2.5 rounded-[3px]"} style={{ background: l.color }} />
              {l.label} <b className="text-foreground tabular-nums">{l.value}</b>
            </span>
          ))}
        </div>
      ) : null}
      loading={loading}
      skeleton={<div className="flex flex-col gap-2.5"><Skeleton className="h-[220px]" /><Skeleton className="h-[90px]" /></div>}
      empty={t && t.created + t.submitted + t.decided === 0 ? <Empty icon={<BarChart3 strokeWidth={1.6} />} title="ამ პერიოდში მონაცემები არ არის" text="სცადეთ სხვა პერიოდი." /> : null}
    >
      {data ? (
        <div role="img" aria-label={`განაცხადების დინამიკა: შექმნილი ${fmt(t!.created)}, გაგზავნილი ${fmt(t!.submitted)}, გადაწყვეტილი ${fmt(t!.decided)}`}>
          <ChartContainer config={config} className="aspect-auto h-[180px] w-full sm:h-[220px]">
            <BarChart data={data.series} syncId="dashboard-trend" margin={{ top: 8, right: 0, left: 0, bottom: 0 }} barGap={2} barCategoryGap="18%">
              <CartesianGrid vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={18} tickMargin={6} />
              <YAxis width={AXIS_WIDTH} tickLine={false} axisLine={false} allowDecimals={false} tickCount={5} tickFormatter={(v: number) => fmt(v)} />
              <ChartTooltip cursor={{ fill: "var(--muted)", opacity: 0.7 }} content={<TrendTip />} />
              {SERIES.map((s) => <Bar key={s.key} dataKey={s.key} fill={s.color} radius={[3, 3, 0, 0]} maxBarSize={8} isAnimationActive={false} />)}
            </BarChart>
          </ChartContainer>
          <div className="mt-1.5 text-xs font-bold text-muted-foreground">დამტკიცებული თანხა, ₾</div>
          <ChartContainer config={config} className="aspect-auto h-20 w-full sm:h-24" aria-label="დამტკიცებული თანხის დინამიკა">
            {/* A transparent bar gives this chart the same band x-scale as the bars above, so the points line up. */}
            <ComposedChart data={data.series} syncId="dashboard-trend" margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="label" hide />
              <YAxis width={AXIS_WIDTH} tickLine={false} axisLine={false} tickCount={3} tickFormatter={(v: number) => axisNumber(v)} />
              <ChartTooltip cursor={{ stroke: "var(--muted-foreground)", strokeDasharray: "3 3" }} content={() => null} />
              <Bar dataKey="approved_amount" fill="transparent" isAnimationActive={false} />
              <Area dataKey="approved_amount" type="linear" stroke="var(--status-approved)" strokeWidth={2}
                fill="color-mix(in oklch, var(--status-approved) 14%, transparent)" dot={false}
                activeDot={{ r: 5, fill: "var(--status-approved)", stroke: "var(--card)", strokeWidth: 2 }} isAnimationActive={false} />
            </ComposedChart>
          </ChartContainer>
        </div>
      ) : null}
    </Block>
  )
}
