import { type ApplicationRecord } from "@/components/applications/applications-types"
import { api } from "@/lib/axios"

export const APPLICATIONS_URL = "/api/applications"

// The backend already limits the list to the user's data scope (own / branch / submitted / all).
export async function fetchApplications(): Promise<ApplicationRecord[]> {
  const response = await api.get<ApplicationRecord[] | { applications?: ApplicationRecord[] }>(APPLICATIONS_URL)

  if (!response.success) throw new Error(response.message || "განაცხადების ჩატვირთვა ვერ მოხერხდა")
  if (Array.isArray(response.data)) return response.data

  return response.data?.applications ?? []
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
