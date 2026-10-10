import { type AuthUser } from "@/lib/auth-storage"
import { api } from "@/lib/axios"
import { API_ROUTES } from "@/lib/routes"

export type SettingsTheme = "light" | "dark"

// Form state of the settings page. Names and email come from the auth user (profile),
// the rest are preferences stored in /api/settings.
export type UserSettings = {
    first_name: string
    last_name: string
    email: string
} & SettingPreferences

export type SettingPreferences = {
    sidebar_collapsed: boolean
    theme: SettingsTheme
    notifications: boolean
}

type SettingsRecord = Partial<{
    sidebar_collapsed: boolean | number | string
    theme: string
    notifications: boolean | number | string
}> & {
    settings?: Partial<SettingsRecord>
}

export function getDefaultSettings(): UserSettings {
    return {
        first_name: "",
        last_name: "",
        email: "",
        sidebar_collapsed: false,
        theme: "light",
        notifications: true,
    }
}

function toBoolean(value: boolean | number | string | undefined) {
    if (typeof value === "boolean") return value
    if (typeof value === "number") return value !== 0
    if (typeof value === "string") return value === "true" || value === "1"

    return false
}

export function normalizeSettings(record?: Partial<SettingsRecord> | null): SettingPreferences {
    const settings = record?.settings ?? record ?? {}

    return {
        sidebar_collapsed: toBoolean(settings.sidebar_collapsed),
        theme: settings.theme === "dark" ? "dark" : "light",
        notifications: settings.notifications === undefined ? true : toBoolean(settings.notifications),
    }
}

export async function fetchSettings() {
    const response = await api.get<Partial<SettingsRecord>>(API_ROUTES.settings.index)

    return normalizeSettings(response.data)
}

// Only preferences go to /api/settings; names are profile data (saveProfile).
export async function saveSettings({ sidebar_collapsed, theme, notifications }: SettingPreferences) {
    return api.post<unknown, { settings: SettingPreferences }>(API_ROUTES.settings.index, {
        settings: { sidebar_collapsed, theme, notifications },
    })
}

export async function saveProfile(first_name: string, last_name: string) {
    const response = await api.put<{ user?: AuthUser }>(API_ROUTES.auth.me, { first_name, last_name })

    return response.data?.user
}