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
    <div className="max-w-3xl space-y-5 xl:max-w-none">
      {error ? <FormNotice tone="error">{error}</FormNotice> : null}

      {!data && !error ? (
        <div className="flex min-h-65 items-center justify-center rounded-xl border border-dashed">
          <Loading />
        </div>
      ) : null}

      {data ? (
        // One column on smaller screens; from xl the profile on the left, preferences and security on the right.
        <div className="grid items-start gap-5 xl:grid-cols-2">
          <ProfileSection profile={data.profile} />
          <div className="space-y-5">
            <PreferencesSection preferences={data.preferences} />
            <SecuritySection />
          </div>
        </div>
      ) : null}
    </div>
  )
}
