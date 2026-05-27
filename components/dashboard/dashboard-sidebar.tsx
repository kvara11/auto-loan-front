"use client"

import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import {
    BadgeCheck,
    BriefcaseBusiness,
    Car,
    ChartBar,
    CheckCheck,
    Circle,
    KeyRound,
    LayoutDashboard,
    Menu,
    Settings,
    Shield,
    Users,
} from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { type AppModule } from "@/lib/auth-storage"
import { cn } from "@/lib/utils"

type DashboardSidebarProps = {
    modules: AppModule[]
    collapsed: boolean
    onToggle: () => void
    onNavigate?: () => void
    hideToggle?: boolean
    className?: string
}

const iconMap: Record<string, LucideIcon> = {
    "layout-dashboard": LayoutDashboard,
    "briefcase-business": BriefcaseBusiness,
    car: Car,
    "chart-bar": ChartBar,
    "check-check": CheckCheck,
    shield: Shield,
    users: Users,
    "badge-check": BadgeCheck,
    "key-round": KeyRound,
    settings: Settings,
}

function getIcon(name: string) {
    return iconMap[name] ?? Circle
}

function ModuleTree({
    modules,
    collapsed,
    onNavigate,
    level = 0,
}: {
    modules: AppModule[]
    collapsed: boolean
    onNavigate?: () => void
    level?: number
}) {
    return (
        <div className={cn("space-y-1", level > 0 && "pl-3") }>
            {modules
                .filter((module) => module.is_active)
                .sort((left, right) => left.sort_order - right.sort_order)
                .map((module) => {
                    const Icon = getIcon(module.icon)
                    const hasChildren = module.children.length > 0

                    if (hasChildren && !module.route) {
                        return (
                            <div key={module.id} className="space-y-2 pt-2 first:pt-0">
                                {!collapsed ? (
                                    <p className="px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                        {module.name}
                                    </p>
                                ) : null}
                                <ModuleTree
                                    modules={module.children}
                                    collapsed={collapsed}
                                    onNavigate={onNavigate}
                                    level={level + 1}
                                />
                            </div>
                        )
                    }

                    return (
                        <Link
                            key={module.id}
                            href={module.route ?? "/dashboard"}
                            onClick={onNavigate}
                            className={cn(
                                buttonVariants({ variant: "ghost" }),
                                "h-10 w-full justify-start text-sm sm:text-base",
                                collapsed && "justify-center px-0",
                                level > 0 && "pl-4"
                            )}
                        >
                            <Icon className="size-4" />
                            {!collapsed ? <span>{module.name}</span> : null}
                        </Link>
                    )
                })}
        </div>
    )
}

export function DashboardSidebar({
    modules,
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
                <ModuleTree modules={modules} collapsed={collapsed} onNavigate={onNavigate} />
            </nav>
        </aside>
    )
}