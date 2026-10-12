import {
  type ApplicationAction,
  type ApplicationDetails,
  type ApplicationRecord,
  type HistoryEntry,
} from "@/components/applications/applications-types"
import { isAttentionKey } from "@/lib/application-attention"
import { api } from "@/lib/axios"
import { recentDateRange } from "@/lib/format"
import { type PageMeta } from "@/lib/pagination"

export const APPLICATIONS_URL = "/api/applications"

// List filters; "" means no filter. Dates are "YYYY-MM-DD", inclusive, on created_at; search is part of the client's personal ID;
// attention is a dashboard "ყურადღება!" category (lib/application-attention.ts).
export type ApplicationFilters = { status: string; start_date: string; end_date: string; search: string; attention: string }

export const EMPTY_APPLICATION_FILTERS: ApplicationFilters = { status: "", start_date: "", end_date: "", search: "", attention: "" }

const FILTER_KEYS = Object.keys(EMPTY_APPLICATION_FILTERS) as Array<keyof ApplicationFilters>

// The list page opens on the last week (a big scope would be slow to count and page); "გასუფთავება" goes back to it.
export const defaultApplicationFilters = (): ApplicationFilters => ({ ...EMPTY_APPLICATION_FILTERS, ...recentDateRange() })

// The list's filters live in the URL (?status=&start_date=&end_date=&search=&attention=), so a dashboard link
// opens exactly its applications and back/refresh keep them. No filter in the URL → the last-week default;
// a link with filters (e.g. ?attention=returned) uses only those, without the default dates.
export function readListFilters(params: URLSearchParams): ApplicationFilters {
  const given = FILTER_KEYS.filter((key) => params.get(key))
  if (given.length === 0) return defaultApplicationFilters()

  const filters = { ...EMPTY_APPLICATION_FILTERS }
  for (const key of given) filters[key] = params.get(key) ?? ""
  if (filters.attention && !isAttentionKey(filters.attention)) filters.attention = ""
  return filters
}

export const listFilterSearch = (filters: ApplicationFilters) =>
  new URLSearchParams(Object.entries(filters).filter(([, value]) => value !== "")).toString()

export const PAGE_SIZE_OPTIONS = [10, 20, 50]

const filterParams = (filters: ApplicationFilters) =>
  Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== ""))

async function getList(params: Record<string, string | number>) {
  const response = await api.get<ApplicationRecord[] | { applications?: ApplicationRecord[] }>(APPLICATIONS_URL, { params })
  if (!response.success) throw new Error(response.message || "განაცხადების ჩატვირთვა ვერ მოხერხდა")

  return { applications: Array.isArray(response.data) ? response.data : (response.data?.applications ?? []), meta: response.meta }
}

// One page of the list, already limited by the backend to the user's data scope and filtered (GET /api/applications?page=&per_page=) with meta {current_page, per_page, total, last_page}.
// `extra` adds filters that aren't in the list's URL, e.g. { client_id } on the client page.
export async function fetchApplicationsPage(filters: ApplicationFilters, page: number, perPage: number, extra: Record<string, number> = {}) {
  const { applications, meta } = await getList({ ...filterParams(filters), ...extra, page, per_page: perPage })
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
