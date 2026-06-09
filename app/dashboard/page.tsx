import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const summaryCards = [
    {
        title: "მიმდინარე სესხები",
        value: "128",
        description: "მიმდინარე სესხები",
    },
    {
        title: "დამუშავების პროცესში",
        value: "24",
        description: "დამუშავების პროცესში",
    },
    {
        title: "თვის შემოსავალი",
        value: "$42,400",
        description: "თვის შემოსავალი",
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
                            {/* <CardDescription className="text-sm sm:text-base">{card.description}</CardDescription> */}
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
                        <CardTitle className="text-sm sm:text-base lg:text-lg">ბოლო ოპერაციები</CardTitle>
                        {/* <CardDescription className="text-sm sm:text-base">
                            ბოლო ოპერაციები.
                        </CardDescription> */}
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground text-sm sm:text-base">ვერ მოიძებნა.</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm sm:text-base lg:text-lg">გუნდის შენიშვნები</CardTitle>
                        {/* <CardDescription className="text-sm sm:text-base">გუნდის შენიშვნები.</CardDescription> */}
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground text-sm sm:text-base">ვერ მოიძებნა.</p>
                    </CardContent>
                </Card>
            </section>
        </DashboardShell>
    )
}