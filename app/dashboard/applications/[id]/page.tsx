import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ApplicationDetail } from "@/components/application-detail/application-detail"

type ApplicationDetailPageProps = {
  params: Promise<{ id: string }>
}

export default async function ApplicationDetailPage({ params }: ApplicationDetailPageProps) {
  const { id } = await params

  return (
    <DashboardShell title="განაცხადის დეტალები" breadcrumb={{ label: "განაცხადები", href: "/dashboard/applications" }}>
      <ApplicationDetail id={id} />
    </DashboardShell>
  )
}
