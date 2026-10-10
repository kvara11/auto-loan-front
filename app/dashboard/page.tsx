import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHome } from "@/components/dashboard-home/dashboard-home"

export default function DashboardPage() {
  return (
    <DashboardShell title="დეშბორდი">
      <DashboardHome />
    </DashboardShell>
  )
}
