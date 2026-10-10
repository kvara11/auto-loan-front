import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { SettingsPage as SettingsContent } from "@/components/settings/settings-page"

export default function SettingsPage() {
    return (
        <DashboardShell>
            <SettingsContent />
        </DashboardShell>
    )
}
