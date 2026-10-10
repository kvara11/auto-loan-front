"use client"

import { PanelLeftClose, PanelLeftOpen } from "lucide-react"

import { SidebarNav } from "@/components/dashboard/sidebar-nav"
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

export function BrandMark({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex size-[30px] shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sm font-extrabold text-sidebar-primary-foreground",
        className
      )}
    >
      A
    </div>
  )
}

export function DashboardSidebar({ modules, collapsed, onToggle, onNavigate, hideToggle, className }: DashboardSidebarProps) {
  const ToggleIcon = collapsed ? PanelLeftOpen : PanelLeftClose

  return (
    <aside
      className={cn(
        "flex h-full flex-col gap-5 border-e border-sidebar-border bg-sidebar px-3.5 py-5 text-sidebar-foreground transition-[width] duration-200",
        collapsed ? "w-[76px]" : "w-[252px]",
        className
      )}
    >
      <div className={cn("flex items-center gap-2.5 px-2 py-1.5", collapsed && "flex-col px-0")}>
        <BrandMark />
        {collapsed ? null : <span className="text-sm font-bold">Auto Loan</span>}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <SidebarNav modules={modules} collapsed={collapsed} onNavigate={onNavigate} />
      </div>

      {hideToggle ? null : (
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "მენიუს გაშლა" : "მენიუს ჩაკეცვა"}
          title={collapsed ? "მენიუს გაშლა" : "მენიუს ჩაკეცვა"}
          className={cn(
            "flex h-10 items-center gap-2.5 rounded-[9px] px-2.5 text-[13px] font-semibold text-sidebar-foreground/70 transition-colors",
            "hover:bg-sidebar-accent/60 hover:text-sidebar-foreground focus-visible:outline-2 focus-visible:outline-sidebar-ring",
            collapsed && "justify-center px-0"
          )}
        >
          <ToggleIcon className="size-4" />
          {collapsed ? null : <span>ჩაკეცვა</span>}
        </button>
      )}
    </aside>
  )
}
