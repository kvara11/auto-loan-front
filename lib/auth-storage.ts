"use client"

import { useSyncExternalStore } from "react"

// Plain constants: they are not secrets, and env vars without NEXT_PUBLIC_ are undefined in the browser.
const AUTH_USER_KEY = "auto-loan.auth-user"
// Cross-tab signal: `<timestamp>:<userId>` after a login/refresh, `<timestamp>:clear` after a logout.
const AUTH_SYNC_KEY = "auto-loan.auth-sync"

let cachedAuthUser: AuthUser | null = null
let cachedAuthUserRaw = ""

export type AppModule = {
    id: number
    key: string
    name: string
    icon: string
    route: string | null
    sort_order: number
    is_active: boolean
    children: AppModule[]
}

export type AuthUser = {
    id: number
    first_name: string
    last_name: string
    username: string
    email: string
    role: { id: number; name: string; display_name: string | null } | null
    branch: { id: number; code: string; name: string } | null
    permissions: string[]
    modules: AppModule[]
}

export function saveAuthUser(user: AuthUser) {
    if (typeof window === "undefined") return
    const raw = JSON.stringify(user)
    cachedAuthUser = user
    cachedAuthUserRaw = raw

    window.sessionStorage.setItem(AUTH_USER_KEY, raw)
    window.localStorage.setItem(AUTH_SYNC_KEY, `${Date.now()}:${user.id}`)

    window.dispatchEvent(new Event("auth-user-change"))
}

export function getAuthUser() {
    if (typeof window === "undefined") return null

    const value = window.sessionStorage.getItem(AUTH_USER_KEY)

    if (!value) return null

    if (value === cachedAuthUserRaw) {
        return cachedAuthUser
    }

    try {
        const parsed = JSON.parse(value) as AuthUser
        cachedAuthUser = parsed
        cachedAuthUserRaw = value
        return parsed
    } catch {
        cachedAuthUser = null
        cachedAuthUserRaw = ""
        return null
    }
}

export function clearAuthUser() {
    if (typeof window === "undefined") return
    window.sessionStorage.removeItem(AUTH_USER_KEY)
    window.localStorage.setItem(AUTH_SYNC_KEY, `${Date.now()}:clear`)
    cachedAuthUser = null
    cachedAuthUserRaw = ""
    window.dispatchEvent(new Event("auth-user-change"))
}

// Another tab logged out, or logged in as a different account: drop our cached user so the
// shell refetches /api/auth/me. The same user refreshing in another tab is ignored; clearing
// on every write made two open tabs refetch each other's user in an endless loop.
function handleStorageEvent(event: StorageEvent, callback: () => void) {
    if (event.key !== AUTH_SYNC_KEY) return

    const signal = event.newValue?.split(":")[1]
    const current = getAuthUser()
    if (signal !== "clear" && current && String(current.id) === signal) return

    window.sessionStorage.removeItem(AUTH_USER_KEY)
    cachedAuthUser = null
    cachedAuthUserRaw = ""
    callback()
}

function subscribe(callback: () => void) {
    const onStorage = (event: StorageEvent) => handleStorageEvent(event, callback)

    window.addEventListener("storage", onStorage)
    window.addEventListener("auth-user-change", callback)

    return () => {
        window.removeEventListener("storage", onStorage)
        window.removeEventListener("auth-user-change", callback)
    }
}

function getSnapshot() {
    return getAuthUser()
}

function getServerSnapshot() {
    return null
}

export function useAuthUser() {
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
