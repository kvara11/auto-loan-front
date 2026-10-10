import { api } from "@/lib/axios"
import { API_ROUTES } from "@/lib/routes"

export type SettingsTheme = "light" | "dark"

// Profile data; only the names are editable here (username/email are changed by an admin).
export type ProfileInfo = {
  first_name: string
  last_name: string
  username: string
  email: string
}

// UI preferences; the backend returns them typed, with defaults for unset keys.
export type Preferences = {
  theme: SettingsTheme
  sidebar_collapsed: boolean
  notifications: boolean
  alert_sound: boolean
}

export type SettingsData = {
  profile: ProfileInfo
  preferences: Preferences
}

export async function fetchSettings() {
  const response = await api.get<SettingsData>(API_ROUTES.settings.index)

  if (!response.data) throw new Error(response.message || "პარამეტრების ჩატვირთვა ვერ მოხერხდა.")

  return response.data
}

export async function updateProfile(value: Pick<ProfileInfo, "first_name" | "last_name">) {
  const response = await api.put<{ profile: ProfileInfo }>(API_ROUTES.settings.profile, value)

  return { profile: response.data?.profile, message: response.message }
}

export async function updatePreferences(preferences: Partial<Preferences>) {
  const response = await api.put<{ preferences: Preferences }>(API_ROUTES.settings.preferences, { preferences })

  return { preferences: response.data?.preferences, message: response.message }
}
