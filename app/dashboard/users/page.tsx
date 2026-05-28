import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { UsersManagement } from "@/components/users/users-management"

export default function UsersPage() {
  return (
    <DashboardShell>
      <section className="space-y-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">მომხმარებლის ადმინისტრირება</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            შექმენით, განაახლეთ და აკონტროლეთ მომხმარებლები და წვდომები.
          </p>
        </div>

        <UsersManagement />
      </section>
    </DashboardShell>
  )
}
