"use client"

import { type ReactNode, useState } from "react"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getStatusInfo, STATUS_ORDER } from "@/lib/application-status"
import { AttentionChip } from "@/components/applications/attention-chip"
import { defaultApplicationFilters, type ApplicationFilters } from "@/lib/applications"
import { PERSONAL_ID_WIDTH } from "@/lib/utils"

// Radix Select can't use "" as an item value.
const ALL = "all"

// A date only needs room for "dd.mm.yyyy" and the picker icon.
const DATE_FIELD = "space-y-2 sm:w-44"

type ApplicationsFiltersProps = {
  value: ApplicationFilters
  loading: boolean
  onSearch: (value: ApplicationFilters) => void
  // Page action shown at the right end of the bar (e.g. "ახალი განაცხადი"); first on mobile.
  action?: ReactNode
}

// The filters are a draft: nothing is requested until "ძიება" (or Enter in the search).
// Not a <form>: inside one, Radix Select adds a hidden native <select> that breaks the row alignment.
export function ApplicationsFilters({ value, loading, onSearch, action }: ApplicationsFiltersProps) {
  const [draft, setDraft] = useState(value)
  const [synced, setSynced] = useState(value)

  // The parent applied other filters (e.g. the error card's reset): show them.
  if (value !== synced) {
    setSynced(value)
    setDraft(value)
  }

  const set = (patch: Partial<ApplicationFilters>) => setDraft((current) => ({ ...current, ...patch }))
  const submit = () => onSearch({ ...draft, search: draft.search.trim() })
  const defaults = defaultApplicationFilters()
  const isDefault = (filters: ApplicationFilters) =>
    (Object.keys(defaults) as Array<keyof ApplicationFilters>).every((key) => filters[key] === defaults[key])

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm">
      {/* Row 1: search, and the page action at the right end (first on mobile). */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        {action ? <div className="sm:order-last">{action}</div> : null}
        <div className={`space-y-2 ${PERSONAL_ID_WIDTH}`}>
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
              value={draft.search}
              onChange={(event) => set({ search: event.target.value })}
              onKeyDown={(event) => event.key === "Enter" && submit()}
            />
          </div>
        </div>
      </div>

      {value.attention ? <AttentionChip value={value.attention} onClear={() => onSearch(defaults)} /> : null}

      {/* Row 2: status, created-date range, search and reset. Fixed widths on wider screens; full width on mobile. */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="space-y-2 sm:w-50">
          <Label htmlFor="filter-status">სტატუსი</Label>
          <Select value={draft.status || ALL} onValueChange={(next) => set({ status: next === ALL ? "" : next })}>
            <SelectTrigger id="filter-status" className="h-10 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>ყველა სტატუსი</SelectItem>
              {STATUS_ORDER.map((status) => (
                <SelectItem key={status} value={status}>
                  {getStatusInfo(status).label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className={DATE_FIELD}>
          <Label htmlFor="filter-start">შექმნის თარიღი — დან</Label>
          <Input id="filter-start" type="date" className="h-10" value={draft.start_date} max={draft.end_date || undefined} onChange={(event) => set({ start_date: event.target.value })} />
        </div>
        <div className={DATE_FIELD}>
          <Label htmlFor="filter-end">შექმნის თარიღი — მდე</Label>
          <Input id="filter-end" type="date" className="h-10" value={draft.end_date} min={draft.start_date || undefined} onChange={(event) => set({ end_date: event.target.value })} />
        </div>

        <div className="flex gap-2">
          <Button type="button" className="h-10 flex-1 sm:flex-none" disabled={loading} onClick={submit}>
            <Search className="size-4" />
            ძიება
          </Button>
          <Button type="button" variant="outline" className="h-10 flex-1 sm:flex-none" disabled={isDefault(draft) && isDefault(value)} onClick={() => onSearch(defaults)}>
            გასუფთავება
          </Button>
        </div>
      </div>
    </div>
  )
}
