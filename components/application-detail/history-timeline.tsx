import { type ApplicationRecord, type HistoryEntry } from "@/components/applications/applications-types"
import { getHistoryLabel, getStatusInfo, type StatusKey } from "@/lib/application-status"
import { shortName } from "@/lib/applications"
import { formatDateTime } from "@/lib/format"
import { cn } from "@/lib/utils"

// Full class names so Tailwind generates them.
const DOT: Record<StatusKey, string> = {
  draft: "bg-status-draft",
  submitted: "bg-status-submitted",
  approved: "bg-status-approved",
  rejected: "bg-status-rejected",
  returned: "bg-status-returned",
}

type Step = { key: string; title: string; meta: string; comment?: string | null; dot: string; pending?: boolean }

export function HistoryTimeline({ app, history }: { app: ApplicationRecord; history: HistoryEntry[] }) {
  const steps: Step[] = history.map((entry) => ({
    key: String(entry.id),
    title: getHistoryLabel(entry.action),
    meta: `${shortName(entry.user)} · ${formatDateTime(entry.created_at)}`,
    comment: entry.comment,
    dot: DOT[getStatusInfo(entry.to_status).key],
  }))

  if (app.status === "Submitted to Risks") {
    steps.push({ key: "pending", title: "გადაწყვეტილების მოლოდინში", meta: "რისკების განყოფილება", dot: "", pending: true })
  }

  return (
    <section className="rounded-xl border bg-card p-5 shadow-sm sm:p-[22px]">
      <h2 className="mb-4 text-[17px] font-semibold">ისტორია</h2>
      {steps.length === 0 ? (
        <p className="text-sm text-muted-foreground">ისტორია ცარიელია</p>
      ) : (
        <ol className="flex flex-col">
          {steps.map((step, index) => (
            <li key={step.key} className="flex gap-3.5">
              <div className="flex flex-col items-center">
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-1 size-3 shrink-0 rounded-full",
                    step.pending ? "border-2 border-dashed border-muted-foreground" : step.dot,
                  )}
                />
                {index < steps.length - 1 ? <span aria-hidden="true" className="my-0.5 w-0.5 flex-1 bg-border" /> : null}
              </div>
              <div className={cn("min-w-0 pb-5", step.pending && "text-muted-foreground")}>
                <p className="text-sm font-semibold">{step.title}</p>
                <p className="text-xs text-muted-foreground tabular-nums">{step.meta}</p>
                {step.comment ? <p className="mt-1.5 rounded-md bg-muted px-2.5 py-1.5 text-[13px] whitespace-pre-line">{step.comment}</p> : null}
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
