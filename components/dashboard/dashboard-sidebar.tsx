"use client"

import Link from "next/link"
import { LayoutDashboard, Menu, Settings, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type DashboardSidebarProps = {
    collapsed: boolean
    onToggle: () => void
    onNavigate?: () => void
    hideToggle?: boolean
    className?: string
}

const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Users", href: "/dashboard/users", icon: Users },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function DashboardSidebar({
    collapsed,
    onToggle,
    onNavigate,
    hideToggle,
    className,
}: DashboardSidebarProps) {
    return (
        <aside
            className={cn(
                "bg-background flex h-full flex-col border-r px-3 py-4 transition-[width] duration-200",
                collapsed ? "w-18" : "w-64",
                className
            )}
        >
            <div className="mb-6 flex items-center justify-between px-1">
                {!collapsed ? <p className="text-sm font-semibold sm:text-base">Auto Loan</p> : null}
                {!hideToggle ? (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-10"
                        onClick={onToggle}
                        aria-label="Toggle sidebar"
                    >
                        <Menu className="size-4" />
                    </Button>
                ) : null}
            </div>

            <nav className="space-y-1">
                {navItems.map((item) => {
                    const Icon = item.icon

                    return (
                        <Button
                            key={item.label}
                            asChild
                            variant="ghost"
                            className={cn("h-10 w-full justify-start text-sm sm:text-base", collapsed && "justify-center px-0")}
                        >
                            <Link href={item.href} onClick={onNavigate}>
                                <Icon className="size-4" />
                                {!collapsed ? <span>{item.label}</span> : null}
                            </Link>
                        </Button>
                    )
                })}
            </nav>
        </aside>
    )
}