import { api } from "@/lib/axios"
import { API_ROUTES } from "@/lib/routes"

// T-507: the signed-in user's own in-app notifications (workflow actions on applications).

export type AppNotification = {
  id: string
  action: string | null
  title: string
  comment: string | null
  application_id: number | null
  application_no: string | null
  actor: { id: number; name: string } | null
  read_at: string | null
  created_at: string
}

export const NOTIFICATION_POLL_MS = 30_000

export const NOTIFICATION_SOUND = "/sounds/notification.wav"

export async function fetchNotifications(limit = 20) {
  const response = await api.get<{ notifications?: AppNotification[]; unread_count?: number }>(API_ROUTES.notifications.index, { params: { limit } })
  return { notifications: response.data?.notifications ?? [], unreadCount: response.data?.unread_count ?? 0 }
}

export async function fetchUnreadCount() {
  const response = await api.get<{ unread_count?: number; latest_unread_at?: string | null }>(API_ROUTES.notifications.unreadCount)
  return { unreadCount: response.data?.unread_count ?? 0, latestUnreadAt: response.data?.latest_unread_at ?? null }
}

export async function markNotificationRead(id: string) {
  const response = await api.post<{ unread_count?: number }>(API_ROUTES.notifications.read(id))
  return response.data?.unread_count ?? 0
}

export async function markAllNotificationsRead() {
  await api.post(API_ROUTES.notifications.readAll)
}
