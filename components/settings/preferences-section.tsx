"use client"

import { useState, type ReactNode } from "react"
import { Bell, PanelLeft, Save } from "lucide-react"

import { useDashboardShellState } from "@/components/dashboard/dashboard-shell-state"
import { FormNotice, SettingsSection } from "@/components/settings/settings-section"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getApiErrorMessage } from "@/lib/axios"
import { updatePreferences, type Preferences } from "@/lib/settings"
import { applyTheme, setStoredSidebarCollapsed, setStoredTheme } from "@/lib/ui-preferences"

const EDITABLE_KEYS = ["theme", "sidebar_collapsed", "notifications"] as const

export function PreferencesSection({ preferences }: { preferences: Preferences }) {
  const shell = useDashboardShellState()
  const [saved, setSaved] = useState(preferences)
  const [draft, setDraft] = useState(preferences)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState<{ tone: "error" | "success"; text: string }>()

  const isDirty = EDITABLE_KEYS.some((key) => draft[key] !== saved[key])
  const update = <Key extends keyof Preferences>(key: Key, value: Preferences[Key]) => {
    setNotice(undefined)
    setDraft((current) => ({ ...current, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setNotice(undefined)
    try {
      const { theme, sidebar_collapsed, notifications } = draft
      const response = await updatePreferences({ theme, sidebar_collapsed, notifications })
      const next = response.preferences ?? draft

      setSaved(next)
      setDraft(next)
      // Theme and sidebar take effect only once they are saved.
      applyTheme(next.theme)
      setStoredTheme(next.theme)
      setStoredSidebarCollapsed(next.sidebar_collapsed)
      shell?.setCollapsed(next.sidebar_collapsed)
      setNotice({ tone: "success", text: response.message || "პარამეტრები შენახულია." })
    } catch (error) {
      setNotice({ tone: "error", text: getApiErrorMessage(error) || "პარამეტრების შენახვა ვერ მოხერხდა." })
    } finally {
      setSaving(false)
    }
  }

  return (
    <SettingsSection
      title="ინტერფეისის პარამეტრები"
      description="თემა, შეტყობინებები და გვერდითი მენიუს ხედი."
      footer={
        <Button type="button" className="h-10" disabled={!isDirty || saving} onClick={handleSave}>
          <Save className="size-4" />
          {saving ? "ინახება..." : "შენახვა"}
        </Button>
      }
    >
      <div className="space-y-2">
        <Label htmlFor="theme">თემა</Label>
        <Select value={draft.theme} onValueChange={(value) => update("theme", value === "dark" ? "dark" : "light")}>
          <SelectTrigger id="theme" className="h-10 w-full sm:w-60">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">ღია</SelectItem>
            <SelectItem value="dark">მუქი</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ToggleRow
        icon={<Bell className="text-muted-foreground size-4" />}
        title="შეტყობინებები"
        description="სისტემური შეტყობინებები"
        active={draft.notifications}
        onToggle={() => update("notifications", !draft.notifications)}
      />
      <ToggleRow
        icon={<PanelLeft className="text-muted-foreground size-4" />}
        title="კომპაქტური მენიუ"
        description="გვერდითი მენიუ ჩაკეცილი სახით"
        active={draft.sidebar_collapsed}
        onToggle={() => update("sidebar_collapsed", !draft.sidebar_collapsed)}
      />

      {notice ? <FormNotice tone={notice.tone}>{notice.text}</FormNotice> : null}
    </SettingsSection>
  )
}

function ToggleRow({ icon, title, description, active, onToggle }: {
  icon: ReactNode
  title: string
  description: string
  active: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <p className="text-sm font-medium sm:text-base">{title}</p>
          <p className="text-muted-foreground text-xs sm:text-sm">{description}</p>
        </div>
      </div>
      <Button type="button" variant={active ? "default" : "outline"} className="h-10 min-w-28" aria-pressed={active} onClick={onToggle}>
        {active ? "ჩართული" : "გამორთული"}
      </Button>
    </div>
  )
}
