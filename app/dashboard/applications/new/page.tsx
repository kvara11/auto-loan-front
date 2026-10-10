import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ApplicationWizard } from "@/components/application-wizard/application-wizard"

export default function NewApplicationPage() {
  return (
    <DashboardShell title="ახალი განაცხადი" breadcrumb={{ label: "განაცხადები", href: "/dashboard/applications" }}>
      <ApplicationWizard />
    </DashboardShell>
  )
}
