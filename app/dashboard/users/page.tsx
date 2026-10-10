import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { UsersManagement } from "@/components/users/users-management"

export default function UsersPage() {
  return (
    <DashboardShell title="მომხმარებლები">
      <UsersManagement />
    </DashboardShell>
  )
}
