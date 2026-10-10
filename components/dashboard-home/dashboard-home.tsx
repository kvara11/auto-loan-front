"use client"

import { useEffect, useState } from "react"

import { type ApplicationRecord } from "@/components/applications/applications-types"
import { AdminOverview } from "@/components/dashboard-home/admin-overview"
import { KpiCard } from "@/components/dashboard-home/kpi-card"
import { RecentApplications } from "@/components/dashboard-home/recent-applications"
import { RoleBlock } from "@/components/dashboard-home/role-block"
import { StatusChart } from "@/components/dashboard-home/status-chart"
import { Skeleton } from "@/components/ui/skeleton"
import { IN_PROGRESS_STATUSES } from "@/lib/application-status"
import { canViewApplications, fetchApplications } from "@/lib/applications"
import { useAuthUser } from "@/lib/auth-storage"
import { getApiErrorMessage } from "@/lib/axios"

export function DashboardHome() {
  const user = useAuthUser()
  const permissions = user?.permissions ?? []
  const showApplications = canViewApplications(permissions)

  if (!user) return <DashboardSkeleton />
  if (!showApplications) return <AdminOverview />

  return <ApplicationsDashboard permissions={permissions} />
}

function ApplicationsDashboard({ permissions }: { permissions: string[] }) {
  const [applications, setApplications] = useState<ApplicationRecord[]>()
  const [error, setError] = useState<string>()

  useEffect(() => {
    let active = true

    fetchApplications()
      .then((records) => active && setApplications(records))
      .catch((requestError) => active && setError(getApiErrorMessage(requestError) || "განაცხადების ჩატვირთვა ვერ მოხერხდა"))

    return () => {
      active = false
    }
  }, [])

  if (error) {
    return <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
  }
  if (!applications) return <DashboardSkeleton />

  const inProgress = applications.filter((app) => IN_PROGRESS_STATUSES.includes(app.status))
  const submitted = applications.filter((app) => app.status === "Submitted to Risks").length

  return (
    <div className="flex flex-col gap-4 sm:gap-[22px]">
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3 sm:gap-[18px]">
        <KpiCard label="მიმდინარე სესხები" soon />
        <KpiCard label="დამუშავების პროცესში" value={inProgress.length} hint={`${submitted} — გაგზავნილია რისკებში`} />
        <KpiCard label="თვის გაცემები" soon />
      </div>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1.3fr_1fr] lg:gap-[18px]">
        <StatusChart applications={applications} />
        <RoleBlock permissions={permissions} applications={applications} />
      </div>

      <RecentApplications applications={applications} />
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-[22px]" aria-busy="true" aria-label="იტვირთება">
      <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-3">
        {[0, 1, 2].map((key) => <Skeleton key={key} className="h-[116px] rounded-[14px]" />)}
      </div>
      <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-[1.3fr_1fr]">
        <Skeleton className="h-60 rounded-xl" />
        <Skeleton className="h-60 rounded-xl" />
      </div>
      <Skeleton className="h-72 rounded-xl" />
    </div>
  )
}
