import { BranchesManagement } from "@/components/branches/branches-management"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"

export default function BranchesPage() {
  return (
    <DashboardShell title="ფილიალები">
      <BranchesManagement />
    </DashboardShell>
  )
}
