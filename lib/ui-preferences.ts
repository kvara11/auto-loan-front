export type ThemeMode = "light" | "dark"

const THEME_KEY = "auto-loan.theme"
const SIDEBAR_KEY = "auto-loan.sidebar-collapsed"
const PREF_CHANGE_EVENT = "auto-loan-preferences-change"

export function getStoredTheme() {
    if (typeof window === "undefined") return null

    const value = window.localStorage.getItem(THEME_KEY)

    if (value === "light" || value === "dark") {
        return value
    }

    return null
}

export function setStoredTheme(theme: ThemeMode) {
    if (typeof window === "undefined") return

    window.localStorage.setItem(THEME_KEY, theme)
    window.dispatchEvent(new Event(PREF_CHANGE_EVENT))
}

export function applyTheme(theme: ThemeMode) {
    if (typeof document === "undefined") return

    document.documentElement.classList.toggle("dark", theme === "dark")
}

export function getStoredSidebarCollapsed() {
    if (typeof window === "undefined") return null

    const value = window.localStorage.getItem(SIDEBAR_KEY)

    if (value === null) return null

    return value === "true"
}

export function setStoredSidebarCollapsed(collapsed: boolean) {
    if (typeof window === "undefined") return

    window.localStorage.setItem(SIDEBAR_KEY, String(collapsed))
    window.dispatchEvent(new Event(PREF_CHANGE_EVENT))
}

export function subscribePreferenceChanges(callback: () => void) {
    window.addEventListener("storage", callback)
    window.addEventListener(PREF_CHANGE_EVENT, callback)

    return () => {
        window.removeEventListener("storage", callback)
        window.removeEventListener(PREF_CHANGE_EVENT, callback)
    }
}