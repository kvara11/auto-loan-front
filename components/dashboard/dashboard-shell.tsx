"use client"

import { useState } from "react"

import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"

type DashboardShellProps = {
    children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
    const [collapsed, setCollapsed] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)

    return (
        <div className="bg-muted/30 min-h-screen">
            <div className="flex min-h-screen">
                <div className="hidden lg:block">
                    <DashboardSidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
                </div>

                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                    <SheetContent side="left" className="p-0 lg:hidden">
                        <SheetTitle className="sr-only">Navigation</SheetTitle>
                        <DashboardSidebar
                            collapsed={false}
                            hideToggle
                            className="w-full border-r-0"
                            onToggle={() => undefined}
                            onNavigate={() => setMobileOpen(false)}
                        />
                    </SheetContent>
                </Sheet>

                <div className="flex min-h-screen flex-1 flex-col">
                    <DashboardHeader onOpenMobileMenu={() => setMobileOpen(true)} />
                    <main className="flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
                        <div className="mx-auto w-full max-w-7xl">{children}</div>
                    </main>
                </div>
            </div>
        </div>
    )
}