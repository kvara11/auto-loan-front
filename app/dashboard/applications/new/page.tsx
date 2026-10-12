import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ApplicationWizard } from "@/components/application-wizard/application-wizard"

type NewApplicationPageProps = {
  // ?personal_id= from a client page: the wizard looks that client up.
  searchParams: Promise<{ personal_id?: string }>
}

export default async function NewApplicationPage({ searchParams }: NewApplicationPageProps) {
  const { personal_id: personalId } = await searchParams

  return (
    <DashboardShell title="ახალი განაცხადი" breadcrumb={{ label: "განაცხადები", href: "/dashboard/applications" }}>
      <ApplicationWizard personalId={typeof personalId === "string" ? personalId : undefined} />
    </DashboardShell>
  )
}
