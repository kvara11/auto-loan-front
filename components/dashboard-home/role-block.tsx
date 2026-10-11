import { ApplicationRow } from "@/components/dashboard-home/application-row"
import { type RoleBlockData } from "@/lib/dashboard"

// Officer: own unfinished work; risk manager: the queue. The backend picks the block and its latest items.
const VIEWS: Record<RoleBlockData["type"], { title: string; empty: string }> = {
  drafts: { title: "ჩემი მონახაზები", empty: "მონახაზები არ გაქვთ." },
  queue: { title: "რიგი — გაგზავნილი განაცხადები", empty: "რიგში განაცხადი არ არის." },
}

export function RoleBlock({ block }: { block: RoleBlockData }) {
  const view = VIEWS[block.type]
  if (!view) return null

  return (
    <section className="flex flex-col gap-3.5 rounded-xl border bg-card p-5 shadow-sm sm:p-[22px]">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-[17px] font-semibold">{view.title}</h2>
        {block.total ? (
          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
            {block.total > block.items.length ? `${block.items.length} / ${block.total}` : block.total}
          </span>
        ) : null}
      </div>
      {block.items.length ? (
        <div className="flex flex-col gap-2.5">
          {block.items.map((app) => <ApplicationRow key={app.id} app={app} />)}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{view.empty}</p>
      )}
    </section>
  )
}
