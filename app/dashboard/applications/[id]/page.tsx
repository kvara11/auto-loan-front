import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ApplicationDetail } from "@/components/applications/application-detail"

type ApplicationDetailPageProps = {
  params: Promise<{ id: string }>
}

export default async function ApplicationDetailPage({ params }: ApplicationDetailPageProps) {
  const { id } = await params

  return (
    <DashboardShell>
      <section className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">Application Details</h3>
          <p className="text-muted-foreground text-sm sm:text-base">Review a single loan application.</p>
        </div>

        <ApplicationDetail id={id} />
      </section>
    </DashboardShell>
  )
}