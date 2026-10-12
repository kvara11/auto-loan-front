"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Bell } from "lucide-react"

import { useNotifications } from "@/components/dashboard/use-notifications"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Loading } from "@/components/ui/loading"
import { useAuthUser } from "@/lib/auth-storage"
import { formatDateTime } from "@/lib/format"
import { type AppNotification, fetchNotifications, markAllNotificationsRead, markNotificationRead } from "@/lib/notifications"
import { cn } from "@/lib/utils"

// T-507: the bell in the top bar. Clicking a notification marks it read and opens its application (or its link).
// T-209: every signed-in user has it, since a feedback reply can reach anyone (an administrator too).
export function NotificationBell() {
  const router = useRouter()
  const user = useAuthUser()
  const enabled = Boolean(user)
  const { unreadCount, setUnreadCount } = useNotifications(enabled, (user?.settings?.alert_sound ?? 1) === 1)
  const [items, setItems] = useState<AppNotification[]>()

  if (!enabled) return null

  const load = async (open: boolean) => {
    if (!open) return
    setItems(undefined)
    try {
      const result = await fetchNotifications()
      setItems(result.notifications)
      setUnreadCount(result.unreadCount)
    } catch {
      setItems([])
    }
  }

  const openNotification = async (item: AppNotification) => {
    if (!item.read_at) {
      setUnreadCount(await markNotificationRead(item.id).catch(() => Math.max(0, unreadCount - 1)))
    }
    if (item.application_id) router.push(`/dashboard/applications/${item.application_id}`)
    else if (item.link) router.push(item.link)
  }

  const readAll = async () => {
    await markAllNotificationsRead().catch(() => undefined)
    setItems((current) => current?.map((item) => ({ ...item, read_at: item.read_at ?? new Date().toISOString() })))
    setUnreadCount(0)
  }

  return (
    <DropdownMenu onOpenChange={(open) => void load(open)}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={unreadCount ? `შეტყობინებები, წაუკითხავი: ${unreadCount}` : "შეტყობინებები"}
          title="შეტყობინებები"
          className="relative flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <Bell className="size-5" />
          {unreadCount ? (
            <span className="absolute top-0.5 right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[11px] font-semibold text-white tabular-nums">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[22rem] max-w-[calc(100vw-2rem)] p-0">
        <DropdownMenuLabel className="flex items-center justify-between gap-2 px-3 py-2.5">
          <span className="text-sm font-semibold">შეტყობინებები</span>
          {unreadCount ? (
            <button type="button" className="text-xs font-medium text-primary hover:underline" onClick={() => void readAll()}>
              ყველას წაკითხულად მონიშვნა
            </button>
          ) : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-0" />

        <div className="max-h-[min(70vh,26rem)] overflow-y-auto p-1">
          {!items ? (
            <div className="flex justify-center py-6"><Loading /></div>
          ) : items.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">შეტყობინებები არ არის</p>
          ) : (
            items.map((item) => <NotificationItem key={item.id} item={item} onSelect={() => void openNotification(item)} />)
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function NotificationItem({ item, onSelect }: { item: AppNotification; onSelect: () => void }) {
  const unread = !item.read_at

  return (
    <DropdownMenuItem onSelect={onSelect} className={cn("items-start gap-2.5 px-3 py-2.5", unread && "bg-primary/5")}>
      <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", unread ? "bg-primary" : "bg-transparent")} aria-hidden="true" />
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className={cn("text-sm leading-snug", unread ? "font-semibold" : "text-muted-foreground")}>{item.title}</span>
        {item.comment ? <span className={cn("text-xs text-muted-foreground", item.action === "feedback_reply" ? "line-clamp-6" : "line-clamp-2")}>„{item.comment}“</span> : null}
        <span className="text-xs text-muted-foreground tabular-nums">
          {[item.actor?.name, formatDateTime(item.created_at)].filter(Boolean).join(" · ")}
        </span>
      </span>
    </DropdownMenuItem>
  )
}
