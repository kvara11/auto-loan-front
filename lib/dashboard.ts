import { type ApplicationRecord } from "@/components/applications/applications-types"
import { api } from "@/lib/axios"
import { API_ROUTES } from "@/lib/routes"

// The dashboard's figures, counted by the backend within the user's data scope.

// "drafts": the officer's own Draft/Returned; "queue": Submitted to Risks for the reviewers.
export type RoleBlockData = { type: "drafts" | "queue"; total: number; items: ApplicationRecord[] }

export type ApplicationsSummary = {
  counts: Record<string, number>
  total: number
  in_progress: number
  recent: ApplicationRecord[]
  role_block: RoleBlockData | null
}

type Count = { total: number; active: number } | null

export type AdminSummary = { users: Count; branches: Count }

export async function fetchApplicationsSummary(): Promise<ApplicationsSummary> {
  const response = await api.get<ApplicationsSummary>(API_ROUTES.dashboard.applications)
  if (!response.success || !response.data) throw new Error(response.message || "დეშბორდის ჩატვირთვა ვერ მოხერხდა")

  return response.data
}

export async function fetchAdminSummary(): Promise<AdminSummary> {
  const response = await api.get<AdminSummary>(API_ROUTES.dashboard.admin)
  return { users: response.data?.users ?? null, branches: response.data?.branches ?? null }
}
