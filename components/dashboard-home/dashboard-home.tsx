"use client"

import { Suspense } from "react"

import { AdminDashboard } from "@/components/dashboard-home/admin-dashboard"
import { LoanDashboard } from "@/components/dashboard-home/loan-dashboard"
import { Skeleton } from "@/components/ui/skeleton"
import { canViewApplications } from "@/lib/applications"
import { useAuthUser } from "@/lib/auth-storage"

// Users without any applications.view.* (the administrator) get the compact system view; everyone else
// the loan dashboard for their role (the backend's `persona`). Both read ?period / ?view / ?mock from the URL.
export function DashboardHome() {
  const user = useAuthUser()

  if (!user) return <DashboardSkeleton />

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      {canViewApplications(user.permissions) ? <LoanDashboard /> : <AdminDashboard />}
    </Suspense>
  )
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-5" aria-busy="true" aria-label="იტვირთება">
      <Skeleton className="h-12 w-72" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
        {Array.from({ length: 7 }, (_, i) => <Skeleton key={i} className="h-[132px] rounded-xl" />)}
      </div>
      <Skeleton className="h-72 rounded-xl" />
    </div>
  )
}
