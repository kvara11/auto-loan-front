import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { FeedbackManagement } from "@/components/feedback/feedback-management"

// T-209: users' feedback, for super-admin only (feedback.manage).
export default function FeedbackPage() {
  return (
    <DashboardShell title="უკუკავშირი">
      <FeedbackManagement />
    </DashboardShell>
  )
}
