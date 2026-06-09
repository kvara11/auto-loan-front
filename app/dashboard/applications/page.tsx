import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ApplicationsManagement } from "@/components/applications/applications-management"

export default function ApplicationsPage() {
  return (
    <DashboardShell>
      <section className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">განცხადებები</h3>
          {/* <p className="text-muted-foreground text-sm sm:text-base">Loan applications list and quick access to the create flow.</p> */}
        </div>

        <ApplicationsManagement />
      </section>
    </DashboardShell>
  )
}