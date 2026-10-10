import { BranchesManagement } from "@/components/branches/branches-management"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"

export default function BranchesPage() {
  return (
    <DashboardShell>
      <section className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">ფილიალები</h3>
        </div>

        <BranchesManagement />
      </section>
    </DashboardShell>
  )
}
