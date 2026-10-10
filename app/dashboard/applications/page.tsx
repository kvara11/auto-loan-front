import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ApplicationsManagement } from "@/components/applications/applications-management"

export default function ApplicationsPage() {
  return (
    <DashboardShell title="განაცხადები">
      <ApplicationsManagement />
    </DashboardShell>
  )
}
