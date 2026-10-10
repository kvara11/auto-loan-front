import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ApplicationFormPage } from "@/components/applications/application-form"

export default function NewApplicationPage() {
  return (
    <DashboardShell title="ახალი განაცხადი" breadcrumb={{ label: "განაცხადები", href: "/dashboard/applications" }}>
      <ApplicationFormPage />
    </DashboardShell>
  )
}
