"use client"

import { useSyncExternalStore } from "react"
import { Moon, Sun } from "lucide-react"

import { updatePreferences } from "@/lib/settings"
import { applyTheme, getStoredTheme, setStoredTheme, subscribePreferenceChanges, type ThemeMode } from "@/lib/ui-preferences"
import { cn } from "@/lib/utils"

const OPTIONS: { value: ThemeMode; label: string; Icon: typeof Sun }[] = [
  { value: "light", label: "ღია თემა", Icon: Sun },
  { value: "dark", label: "მუქი თემა", Icon: Moon },
]

// Applies the theme at once and saves it as the user's preference (best effort).
export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribePreferenceChanges, () => getStoredTheme() ?? "light", () => "light")

  const choose = (next: ThemeMode) => {
    if (next === theme) return
    applyTheme(next)
    setStoredTheme(next)
    void updatePreferences({ theme: next }).catch(() => undefined)
  }

  return (
    <div role="group" aria-label="თემა" className="inline-flex rounded-[10px] bg-muted p-[3px]">
      {OPTIONS.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          aria-label={label}
          aria-pressed={theme === value}
          title={label}
          onClick={() => choose(value)}
          className={cn(
            "inline-flex size-9 items-center justify-center rounded-[7px] text-muted-foreground transition-colors",
            "hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring",
            theme === value && "bg-card text-foreground shadow-sm"
          )}
        >
          <Icon className="size-4" />
        </button>
      ))}
    </div>
  )
}
