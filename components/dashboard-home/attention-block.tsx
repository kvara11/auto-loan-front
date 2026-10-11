import Link from "next/link"
import { AlertTriangle, ChevronRight, Clock } from "lucide-react"

import { AllGood, Block, SkeletonRows } from "@/components/dashboard-home/block"
import { type Overview, type Persona } from "@/lib/dashboard/types"
import { cn } from "@/lib/utils"

type Key = keyof Overview["attention"]

// Which counts each role sees; "d" = past a deadline (clock), "w" = needs attention (triangle).
const ITEMS: Record<Persona, [Key, "d" | "w", string][]> = {
  manager: [["waiting_48h", "d", "რისკებში 48 სთ-ზე მეტი"], ["returned", "w", "დაბრუნებული, ხელახლა არ გაგზავნილი"], ["old_drafts", "w", "7 დღეზე ძველი მონახაზები"], ["without_attachments", "w", "დანართის გარეშე"]],
  officer: [["waiting_48h", "d", "რისკებში 48 სთ-ზე მეტი"], ["returned", "w", "დაბრუნებული, ხელახლა არ გაგზავნილი"], ["old_drafts", "w", "7 დღეზე ძველი მონახაზები"], ["without_attachments", "w", "დანართის გარეშე"]],
  risk: [["waiting_48h", "d", "რისკებში 48 სთ-ზე მეტი"], ["over_ltv", "w", "LTV ლიმიტს ზემოთ"], ["without_attachments", "w", "დანართის გარეშე"]],
}

const TONE = {
  d: { row: "border-[color-mix(in_oklch,var(--destructive)_35%,var(--border))] bg-[color-mix(in_oklch,var(--destructive)_10%,var(--card))]", icon: "bg-[color-mix(in_oklch,var(--destructive)_18%,var(--card))] text-destructive" },
  w: { row: "border-[color-mix(in_oklch,var(--warning)_40%,var(--border))] bg-[color-mix(in_oklch,var(--warning)_14%,var(--card))]", icon: "bg-[color-mix(in_oklch,var(--warning)_30%,var(--card))] text-[color-mix(in_oklch,var(--warning)_45%,var(--foreground))]" },
}

export function AttentionBlock({ data, persona, loading }: { data?: Overview["attention"]; persona: Persona; loading: boolean }) {
  const items = data ? ITEMS[persona].filter(([key]) => data[key] > 0) : []
  const sum = items.reduce((s, [key]) => s + (data?.[key] ?? 0), 0)

  return (
    <Block
      title="ყურადღება!"
      meta={loading ? null : sum ? `${sum} საქმე მოითხოვს რეაგირებას` : "ახლა არაფერი"}
      loading={loading}
      skeleton={<SkeletonRows count={3} className="h-[52px]" />}
      empty={items.length === 0 ? <AllGood title="ყველაფერი რიგზეა ✓" text="ვადაგადაცილებული ან გაჭედილი განაცხადები არ არის." /> : null}
    >
      <div className="flex flex-col gap-2">
        {items.map(([key, tone, label]) => (
          <Link key={key} href="/dashboard/applications" className={cn("flex min-h-[52px] items-center gap-3 rounded-lg border px-3 py-2.5 hover:brightness-[.98]", TONE[tone].row)}>
            <span className={cn("flex size-[30px] flex-none items-center justify-center rounded-lg", TONE[tone].icon)} aria-hidden="true">
              {tone === "d" ? <Clock className="size-4" strokeWidth={2.2} /> : <AlertTriangle className="size-4" strokeWidth={2.2} />}
            </span>
            <span className="flex-1 text-[13px] leading-snug font-semibold">{label}</span>
            <span className="text-xl font-bold tabular-nums">{data?.[key]}</span>
            <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </Block>
  )
}
