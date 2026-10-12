"use client"

import Link from "next/link"
import { Menu } from "lucide-react"

import { FeedbackButton } from "@/components/dashboard/feedback-button"
import { NotificationBell } from "@/components/dashboard/notification-bell"
import { ThemeToggle } from "@/components/dashboard/theme-toggle"
import { UserMenu } from "@/components/dashboard/user-menu"
import { Button } from "@/components/ui/button"

export type Breadcrumb = { label: string; href: string }

type DashboardHeaderProps = {
  title: string
  breadcrumb?: Breadcrumb
  onOpenMobileMenu: () => void
}

export function DashboardHeader({ title, breadcrumb, onOpenMobileMenu }: DashboardHeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b bg-card px-4 sm:px-6 lg:px-7">
      <div className="flex min-w-0 items-center gap-2">
        <Button variant="ghost" size="icon" className="size-10 lg:hidden" aria-label="მენიუ" title="მენიუ" onClick={onOpenMobileMenu}>
          <Menu className="size-5" />
        </Button>

        {breadcrumb ? (
          <>
            <Link href={breadcrumb.href} className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline">
              {breadcrumb.label}
            </Link>
            <span className="hidden text-sm text-muted-foreground sm:inline" aria-hidden="true">/</span>
          </>
        ) : null}
        <h1 className="truncate text-base font-semibold sm:text-[17px]">{title}</h1>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <FeedbackButton />
        <ThemeToggle />
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  )
}
