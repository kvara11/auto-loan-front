"use client"

import { useEffect, useState } from "react"

import { PreferencesSection } from "@/components/settings/preferences-section"
import { ProfileSection } from "@/components/settings/profile-section"
import { SecuritySection } from "@/components/settings/security-section"
import { FormNotice } from "@/components/settings/settings-section"
import { Loading } from "@/components/ui/loading"
import { getApiErrorMessage } from "@/lib/axios"
import { fetchSettings, type SettingsData } from "@/lib/settings"

export function SettingsPage() {
  const [data, setData] = useState<SettingsData>()
  const [error, setError] = useState<string>()

  useEffect(() => {
    let active = true

    fetchSettings()
      .then((settings) => {
        if (active) setData(settings)
      })
      .catch((requestError) => {
        if (active) setError(getApiErrorMessage(requestError) || "პარამეტრების ჩატვირთვა ვერ მოხერხდა.")
      })

    return () => {
      active = false
    }
  }, [])

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-1">
        <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">პარამეტრები</h3>
        <p className="text-muted-foreground text-sm sm:text-base">პირადი ინფორმაცია, ინტერფეისი და უსაფრთხოება.</p>
      </div>

      {error ? <FormNotice tone="error">{error}</FormNotice> : null}

      {!data && !error ? (
        <div className="flex min-h-65 items-center justify-center rounded-xl border border-dashed">
          <Loading />
        </div>
      ) : null}

      {data ? (
        <>
          <ProfileSection profile={data.profile} />
          <PreferencesSection preferences={data.preferences} />
          <SecuritySection />
        </>
      ) : null}
    </div>
  )
}
