"use client"

import { useEffect } from "react"

import { applyTheme, getStoredTheme, subscribePreferenceChanges } from "@/lib/ui-preferences"

export function ThemeSync() {
    useEffect(() => {
        const syncTheme = () => {
            const theme = getStoredTheme()
            applyTheme(theme ?? "light")
        }

        syncTheme()

        return subscribePreferenceChanges(syncTheme)
    }, [])

    return null
}