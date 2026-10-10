import { type ApplicationRecord } from "@/components/applications/applications-types"

// The risk team's return remarks / reject reason, shown right under the header so the
// officer sees what to fix first.
export function DecisionBanner({ app }: { app: ApplicationRecord }) {
  if (!app.decision_comment || (app.status !== "Returned" && app.status !== "Rejected")) return null

  return (
    <section className="rounded-xl border border-[color-mix(in_oklch,var(--status-returned)_40%,transparent)] bg-[color-mix(in_oklch,var(--status-returned)_12%,var(--card))] px-5 py-4">
      <h2 className="text-sm font-semibold text-[var(--status-returned-text)]">
        {app.status === "Returned" ? "დაბრუნების მიზეზი" : "უარის მიზეზი"}
      </h2>
      <p className="mt-1 text-sm whitespace-pre-line">{app.decision_comment}</p>
    </section>
  )
}

export function OfficerComment({ app }: { app: ApplicationRecord }) {
  if (!app.officer_comment) return null

  return (
    <section className="rounded-xl border bg-card p-5 shadow-sm sm:p-[22px]">
      <h2 className="text-[17px] font-semibold">ოფიცერის კომენტარი</h2>
      <p className="mt-2 text-sm whitespace-pre-line text-muted-foreground">„{app.officer_comment}“</p>
    </section>
  )
}
