import Link from "next/link"
import { Clock } from "lucide-react"

import { AllGood, Block, Chip, type ChipTone, SkeletonRows } from "@/components/dashboard-home/block"
import { Button } from "@/components/ui/button"
import { dec, fmt, money, shortNo, shortPerson, waited } from "@/lib/dashboard/format"
import { type QueueItem } from "@/lib/dashboard/types"
import { cn } from "@/lib/utils"

// Waiting-time chip: over 48 h destructive, 24–48 h warning.
const tone = (hours: number): ChipTone => (hours > 48 ? "d" : hours >= 24 ? "w" : "m")

export function QueueBlock({ items, total, loading }: { items?: QueueItem[] | null; total: number; loading: boolean }) {
  return (
    <Block
      title="რიგი — უძველესი პირველი"
      action={<Link href="/dashboard/applications" className="inline-flex min-h-8 items-center text-[13px] font-semibold text-primary hover:underline">ყველა {fmt(total)} →</Link>}
      loading={loading}
      skeleton={<SkeletonRows count={5} className="h-9" />}
      empty={items && items.length === 0 ? <AllGood title="რიგი ცარიელია" text="ახალი განაცხადები აქ გამოჩნდება, როგორც კი ოფიცრები გამოგზავნიან." /> : null}
    >
      <div className="flex flex-col">
        <div className="hidden grid-cols-[104px_minmax(0,1.5fr)_96px_56px_118px_96px] gap-3 px-1 pb-2 text-[11px] font-bold tracking-wide text-muted-foreground uppercase md:grid">
          <span>№</span><span>კლიენტი · ოფიცერი</span><span className="text-end">თანხა</span><span className="text-end">LTV</span><span>ლოდინი</span><span />
        </div>
        {items?.map((q) => {
          const wait = waited(q.submitted_at)
          const high = q.ltv !== null && q.ltv > (q.max_ltv ?? 85)
          return (
            <div key={q.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1 border-b px-0 py-3 text-[13px] tabular-nums last:border-b-0 md:grid-cols-[104px_minmax(0,1.5fr)_96px_56px_118px_96px] md:items-center md:px-1 md:py-[11px]">
              <span className="font-bold">{shortNo(q.application_no, q.id)}</span>
              <span className="col-start-1 row-span-2 row-start-2 min-w-0 md:col-start-auto md:row-start-auto md:row-span-1">
                <span className="block font-semibold">{q.client ?? "—"}</span>
                <span className="text-[11px] text-muted-foreground">{shortPerson(q.officer)}{q.branch_code ? ` · ${q.branch_code}` : ""}</span>
              </span>
              <span className="col-start-2 row-start-2 text-end md:col-start-auto md:row-start-auto md:row-span-1">{money(q.amount)}</span>
              <span className={cn("col-start-2 row-start-3 text-end md:col-start-auto md:row-start-auto md:row-span-1", high && "font-bold text-destructive")} title={high ? "LTV ლიმიტს ზემოთ" : undefined}>
                {q.ltv === null ? "—" : `${dec(q.ltv, 0)}%`}
              </span>
              <span className="col-start-2 row-start-1 text-end md:col-start-auto md:row-start-auto md:row-span-1 md:text-start">
                <Chip tone={tone(wait.hours)}><Clock className="size-[11px]" strokeWidth={2.5} aria-hidden="true" />{wait.text}</Chip>
              </span>
              <span className="col-span-2 mt-1.5 md:col-span-1 md:mt-0 md:text-end">
                <Button asChild variant="outline" size="sm" className="h-[34px] w-full md:w-auto"><Link href={`/dashboard/applications/${q.id}`}>განხილვა</Link></Button>
              </span>
            </div>
          )
        })}
      </div>
    </Block>
  )
}
