"use client"

import { useEffect, useState } from "react"
import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const DEBOUNCE_MS = 350

type ApplicationsSearchProps = {
  value: string
  onChange: (value: string) => void
}

// Personal ID search: applies after a short pause in typing, so each keystroke doesn't reload the list.
export function ApplicationsSearch({ value, onChange }: ApplicationsSearchProps) {
  const [text, setText] = useState(value)
  const [synced, setSynced] = useState(value)

  // The parent changed the value (e.g. "გასუფთავება"): show it.
  if (value !== synced) {
    setSynced(value)
    setText(value)
  }

  useEffect(() => {
    const next = text.trim()
    if (next === value) return

    const timer = setTimeout(() => {
      setSynced(next)
      onChange(next)
    }, DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [text, value, onChange])

  return (
    <div className="space-y-2">
      <Label htmlFor="filter-search">პირადი ნომერი</Label>
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="filter-search"
          type="search"
          inputMode="numeric"
          autoComplete="off"
          maxLength={50}
          placeholder="კლიენტის პირადი ნომერი"
          className="h-10 pl-9 tabular-nums"
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
      </div>
    </div>
  )
}
