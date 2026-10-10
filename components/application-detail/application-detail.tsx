"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"

import { type ApplicationAction, type ApplicationDetails, type HistoryEntry } from "@/components/applications/applications-types"
import { ActionDialog } from "@/components/application-detail/action-dialog"
import { AttachmentsCard } from "@/components/application-detail/attachments-card"
import { CommentsCard } from "@/components/application-detail/comments-card"
import { DecisionBanner, OfficerComment } from "@/components/application-detail/decision-note"
import { DetailHeader } from "@/components/application-detail/detail-header"
import { ClientCard, LoanCard, VehicleCard } from "@/components/application-detail/detail-sections"
import { IncomeInfoCard } from "@/components/application-detail/income-info-card"
import { HistoryTimeline } from "@/components/application-detail/history-timeline"
import { LtvCard } from "@/components/application-detail/ltv-card"
import { FormNotice } from "@/components/settings/settings-section"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchApplication, fetchHistory } from "@/lib/applications"
import { getApiErrorMessage } from "@/lib/axios"

export function ApplicationDetail({ id }: { id: string }) {
  const [details, setDetails] = useState<ApplicationDetails | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [error, setError] = useState<string>()
  const [notice, setNotice] = useState<string>()
  const [dialogAction, setDialogAction] = useState<ApplicationAction | null>(null)

  const loadHistory = useCallback(() => {
    fetchHistory(id).then(setHistory).catch(() => setHistory([]))
  }, [id])

  useEffect(() => {
    let active = true

    fetchApplication(id)
      .then((data) => active && setDetails(data))
      .catch((err) => active && setError(getApiErrorMessage(err)))
    fetchHistory(id)
      .then((data) => active && setHistory(data))
      .catch(() => undefined)

    return () => {
      active = false
    }
  }, [id])

  const handleDone = (updated: ApplicationDetails, message: string) => {
    setDetails(updated)
    setDialogAction(null)
    setNotice(message)
    loadHistory()
  }

  if (error) {
    return (
      <div className="flex min-h-65 flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-card px-6 text-center">
        <p className="text-base font-medium">{error}</p>
        <Button asChild variant="outline" className="h-10">
          <Link href="/dashboard/applications">განაცხადების სია</Link>
        </Button>
      </div>
    )
  }

  if (!details) {
    return (
      <div className="flex flex-col gap-5" aria-busy="true">
        <Skeleton className="h-20 rounded-xl" />
        <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
          <Skeleton className="h-[520px] rounded-xl" />
          <Skeleton className="h-[320px] rounded-xl" />
        </div>
      </div>
    )
  }

  const { application: app, actions, can_edit: canEdit } = details

  return (
    <div className="flex flex-col gap-5">
      <DetailHeader app={app} actions={actions} canEdit={canEdit} onAction={(action) => { setNotice(undefined); setDialogAction(action) }} />
      {notice ? <FormNotice tone="success">{notice}</FormNotice> : null}
      <DecisionBanner app={app} />

      <div className="grid items-start gap-5 lg:grid-cols-[2fr_1fr]">
        <div className="flex min-w-0 flex-col gap-5">
          <ClientCard app={app} />
          <IncomeInfoCard app={app} />
          <LoanCard app={app} />
          <VehicleCard app={app} />
          <AttachmentsCard applicationId={app.id} status={app.status} onChanged={loadHistory} />
          <CommentsCard applicationId={app.id} />
        </div>
        <div className="flex min-w-0 flex-col gap-5">
          <LtvCard app={app} />
          <OfficerComment app={app} />
          <HistoryTimeline app={app} history={history} />
        </div>
      </div>

      <ActionDialog applicationId={app.id} action={dialogAction} onClose={() => setDialogAction(null)} onDone={handleDone} />
    </div>
  )
}
