import { isAxiosError } from "axios"

import { api, getApiErrorMessage } from "@/lib/axios"
import { type PageMeta } from "@/lib/pagination"

// T-209: a user's defect report or suggestion; only super-admin (feedback.manage) reads and answers it.

export const FEEDBACK_URL = "/api/feedback"

export type FeedbackType = "bug" | "idea"
export type FeedbackStatus = "new" | "done" | "rejected"

export const FEEDBACK_TYPES: Record<FeedbackType, string> = { bug: "ხარვეზი", idea: "რჩევა" }
export const FEEDBACK_STATUSES: Record<FeedbackStatus, string> = { new: "ახალი", done: "გაკეთდა", rejected: "უარყოფილი" }
export const STATUS_VARIANT = { new: "info", done: "success", rejected: "inactive" } as const

type Person = { id: number; first_name: string; last_name: string }

export type Feedback = {
  id: number
  type: FeedbackType
  type_label: string
  body: string
  page: string | null
  status: FeedbackStatus
  status_label: string
  reply: string | null
  replied_at: string | null
  replied_by?: Person | null
  user?: (Person & { username: string; avatar_url: string | null; role: string | null; branch: { name: string } | null; active: boolean }) | null
  created_at: string
}

export type FeedbackFilters = { status: FeedbackStatus | ""; type: FeedbackType | "" }

// POST /api/feedback (any signed-in user); returns the backend's thank-you message.
export async function sendFeedback(payload: { type: FeedbackType; body: string; page: string }) {
  const response = await api.post(FEEDBACK_URL, payload)
  if (!response.success) throw new Error(response.message || "შეტყობინება ვერ გაიგზავნა")
  return response.message
}

export async function fetchFeedbackPage(filters: FeedbackFilters, page: number, perPage: number) {
  const params = { ...(filters.status ? { status: filters.status } : {}), ...(filters.type ? { type: filters.type } : {}), page, per_page: perPage }
  const response = await api.get<{ feedback?: Feedback[] }>(FEEDBACK_URL, { params })
  if (!response.success) throw new Error(response.message || "შეტყობინებების ჩატვირთვა ვერ მოხერხდა")

  const items = response.data?.feedback ?? []
  const meta = (response.meta as PageMeta | undefined) ?? { current_page: page, per_page: perPage, total: items.length, last_page: 1 }
  return { items, meta }
}

// PUT /api/feedback/:id — status and reply; a new reply notifies the author.
export async function updateFeedback(id: number, payload: { status: FeedbackStatus; reply: string }) {
  const response = await api.put<{ feedback?: Feedback }>(`${FEEDBACK_URL}/${id}`, payload)
  if (!response.success || !response.data?.feedback) throw new Error(response.message || "შენახვა ვერ მოხერხდა")
  return response.data.feedback
}

// Opened by URL without feedback.manage: the backend's 401 text is English.
export function feedbackErrorMessage(error: unknown, fallback: string) {
  if (isAxiosError(error) && error.response?.status === 401) return "უკუკავშირის ნახვის უფლება არ გაქვთ."
  return getApiErrorMessage(error) || fallback
}
