import { api } from "@/lib/axios"
import { API_ROUTES } from "@/lib/routes"

export type SettingsTheme = "light" | "dark"

export type UserSettings = {
    first_name: string
    last_name: string
    email: string
    sidebar_collapsed: boolean
    theme: SettingsTheme
    notifications: boolean
}

type SettingsRecord = Partial<{
    first_name: string
    last_name: string
    email: string
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

export function normalizeSettings(record?: Partial<SettingsRecord> | null): UserSettings {
    const settings = record?.settings ?? record ?? {}

    return {
        first_name: settings.first_name ?? "",
        last_name: settings.last_name ?? "",
        email: settings.email ?? "",
        sidebar_collapsed: toBoolean(settings.sidebar_collapsed),
        theme: settings.theme === "dark" ? "dark" : "light",
        notifications: settings.notifications === undefined ? true : toBoolean(settings.notifications),
    }
}

export async function fetchSettings() {
    const response = await api.get<Partial<SettingsRecord>>(API_ROUTES.settings.index)

    return normalizeSettings(response.data)
}

export async function saveSettings(settings: UserSettings) {
    return api.post<unknown, { settings: UserSettings }>(API_ROUTES.settings.index, { settings })
}