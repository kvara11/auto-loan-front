import { api } from "@/lib/axios"
import { type AdminOverview, type DashboardQuery, type Overview } from "@/lib/dashboard/types"
import { API_ROUTES } from "@/lib/routes"

// The real data source; mock.ts returns the same shapes for ?mock=1 and the debug views.

export async function fetchOverview(query: DashboardQuery): Promise<Overview> {
  const params = query.period === "range" ? query : { period: query.period }
  const response = await api.get<Overview>(API_ROUTES.dashboard.overview, { params })
  if (!response.success || !response.data) throw new Error(response.message || "დეშბორდის ჩატვირთვა ვერ მოხერხდა")

  return response.data
}

export async function fetchAdminOverview(): Promise<AdminOverview> {
  const response = await api.get<AdminOverview>(API_ROUTES.dashboard.admin)
  if (!response.success || !response.data) throw new Error(response.message || "დეშბორდის ჩატვირთვა ვერ მოხერხდა")

  return response.data
}
