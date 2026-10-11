import { type CSSProperties } from "react"
import { ChevronRight } from "lucide-react"

import { Block, Empty } from "@/components/dashboard-home/block"
import { Skeleton } from "@/components/ui/skeleton"
import { dec, fmt } from "@/lib/dashboard/format"
import { type Overview } from "@/lib/dashboard/types"

const STEPS: [keyof Overview["funnel"], string][] = [["created", "შექმნილი"], ["submitted", "გაგზავნილი"], ["decided", "გადაწყვეტილი"], ["approved", "დამტკიცებული"]]

const share = (part: number, whole: number) => (whole ? `${dec((part / whole) * 100)}%` : "—")

// One hue (--primary): size, not identity. Horizontal bars on phones.
export function FunnelBlock({ data, periodLabel, loading }: { data?: Overview["funnel"]; periodLabel?: string; loading: boolean }) {
  return (
    <Block
      title="კონვერსიის ძაბრი"
      meta={periodLabel ? `${periodLabel} · % შენარჩუნებული ყოველ ეტაპზე` : null}
      loading={loading}
      skeleton={<div className="flex gap-3">{STEPS.map(([key]) => <Skeleton key={key} className="h-[150px] flex-1" />)}</div>}
      empty={data && data.created === 0 ? <Empty title="ამ პერიოდში განაცხადები არ არის" text="ძაბრი გამოჩნდება პირველივე განაცხადის შემდეგ." /> : null}
    >
      {data ? (
        <div className="flex flex-col gap-3 md:flex-row md:items-stretch md:gap-1.5">
          {STEPS.map(([key, label], i) => {
            const height = (data[key] / data.created) * 100
            return (
              <div key={key} className="contents">
                {i > 0 ? <ChevronRight className="hidden size-[18px] flex-none self-center text-muted-foreground md:mt-10 md:block" aria-hidden="true" /> : null}
                <div className="grid min-w-0 flex-1 grid-cols-[110px_minmax(0,1fr)] gap-x-3 gap-y-0.5 md:flex md:flex-col md:gap-1.5">
                  <span className="text-xs font-semibold text-muted-foreground">{label}</span>
                  <span className="text-lg font-bold tabular-nums md:text-[22px]">{fmt(data[key])}</span>
                  <div className="col-start-2 row-span-3 row-start-1 flex overflow-hidden rounded-lg bg-muted md:h-24 md:items-end">
                    <i className="block w-[var(--w)] rounded-l-md bg-primary md:h-[var(--w)] md:w-full md:rounded-t-md md:rounded-bl-none"
                      style={{ "--w": `${height}%`, opacity: 1 - i * 0.14 } as CSSProperties} />
                  </div>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    <b className="text-foreground">{i === 0 ? "100%" : share(data[key], data[STEPS[i - 1][0]])}</b> {i === 0 ? "საწყისი" : "წინასგან"}
                    {i > 0 ? ` · ${share(data[key], data.created)} საწყისიდან` : ""}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      ) : null}
    </Block>
  )
}
