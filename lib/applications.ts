import {
  type ApplicationAction,
  type ApplicationDetails,
  type ApplicationRecord,
  type HistoryEntry,
} from "@/components/applications/applications-types"
import { api } from "@/lib/axios"

export const APPLICATIONS_URL = "/api/applications"

// List filters; "" means no filter. Dates are "YYYY-MM-DD", inclusive, on created_at.
export type ApplicationFilters = { status: string; start_date: string; end_date: string }

export const EMPTY_APPLICATION_FILTERS: ApplicationFilters = { status: "", start_date: "", end_date: "" }

// The backend already limits the list to the user's data scope (own / branch / submitted / all)
// and applies the filters (GET /api/applications?status=&start_date=&end_date=).
export async function fetchApplications(filters: ApplicationFilters = EMPTY_APPLICATION_FILTERS): Promise<ApplicationRecord[]> {
  const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== ""))
  const response = await api.get<ApplicationRecord[] | { applications?: ApplicationRecord[] }>(APPLICATIONS_URL, { params })

  if (!response.success) throw new Error(response.message || "განაცხადების ჩატვირთვა ვერ მოხერხდა")
  if (Array.isArray(response.data)) return response.data

  return response.data?.applications ?? []
}

// Throws on an error envelope; callers show getApiErrorMessage(err).
export async function fetchApplication(id: string | number): Promise<ApplicationDetails> {
  const response = await api.get<Partial<ApplicationDetails>>(`${APPLICATIONS_URL}/${id}`)
  if (!response.success || !response.data?.application) throw new Error(response.message || "განაცხადი ვერ მოიძებნა")

  return { application: response.data.application, actions: response.data.actions ?? [] }
}

export async function fetchHistory(id: string | number): Promise<HistoryEntry[]> {
  const response = await api.get<{ history?: HistoryEntry[] }>(`${APPLICATIONS_URL}/${id}/history`)
  return response.data?.history ?? []
}

// POST /api/applications/:id/{submit|return|approve|reject}; returns the updated application, actions and the backend message.
export async function performAction(
  id: string | number,
  action: ApplicationAction,
  comment?: string,
): Promise<ApplicationDetails & { message: string }> {
  const response = await api.post<Partial<ApplicationDetails>>(`${APPLICATIONS_URL}/${id}/${action}`, comment ? { comment } : {})
  if (!response.success || !response.data?.application) throw new Error(response.message || "ქმედება ვერ შესრულდა")

  return { application: response.data.application, actions: response.data.actions ?? [], message: response.message }
}

// "ე. გელაშვილი"
export function shortName(person: { first_name?: string; last_name?: string } | null | undefined) {
  if (!person) return "—"
  return [person.first_name ? `${person.first_name[0]}.` : "", person.last_name ?? ""].filter(Boolean).join(" ")
}

export function vehicleLabel(app: Pick<ApplicationRecord, "car_make" | "car_model" | "car_year">) {
  const parts = [app.car_make, app.car_model, app.car_year ? String(app.car_year) : ""].filter(Boolean)
  return parts.length ? parts.join(" ") : "—"
}

export function canViewApplications(permissions: string[] | undefined) {
  return (permissions ?? []).some((permission) => permission.startsWith("applications.view."))
}
