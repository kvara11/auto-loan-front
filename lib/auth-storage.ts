"use client"

import { useSyncExternalStore } from "react"

const AUTH_USER_KEY = "auth:user"
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
    role: string
    permissions: string[]
    modules: AppModule[]
}

export function saveAuthUser(user: AuthUser) {
    if (typeof window === "undefined") return
    const raw = JSON.stringify(user)
    cachedAuthUser = user
    cachedAuthUserRaw = raw
    window.sessionStorage.setItem(AUTH_USER_KEY, raw)
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
    cachedAuthUser = null
    cachedAuthUserRaw = ""
    window.dispatchEvent(new Event("auth-user-change"))
}

function subscribe(callback: () => void) {
    window.addEventListener("storage", callback)
    window.addEventListener("auth-user-change", callback)

    return () => {
        window.removeEventListener("storage", callback)
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
