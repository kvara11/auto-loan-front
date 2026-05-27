"use client"

import { createContext, useContext } from "react"

type DashboardShellState = {
    collapsed: boolean
    setCollapsed: (collapsed: boolean) => void
}

const DashboardShellStateContext = createContext<DashboardShellState | null>(null)

export function DashboardShellStateProvider({
    children,
    value,
}: {
    children: React.ReactNode
    value: DashboardShellState
}) {
    return <DashboardShellStateContext.Provider value={value}>{children}</DashboardShellStateContext.Provider>
}

export function useDashboardShellState() {
    return useContext(DashboardShellStateContext)
}

export function getStoredSidebarCollapsed() {
    if (typeof window === "undefined") return null

    const value = window.localStorage.getItem("auto-loan.sidebar-collapsed")

    if (value === null) return null

    return value === "true"
}