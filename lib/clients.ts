import { isAxiosError } from "axios"

import { api, getApiErrorMessage } from "@/lib/axios"
import { type PageMeta } from "@/lib/pagination"

export const CLIENTS_URL = "/api/clients"

// A client of the shared registry (Q-17). The list adds counts within the viewer's own application scope.
export type Client = {
  id: number
  first_name: string
  last_name: string
  personal_id: string
  phone?: string | null
  email?: string | null
  address?: string | null
  legal_address?: string | null
  birth_date?: string | null
  marital_status?: string | null
  family_members?: number | null
  legal_address_verified?: boolean
  legal_address_verified_at?: string | null
  created_at?: string | null
  applications_count?: number
  last_application_at?: string | null
}

export const clientName = (client: Pick<Client, "first_name" | "last_name">) => `${client.first_name} ${client.last_name}`.trim()

// GET /api/clients?search=&page=&per_page= → the whole registry, newest first; search matches part of the
// personal ID, the phone or "first last".
export async function fetchClientsPage(search: string, page: number, perPage: number) {
  const params = { ...(search ? { search } : {}), page, per_page: perPage }
  const response = await api.get<{ clients?: Client[] }>(CLIENTS_URL, { params })
  if (!response.success) throw new Error(response.message || "კლიენტების ჩატვირთვა ვერ მოხერხდა")

  const clients = response.data?.clients ?? []
  const meta = (response.meta as PageMeta | undefined) ?? { current_page: page, per_page: perPage, total: clients.length, last_page: 1 }
  return { clients, meta }
}

// Throws on an error envelope (404 for a missing client); callers show getApiErrorMessage(err).
export async function fetchClient(id: string | number): Promise<Client> {
  const response = await api.get<{ client?: Client }>(`${CLIENTS_URL}/${id}`)
  if (!response.success || !response.data?.client) throw new Error(response.message || "კლიენტი ვერ მოიძებნა")

  return response.data.client
}

// PUT /api/clients/:id (clients.update); the personal ID never changes. Throws the API error (424 → fields).
export async function updateClient(id: number, payload: Record<string, unknown>): Promise<{ client: Client; message: string }> {
  const response = await api.put<{ client?: Client }>(`${CLIENTS_URL}/${id}`, payload)
  if (!response.success || !response.data?.client) throw new Error(response.message || "კლიენტის შენახვა ვერ მოხერხდა")

  return { client: response.data.client, message: response.message }
}

// UX only: the backend enforces the permissions.
export const hasPermission = (permissions: string[] | undefined, name: string) => (permissions ?? []).includes(name)

// Opened by URL without clients.view (e.g. an administrator): the backend's 401 text is English.
export function clientsErrorMessage(error: unknown, fallback: string) {
  if (isAxiosError(error) && error.response?.status === 401) return "კლიენტების ნახვის უფლება არ გაქვთ."
  return getApiErrorMessage(error) || fallback
}
