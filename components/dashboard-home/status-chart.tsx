import { type ApplicationRecord } from "@/components/applications/applications-types"
import { getStatusInfo, STATUS_ORDER } from "@/lib/application-status"

const BAR_COLOR: Record<string, string> = {
  draft: "bg-status-draft",
  submitted: "bg-status-submitted",
  approved: "bg-status-approved",
  rejected: "bg-status-rejected",
  returned: "bg-status-returned",
}

export function StatusChart({ applications }: { applications: ApplicationRecord[] }) {
  const counts = STATUS_ORDER.map((status) => ({
    status,
    info: getStatusInfo(status),
    count: applications.filter((app) => app.status === status).length,
  }))
  const max = Math.max(1, ...counts.map((row) => row.count))

  return (
    <section className="flex flex-col gap-4 rounded-xl border bg-card p-5 shadow-sm sm:p-[22px]">
      <h2 className="text-[17px] font-semibold">განაცხადები სტატუსის მიხედვით</h2>
      <ul className="flex flex-col gap-3">
        {counts.map(({ status, info, count }) => (
          <li key={status} className="flex items-center gap-3">
            <span className="w-28 shrink-0 text-[13px] sm:w-36">{info.label}</span>
            <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted" aria-hidden="true">
              <span
                className={`block h-full rounded-full ${BAR_COLOR[info.key]}`}
                style={{ width: `${(count / max) * 100}%` }}
              />
            </span>
            <span className="w-8 text-right text-[13px] tabular-nums">{count}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
