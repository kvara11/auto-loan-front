"use client"

const AUTH_USER_KEY = "auth:user"

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
    roles: string[]
    permissions: string[]
    modules: AppModule[]
}

export function saveAuthUser(user: AuthUser) {
    if (typeof window === "undefined") return
    window.sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
}

export function clearAuthUser() {
    if (typeof window === "undefined") return
    window.sessionStorage.removeItem(AUTH_USER_KEY)
}
