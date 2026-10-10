import { type ReactNode } from "react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type InfoItem = {
  label: string
  value?: ReactNode
  // No backend yet: shows "—" with a "მალე" badge instead of an invented value.
  soon?: boolean
  numeric?: boolean
}

export function InfoCard({ title, items }: { title: string; items: InfoItem[] }) {
  return (
    <section className="rounded-xl border bg-card p-5 shadow-sm sm:p-[22px]">
      <h2 className="mb-4 text-[17px] font-semibold">{title}</h2>
      <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <div key={item.label} className="flex min-w-0 flex-col gap-0.5">
            <dt className="text-xs text-muted-foreground">{item.label}</dt>
            <dd className={cn("text-sm font-semibold break-words", item.numeric && "tabular-nums")}>
              {item.soon ? (
                <span className="inline-flex items-center gap-2 font-normal text-muted-foreground">
                  — <Badge variant="info">მალე</Badge>
                </span>
              ) : (
                item.value || "—"
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
