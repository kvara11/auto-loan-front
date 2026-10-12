import Link from "next/link"
import { AlertTriangle, ChevronRight, Clock } from "lucide-react"

import { AllGood, Block, SkeletonRows } from "@/components/dashboard-home/block"
import { ATTENTION, ATTENTION_TONE, attentionHref, type AttentionKey } from "@/lib/application-attention"
import { type Overview, type Persona } from "@/lib/dashboard/types"
import { cn } from "@/lib/utils"

// Which categories each role sees (labels and tones: lib/application-attention.ts). Each item opens the
// applications list filtered to exactly those applications (?attention=<key>).
const ITEMS: Record<Persona, AttentionKey[]> = {
  manager: ["waiting_48h", "returned", "old_drafts", "without_attachments"],
  officer: ["waiting_48h", "returned", "old_drafts", "without_attachments"],
  risk: ["waiting_48h", "over_ltv", "without_attachments"],
}

export function AttentionBlock({ data, persona, loading }: { data?: Overview["attention"]; persona: Persona; loading: boolean }) {
  const items = data ? ITEMS[persona].filter((key) => data[key] > 0) : []
  const sum = items.reduce((s, key) => s + (data?.[key] ?? 0), 0)

  return (
    <Block
      title="ყურადღება!"
      meta={loading ? null : sum ? `${sum} საქმე მოითხოვს რეაგირებას` : "ახლა არაფერი"}
      loading={loading}
      skeleton={<SkeletonRows count={3} className="h-[52px]" />}
      empty={items.length === 0 ? <AllGood title="ყველაფერი რიგზეა ✓" text="ვადაგადაცილებული ან გაჭედილი განაცხადები არ არის." /> : null}
    >
      <div className="flex flex-col gap-2">
        {items.map((key) => {
          const { label, tone } = ATTENTION[key]
          return (
            <Link key={key} href={attentionHref(key)} className={cn("flex min-h-[52px] items-center gap-3 rounded-lg border px-3 py-2.5 hover:brightness-[.98]", ATTENTION_TONE[tone].row)}>
              <span className={cn("flex size-[30px] flex-none items-center justify-center rounded-lg", ATTENTION_TONE[tone].icon)} aria-hidden="true">
                {tone === "d" ? <Clock className="size-4" strokeWidth={2.2} /> : <AlertTriangle className="size-4" strokeWidth={2.2} />}
              </span>
              <span className="flex-1 text-[13px] leading-snug font-semibold">{label}</span>
              <span className="text-xl font-bold tabular-nums">{data?.[key]}</span>
              <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
            </Link>
          )
        })}
      </div>
    </Block>
  )
}
