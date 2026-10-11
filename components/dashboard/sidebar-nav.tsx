"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { LucideIcon } from "lucide-react"
import {
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  Car,
  ChartBar,
  CheckCheck,
  Circle,
  FileText,
  History,
  KeyRound,
  LayoutDashboard,
  Settings,
  Shield,
  Users,
} from "lucide-react"

import { type AppModule } from "@/lib/auth-storage"
import { cn } from "@/lib/utils"

// Module icon names come from the backend (ModulesSeeder); unknown names fall back to Circle.
const iconMap: Record<string, LucideIcon> = {
  "layout-dashboard": LayoutDashboard,
  "briefcase-business": BriefcaseBusiness,
  "file-text": FileText,
  car: Car,
  "chart-bar": ChartBar,
  "check-check": CheckCheck,
  shield: Shield,
  users: Users,
  "badge-check": BadgeCheck,
  "key-round": KeyRound,
  settings: Settings,
  "building-2": Building2,
  history: History,
}

// "/dashboard" only matches itself; other routes also match their sub-pages.
function isActive(pathname: string, route: string) {
  if (route === "/dashboard") return pathname === route
  return pathname === route || pathname.startsWith(`${route}/`)
}

function visible(modules: AppModule[]) {
  return modules.filter((module) => module.is_active).sort((a, b) => a.sort_order - b.sort_order)
}

type SidebarNavProps = { modules: AppModule[]; collapsed: boolean; onNavigate?: () => void }

export function SidebarNav({ modules, collapsed, onNavigate }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-4">
      {visible(modules).map((module) => {
        if (module.children.length > 0 && !module.route) {
          return (
            <div key={module.id} className="flex flex-col gap-0.5">
              {collapsed ? (
                <div className="mx-3 mb-1 h-px bg-sidebar-border" aria-hidden="true" />
              ) : (
                <p className="px-2.5 pt-1.5 pb-0.5 text-[11px] font-bold tracking-[0.07em] text-sidebar-foreground/55 uppercase">
                  {module.name}
                </p>
              )}
              {visible(module.children).map((child) => (
                <NavLink key={child.id} module={child} collapsed={collapsed} pathname={pathname} onNavigate={onNavigate} />
              ))}
            </div>
          )
        }

        return <NavLink key={module.id} module={module} collapsed={collapsed} pathname={pathname} onNavigate={onNavigate} />
      })}
    </nav>
  )
}

function NavLink({ module, collapsed, pathname, onNavigate }: {
  module: AppModule
  collapsed: boolean
  pathname: string
  onNavigate?: () => void
}) {
  const Icon = iconMap[module.icon] ?? Circle
  const route = module.route ?? "/dashboard"
  const active = isActive(pathname, route)

  return (
    <Link
      href={route}
      onClick={onNavigate}
      title={collapsed ? module.name : undefined}
      aria-label={collapsed ? module.name : undefined}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex h-10 items-center gap-2.5 rounded-[9px] px-2.5 text-[13px] font-semibold text-sidebar-foreground/85 transition-colors",
        "hover:bg-sidebar-accent/60 hover:text-sidebar-foreground focus-visible:outline-2 focus-visible:outline-sidebar-ring",
        collapsed && "justify-center px-0",
        active && "bg-sidebar-accent text-sidebar-foreground"
      )}
    >
      {active ? (
        <span aria-hidden="true" className="absolute top-1/2 left-0 h-4 w-[3px] -translate-y-1/2 rounded-full bg-sidebar-primary" />
      ) : null}
      <Icon className="size-4 shrink-0" />
      {collapsed ? null : <span className="truncate">{module.name}</span>}
    </Link>
  )
}
