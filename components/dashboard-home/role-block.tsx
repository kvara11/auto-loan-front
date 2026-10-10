import { type ApplicationRecord } from "@/components/applications/applications-types"
import { ApplicationRow } from "@/components/dashboard-home/application-row"

type RoleBlockProps = { permissions: string[]; applications: ApplicationRecord[] }

// Officer: own unfinished work; risk manager: the queue. Other roles get no block.
function roleView(permissions: string[]) {
  if (permissions.includes("applications.create")) {
    return { title: "ჩემი მონახაზები", statuses: ["Draft", "Returned"], empty: "მონახაზები არ გაქვთ." }
  }
  if (permissions.includes("applications.view.submitted")) {
    return { title: "რიგი — გაგზავნილი განაცხადები", statuses: ["Submitted to Risks"], empty: "რიგში განაცხადი არ არის." }
  }
  return null
}

export function RoleBlock({ permissions, applications }: RoleBlockProps) {
  const view = roleView(permissions)
  if (!view) return null

  const items = applications.filter((app) => view.statuses.includes(app.status)).slice(0, 5)

  return (
    <section className="flex flex-col gap-3.5 rounded-xl border bg-card p-5 shadow-sm sm:p-[22px]">
      <h2 className="text-[17px] font-semibold">{view.title}</h2>
      {items.length ? (
        <div className="flex flex-col gap-2.5">
          {items.map((app) => <ApplicationRow key={app.id} app={app} />)}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{view.empty}</p>
      )}
    </section>
  )
}
