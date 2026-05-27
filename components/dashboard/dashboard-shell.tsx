"use client"

import { useEffect, useState } from "react"

import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { api } from "@/lib/axios"
import { API_ROUTES } from "@/lib/routes"
import { saveAuthUser, type AppModule, type AuthUser, useAuthUser } from "@/lib/auth-storage"

type DashboardShellProps = {
    children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
    
    const [collapsed, setCollapsed] = useState(false)
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
        <div className="bg-muted/30 min-h-screen">
            <div className="flex min-h-screen">
                <div className="hidden lg:block">
                    <DashboardSidebar
                        modules={modules}
                        collapsed={collapsed}
                        onToggle={() => setCollapsed((value) => !value)}
                    />
                </div>

                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                    <SheetContent side="left" className="p-0 lg:hidden">
                        <SheetTitle className="sr-only">Navigation</SheetTitle>
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