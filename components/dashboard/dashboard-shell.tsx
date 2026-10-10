"use client"

import { useEffect, useState } from "react"

import { DashboardHeader, type Breadcrumb } from "@/components/dashboard/dashboard-header"
import { DashboardShellStateProvider, getStoredSidebarCollapsed } from "@/components/dashboard/dashboard-shell-state"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { api } from "@/lib/axios"
import { API_ROUTES } from "@/lib/routes"
import { saveAuthUser, type AppModule, type AuthUser, useAuthUser } from "@/lib/auth-storage"

type DashboardShellProps = {
    // Shown in the top bar; pages don't render their own page heading.
    title: string
    breadcrumb?: Breadcrumb
    children: React.ReactNode
}

export function DashboardShell({ title, breadcrumb, children }: DashboardShellProps) {
    const [collapsed, setCollapsed] = useState(() => getStoredSidebarCollapsed() ?? false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const authUser = useAuthUser()
    const [fallbackModules, setFallbackModules] = useState<AppModule[]>([])
    const modules = authUser?.modules ?? fallbackModules

    useEffect(() => {
        if (authUser) return

        let isActive = true

        const bootstrap = async () => {
            try {
                const response = await api.get<{ user?: AuthUser }>(API_ROUTES.auth.me)

                if (!isActive || !response.data?.user) return

                saveAuthUser(response.data.user)
                setFallbackModules(response.data.user.modules ?? [])
            } catch {
                if (isActive) {
                    setFallbackModules([])
                }
            }
        }

        void bootstrap()

        return () => {
            isActive = false
        }
    }, [authUser])

    return (
        <DashboardShellStateProvider value={{ collapsed, setCollapsed }}>
            <div className="min-h-screen bg-background">
                <div className="flex min-h-screen">
                    <div className="sticky top-0 hidden h-screen lg:block">
                        <DashboardSidebar
                            modules={modules}
                            collapsed={collapsed}
                            onToggle={() => setCollapsed((value) => !value)}
                        />
                    </div>

                    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                        <SheetContent side="left" className="w-[260px] border-0 bg-sidebar p-0 lg:hidden">
                            <SheetTitle className="sr-only">ნავიგაცია</SheetTitle>
                            <DashboardSidebar
                                modules={modules}
                                collapsed={false}
                                hideToggle
                                className="w-full border-r-0"
                                onToggle={() => undefined}
                                onNavigate={() => setMobileOpen(false)}
                            />
                        </SheetContent>
                    </Sheet>

                    <div className="flex min-h-screen min-w-0 flex-1 flex-col">
                        <DashboardHeader title={title} breadcrumb={breadcrumb} onOpenMobileMenu={() => setMobileOpen(true)} />
                        <main className="flex-1 p-4 sm:p-6 lg:p-7">
                            <div className="mx-auto w-full max-w-[90rem]">{children}</div>
                        </main>
                    </div>
                </div>
            </div>
        </DashboardShellStateProvider>
    )
}