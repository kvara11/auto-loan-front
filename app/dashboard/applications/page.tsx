import { Suspense } from "react"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ApplicationsManagement } from "@/components/applications/applications-management"

// The list reads its filters from the URL (useSearchParams), which needs a Suspense boundary.
export default function ApplicationsPage() {
  return (
    <DashboardShell title="განაცხადები">
      <Suspense>
        <ApplicationsManagement />
      </Suspense>
    </DashboardShell>
  )
}
