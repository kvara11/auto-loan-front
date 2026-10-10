import Link from "next/link"

import { type ApplicationRecord } from "@/components/applications/applications-types"
import { StatusBadge } from "@/components/applications/status-badge"
import { formatMoney } from "@/lib/format"

// Compact row: number + client, amount + car, status. Used by the role block and on mobile.
export function ApplicationRow({ app }: { app: ApplicationRecord }) {
  const number = app.application_no || `#${app.id}`
  const client = app.client ? `${app.client.first_name} ${app.client.last_name}` : "—"
  const car = [app.car_make, app.car_model].filter(Boolean).join(" ")

  return (
    <Link
      href={`/dashboard/applications/${app.id}`}
      className="flex items-center justify-between gap-3 rounded-[10px] border px-3 py-2.5 transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
    >
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-[13px] font-semibold">{number} · {client}</span>
        <span className="truncate text-xs text-muted-foreground tabular-nums">
          {formatMoney(app.requested_amount, app.currency)}{car ? ` · ${car}` : ""}
        </span>
      </span>
      <StatusBadge status={app.status} short />
    </Link>
  )
}
