import {
  type ApplicationAction,
  type ApplicationDetails,
  type ApplicationRecord,
  type HistoryEntry,
} from "@/components/applications/applications-types"
import { api } from "@/lib/axios"

export const APPLICATIONS_URL = "/api/applications"

// List filters; "" means no filter. Dates are "YYYY-MM-DD", inclusive, on created_at; search is part of the client's personal ID.
export type ApplicationFilters = { status: string; start_date: string; end_date: string; search: string }

export const EMPTY_APPLICATION_FILTERS: ApplicationFilters = { status: "", start_date: "", end_date: "", search: "" }

export type PageMeta = { current_page: number; per_page: number; total: number; last_page: number }

export const PAGE_SIZE_OPTIONS = [10, 20, 50]

const filterParams = (filters: ApplicationFilters) =>
  Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== ""))

async function getList(params: Record<string, string | number>) {
  const response = await api.get<ApplicationRecord[] | { applications?: ApplicationRecord[] }>(APPLICATIONS_URL, { params })
  if (!response.success) throw new Error(response.message || "განაცხადების ჩატვირთვა ვერ მოხერხდა")

  return { applications: Array.isArray(response.data) ? response.data : (response.data?.applications ?? []), meta: response.meta }
}

// The backend already limits the list to the user's data scope (own / branch / submitted / all)
// and applies the filters. Without page/per_page it returns the whole scope (dashboard counts).
export async function fetchApplications(filters: ApplicationFilters = EMPTY_APPLICATION_FILTERS): Promise<ApplicationRecord[]> {
  return (await getList(filterParams(filters))).applications
}

// One page of the list (GET /api/applications?page=&per_page=) with meta {current_page, per_page, total, last_page}.
export async function fetchApplicationsPage(filters: ApplicationFilters, page: number, perPage: number) {
  const { applications, meta } = await getList({ ...filterParams(filters), page, per_page: perPage })
  const fallback: PageMeta = { current_page: page, per_page: perPage, total: applications.length, last_page: 1 }

  return { applications, meta: (meta as PageMeta | undefined) ?? fallback }
}

// Throws on an error envelope; callers show getApiErrorMessage(err).
export async function fetchApplication(id: string | number): Promise<ApplicationDetails> {
  const response = await api.get<Partial<ApplicationDetails>>(`${APPLICATIONS_URL}/${id}`)
  if (!response.success || !response.data?.application) throw new Error(response.message || "განაცხადი ვერ მოიძებნა")

  return toDetails(response.data as ApplicationDetails)
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

  return { ...toDetails(response.data as ApplicationDetails), message: response.message }
}

// Create (POST, id null) or edit (PUT) an application; returns the saved application with its id.
export async function saveApplication(id: number | null, payload: Record<string, unknown>) {
  const response = id
    ? await api.put<{ application?: ApplicationRecord }>(`${APPLICATIONS_URL}/${id}`, payload)
    : await api.post<{ application?: ApplicationRecord }>(APPLICATIONS_URL, payload)
  if (!response.success || !response.data?.application) throw new Error(response.message || "განაცხადის შენახვა ვერ მოხერხდა")

  return response.data.application
}

function toDetails(data: ApplicationDetails): ApplicationDetails {
  return { application: data.application, actions: data.actions ?? [], can_edit: Boolean(data.can_edit) }
}

// Display only (the backend doesn't compute LTV yet, T-404): requested amount / market value × 100.
export function displayLtv(requested: string | number | null | undefined, marketValue: string | number | null | undefined) {
  const market = Number(marketValue)
  const amount = Number(requested)
  return Number.isFinite(market) && market > 0 && Number.isFinite(amount) ? (amount / market) * 100 : null
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
