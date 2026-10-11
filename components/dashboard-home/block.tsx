import { type ReactNode } from "react"
import { Check, Clock } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

// Shared pieces of the dashboard blocks (the design's .blk, .chip, .soon-b, .mini, .empty, .ok-state).

type BlockProps = {
  title: string
  meta?: ReactNode
  action?: ReactNode
  className?: string
  loading?: boolean
  skeleton?: ReactNode
  // Shown instead of the content when set (and not loading).
  empty?: ReactNode
  children?: ReactNode
}

export function Block({ title, meta, action, className, loading, skeleton, empty, children }: BlockProps) {
  return (
    <Card className={cn("@container min-w-0 gap-3.5 p-4 sm:p-5", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <h3 className="text-base font-bold">{title}</h3>
        {meta ? <span className="text-xs text-muted-foreground tabular-nums">{meta}</span> : null}
        {action}
      </div>
      {loading ? (skeleton ?? <SkeletonRows />) : empty ? empty : children}
    </Card>
  )
}

export function SkeletonRows({ count = 5, className = "h-3.5" }: { count?: number; className?: string }) {
  return (
    <div className="flex flex-col gap-2.5" aria-busy="true" aria-label="იტვირთება">
      {Array.from({ length: count }, (_, i) => <Skeleton key={i} className={className} />)}
    </div>
  )
}

export function Empty({ title, text, icon }: { title: string; text?: string; icon?: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-1.5 px-3 py-7 text-center text-[13px] text-muted-foreground">
      {icon ? <span className="opacity-80 [&_svg]:size-9">{icon}</span> : null}
      <b className="text-sm text-foreground">{title}</b>
      {text}
    </div>
  )
}

export function AllGood({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 px-3 py-7 text-center">
      <span className="flex size-11 items-center justify-center rounded-full bg-[color-mix(in_oklch,var(--success)_16%,var(--card))] text-[color-mix(in_oklch,var(--success)_85%,var(--foreground))]">
        <Check className="size-5" strokeWidth={2.4} aria-hidden="true" />
      </span>
      <b className="text-[15px]">{title}</b>
      <span className="text-xs text-muted-foreground">{text}</span>
    </div>
  )
}

export type ChipTone = "w" | "d" | "m" | "ok"

const CHIP: Record<ChipTone, string> = {
  w: "bg-[color-mix(in_oklch,var(--warning)_22%,var(--card))] text-[color-mix(in_oklch,var(--warning)_40%,var(--foreground))]",
  d: "bg-[color-mix(in_oklch,var(--destructive)_14%,var(--card))] text-destructive",
  m: "bg-muted text-muted-foreground",
  ok: "bg-[color-mix(in_oklch,var(--success)_15%,var(--card))] text-[color-mix(in_oklch,var(--success)_80%,var(--foreground))]",
}

export function Chip({ tone, children, className }: { tone: ChipTone; children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex h-[22px] items-center gap-1 rounded-full px-2 text-[11px] font-bold whitespace-nowrap tabular-nums", CHIP[tone], className)}>
      {children}
    </span>
  )
}

export function Soon({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex h-[22px] w-max items-center gap-1 rounded-full border bg-muted px-2 text-[11px] font-bold text-muted-foreground", className)}>
      <Clock className="size-[11px]" strokeWidth={2.5} aria-hidden="true" />
      მალე
    </span>
  )
}

// A thin proportional bar (single hue).
export function MiniBar({ value, className, color = "var(--chart-1)" }: { value: number; className?: string; color?: string }) {
  return (
    <span className={cn("block h-1.5 overflow-hidden rounded-full bg-muted", className)} aria-hidden="true">
      <i className="block h-full rounded-full" style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color }} />
    </span>
  )
}
