import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { SettingsForm } from "@/components/settings/settings-form"

export default function SettingsPage() {
    return (
        <DashboardShell>
            <SettingsForm />
        </DashboardShell>
    )
}