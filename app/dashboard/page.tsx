import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const summaryCards = [
    {
        title: "Active Loans",
        value: "128",
        description: "Currently running customer loans",
    },
    {
        title: "Pending Applications",
        value: "24",
        description: "Waiting for final review",
    },
    {
        title: "Monthly Revenue",
        value: "$42,400",
        description: "Processed this month",
    },
]

export default function DashboardPage() {
    return (
        <DashboardShell>
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {summaryCards.map((card) => (
                    <Card key={card.title}>
                        <CardHeader>
                            <CardTitle className="text-sm sm:text-base lg:text-lg">{card.title}</CardTitle>
                            <CardDescription className="text-sm sm:text-base">{card.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xl font-semibold tracking-tight sm:text-2xl">{card.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </section>

            <section className="mt-4 grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm sm:text-base lg:text-lg">Recent Activity</CardTitle>
                        <CardDescription className="text-sm sm:text-base">
                            Latest updates from your operations.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground text-sm sm:text-base">No recent activity yet.</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm sm:text-base lg:text-lg">Team Notes</CardTitle>
                        <CardDescription className="text-sm sm:text-base">Shared reminders for your team.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground text-sm sm:text-base">Nothing to review right now.</p>
                    </CardContent>
                </Card>
            </section>
        </DashboardShell>
    )
}