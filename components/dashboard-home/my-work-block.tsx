import Link from "next/link"
import { FilePlus, Info, Plus } from "lucide-react"

import { Block, Chip, Empty, SkeletonRows } from "@/components/dashboard-home/block"
import { Badge, BadgeDot } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { money, shortNo, waited } from "@/lib/dashboard/format"
import { type MyItem, type Overview } from "@/lib/dashboard/types"
import { cn } from "@/lib/utils"

const VEHICLE = ["car_make_id", "car_model_id", "fuel_type_id", "transmission_id", "car_year", "market_value"]

// What to do next with a draft; a returned one shows the risk team's reason.
function note(item: MyItem, days: number) {
  if (item.status === "Returned") return `რისკები: ${item.reason || "დაბრუნებულია შესასწორებლად"}`
  if (days > 7) return "7 დღეზე ძველია — გააგზავნეთ ან გააუქმეთ"
  if (item.missing.some((f) => VEHICLE.includes(f))) return "შეავსეთ ავტომობილის მონაცემები"
  if (item.missing.length) return "შეავსეთ სესხის პირობები"
  if (!item.has_attachments) return "დანართი აკლია"
  return "მზადაა გასაგზავნად"
}

export function MyWorkBlock({ data, loading }: { data?: Overview["mine"]; loading: boolean }) {
  return (
    <Block
      title="ჩემი მონახაზები და დაბრუნებულები"
      meta={data ? (
        <span className="flex flex-wrap gap-2">
          <Badge variant="draft"><BadgeDot />{data.drafts} მონახაზი</Badge>
          <Badge variant="returned"><BadgeDot />{data.returned} დაბრუნებული</Badge>
        </span>
      ) : null}
      action={<Button asChild size="sm" className="h-[34px]"><Link href="/dashboard/applications/new"><Plus className="size-4" />ახალი განაცხადი</Link></Button>}
      loading={loading}
      skeleton={<SkeletonRows count={3} className="h-16" />}
      empty={data && data.items.length === 0 ? <Empty icon={<FilePlus strokeWidth={1.6} />} title="მონახაზები ჯერ არ გაქვთ" text="დაიწყეთ პირველი განაცხადი — კლიენტის პირადი ნომრით." /> : null}
    >
      <div className="flex flex-col gap-2">
        {data?.items.map((item) => {
          const age = waited(item.since)
          const days = age.hours / 24
          const returned = item.status === "Returned"
          return (
            <div key={item.id} className={cn("grid grid-cols-1 items-center gap-3 rounded-lg border bg-card px-3.5 py-3 sm:grid-cols-[minmax(0,1fr)_auto]",
              returned && "border-[color-mix(in_oklch,var(--status-returned)_55%,var(--border))] bg-[color-mix(in_oklch,var(--status-returned)_7%,var(--card))]")}>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5 text-[13px]">
                  <b className="text-sm">{shortNo(item.application_no, item.id)}</b>
                  <span>{item.client ?? "—"}</span>
                  <Badge variant={returned ? "returned" : "draft"}><BadgeDot />{returned ? "დაბრუნებული" : "მონახაზი"}</Badge>
                  <Chip tone={!returned && days > 7 ? "w" : "m"}>{days < 1 ? "დღეს" : `${Math.floor(days)} დღე`}</Chip>
                </div>
                <div className="mt-1 text-xs text-muted-foreground tabular-nums">{[item.car, item.amount > 0 ? money(item.amount) : null].filter(Boolean).join(" · ") || "—"}</div>
                <div className={cn("mt-1.5 flex items-center gap-1.5 text-xs", returned ? "text-[color-mix(in_oklch,var(--status-returned)_55%,var(--foreground))]" : "text-muted-foreground")}>
                  <Info className="size-[13px] flex-none" strokeWidth={2.2} aria-hidden="true" />{note(item, days)}
                </div>
              </div>
              <Button asChild size="sm" variant={returned ? "default" : "outline"} className="h-[34px] w-full sm:w-auto">
                <Link href={`/dashboard/applications/${item.id}/edit`}>{returned ? "გასწორება" : "გაგრძელება"}</Link>
              </Button>
            </div>
          )
        })}
      </div>
    </Block>
  )
}
