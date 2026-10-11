import { AuditLog } from "@/components/audit/audit-log"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"

export default function AuditPage() {
  return (
    <DashboardShell title="ცვლილებების ჟურნალი">
      <AuditLog />
    </DashboardShell>
  )
}
