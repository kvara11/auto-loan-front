"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Pencil } from "lucide-react"

import { type ApplicationAction, type ApplicationRecord } from "@/components/applications/applications-types"
import { StatusBadge } from "@/components/applications/status-badge"
import { ACTION_ORDER, ACTIONS } from "@/components/application-detail/action-config"
import { Button } from "@/components/ui/button"

type DetailHeaderProps = {
  app: ApplicationRecord
  actions: ApplicationAction[]
  // From the backend: the officer's own Draft/Returned application.
  canEdit: boolean
  onAction: (action: ApplicationAction) => void
}

export function DetailHeader({ app, actions, canEdit, onAction }: DetailHeaderProps) {
  const router = useRouter()
  const available = ACTION_ORDER.filter((action) => actions.includes(action))

  // Back to wherever the user came from (list, dashboard); a page opened directly goes to the list.
  const goBack = () => {
    if (window.history.length > 1) router.back()
    else router.push("/dashboard/applications")
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-[22px]">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-bold tabular-nums sm:text-[22px]">განაცხადი {app.application_no || `#${app.id}`}</h1>
        <StatusBadge status={app.status} />
      </div>

      <div className="flex flex-wrap gap-2">
        {canEdit ? (
          <Button asChild variant="outline" className="h-10">
            <Link href={`/dashboard/applications/${app.id}/edit`}>
              <Pencil className="size-4" />
              რედაქტირება
            </Link>
          </Button>
        ) : null}
        {available.map((action) => {
          const { label, icon: Icon, variant } = ACTIONS[action]
          return (
            <Button key={action} variant={variant} className="h-10" onClick={() => onAction(action)}>
              <Icon className="size-4" />
              {label}
            </Button>
          )
        })}
        <Button variant="outline" className="h-10" onClick={goBack}>
          <ArrowLeft className="size-4" />
          უკან
        </Button>
      </div>
    </div>
  )
}
