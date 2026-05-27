"use client"

import { useEffect, useMemo, useState } from "react"

import { isAxiosError } from "axios"

import { getApiErrorMessage } from "@/lib/axios"
import { useAuthUser } from "@/lib/auth-storage"
import { fetchSettings, getDefaultSettings, saveSettings, type UserSettings } from "@/lib/settings"

type SettingsStatus = "loading" | "ready" | "saving" | "error"

export function useSettings() {
    const authUser = useAuthUser()

    const defaultSettings = useMemo<UserSettings>(() => {
        const settings = getDefaultSettings()

        if (!authUser) {
            return settings
        }

        return {
            ...settings,
            first_name: authUser.first_name,
            last_name: authUser.last_name,
            email: authUser.email,
        }
    }, [authUser])

    const [settings, setSettings] = useState<UserSettings>(defaultSettings)
    const [baseline, setBaseline] = useState<UserSettings>(defaultSettings)
    const [status, setStatus] = useState<SettingsStatus>("loading")
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    useEffect(() => {
        let active = true

        const load = async () => {
            try {
                setStatus("loading")
                const nextSettings = await fetchSettings()

                if (!active) return

                const mergedSettings = {
                    ...defaultSettings,
                    ...nextSettings,
                }

                setSettings(mergedSettings)
                setBaseline(mergedSettings)
                setError(null)
                setStatus("ready")
            } catch (requestError: unknown) {
                if (!active) return

                const message = getApiErrorMessage(requestError)

                setError(message || "Could not load settings.")
                setStatus("error")
            }
        }

        void load()

        return () => {
            active = false
        }
    }, [defaultSettings])

    const isDirty = useMemo(() => {
        return JSON.stringify(settings) !== JSON.stringify(baseline)
    }, [baseline, settings])

    const updateSetting = <Key extends keyof UserSettings>(key: Key, value: UserSettings[Key]) => {
        setSettings((current) => ({
            ...current,
            [key]: value,
        }))
    }

    const submit = async () => {
        try {
            setStatus("saving")
            setError(null)
            setSuccess(null)

            await saveSettings(settings)

            setBaseline(settings)
            setStatus("ready")
            setSuccess("Settings saved.")

            return true
        } catch (requestError: unknown) {
            const message = isAxiosError(requestError) ? getApiErrorMessage(requestError) : undefined

            setError(message || "Could not save settings.")
            setStatus("error")

            return false
        }
    }

    return {
        settings,
        status,
        error,
        success,
        isDirty,
        updateSetting,
        setSettings,
        submit,
    }
}