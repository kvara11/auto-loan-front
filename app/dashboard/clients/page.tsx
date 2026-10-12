import { Suspense } from "react"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ClientsManagement } from "@/components/clients/clients-management"

// The list keeps its search in the URL (useSearchParams), which needs a Suspense boundary.
export default function ClientsPage() {
  return (
    <DashboardShell title="კლიენტები">
      <Suspense>
        <ClientsManagement />
      </Suspense>
    </DashboardShell>
  )
}
