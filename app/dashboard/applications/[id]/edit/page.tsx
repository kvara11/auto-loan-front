import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ApplicationWizard } from "@/components/application-wizard/application-wizard"

type EditApplicationPageProps = {
  params: Promise<{ id: string }>
}

// The officer's own Draft/Returned application (T-402); anything else shows why it can't be edited.
export default async function EditApplicationPage({ params }: EditApplicationPageProps) {
  const { id } = await params

  return (
    <DashboardShell title="განაცხადის რედაქტირება" breadcrumb={{ label: "განაცხადები", href: "/dashboard/applications" }}>
      <ApplicationWizard applicationId={id} />
    </DashboardShell>
  )
}
