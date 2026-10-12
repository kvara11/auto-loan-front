import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ClientDetail } from "@/components/client-detail/client-detail"

type ClientPageProps = {
  params: Promise<{ id: string }>
}

export default async function ClientPage({ params }: ClientPageProps) {
  const { id } = await params

  return (
    <DashboardShell title="კლიენტის გვერდი" breadcrumb={{ label: "კლიენტები", href: "/dashboard/clients" }}>
      <ClientDetail id={id} />
    </DashboardShell>
  )
}
