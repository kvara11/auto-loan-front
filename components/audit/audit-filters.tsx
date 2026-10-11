"use client"

import { useState } from "react"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type AuditFilters as Filters, defaultAuditFilters, SUBJECT_TYPE_LABELS } from "@/lib/audit"

// Radix Select can't use "" as an item value.
const ALL = "all"

type AuditFiltersProps = {
  value: Filters
  actions: Record<string, string>
  loading: boolean
  onSearch: (value: Filters) => void
}

// The filters are a draft: nothing is requested until "ძიება" (or Enter in the search).
// Not a <form>: inside one, Radix Select adds a hidden native <select> that breaks the row alignment.
export function AuditFilters({ value, actions, loading, onSearch }: AuditFiltersProps) {
  const [draft, setDraft] = useState(value)
  const [synced, setSynced] = useState(value)

  // The parent applied other filters (e.g. the error card's reset): show them.
  if (value !== synced) {
    setSynced(value)
    setDraft(value)
  }

  const set = (patch: Partial<Filters>) => setDraft((current) => ({ ...current, ...patch }))
  const defaults = defaultAuditFilters()
  const isDefault = (filters: Filters) => (Object.keys(defaults) as Array<keyof Filters>).every((key) => filters[key] === defaults[key])

  const submit = () => onSearch({ ...draft, search: draft.search.trim() })

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm">
      <div className="w-full max-w-sm space-y-2">
        <Label htmlFor="audit-search">ძებნა</Label>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="audit-search"
            type="search"
            autoComplete="off"
            maxLength={100}
            placeholder="ობიექტი ან მომხმარებლის სახელი"
            className="h-10 pl-9"
            value={draft.search}
            onChange={(event) => set({ search: event.target.value })}
            onKeyDown={(event) => event.key === "Enter" && submit()}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <FilterSelect id="audit-action" label="ქმედება" className="sm:w-64" value={draft.action} all="ყველა ქმედება" options={actions} onChange={(action) => set({ action })} />
        <FilterSelect id="audit-type" label="ობიექტის ტიპი" className="sm:w-44" value={draft.subject_type} all="ყველა ტიპი" options={SUBJECT_TYPE_LABELS} onChange={(subject_type) => set({ subject_type })} />

        <div className="space-y-2 sm:w-44">
          <Label htmlFor="audit-start">თარიღი — დან</Label>
          <Input id="audit-start" type="date" className="h-10" value={draft.start_date} max={draft.end_date || undefined} onChange={(event) => set({ start_date: event.target.value })} />
        </div>
        <div className="space-y-2 sm:w-44">
          <Label htmlFor="audit-end">თარიღი — მდე</Label>
          <Input id="audit-end" type="date" className="h-10" value={draft.end_date} min={draft.start_date || undefined} onChange={(event) => set({ end_date: event.target.value })} />
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

type FilterSelectProps = {
  id: string
  label: string
  className: string
  value: string
  all: string
  options: Record<string, string>
  onChange: (value: string) => void
}

function FilterSelect({ id, label, className, value, all, options, onChange }: FilterSelectProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={id}>{label}</Label>
      <Select value={value || ALL} onValueChange={(next) => onChange(next === ALL ? "" : next)}>
        <SelectTrigger id={id} className="h-10 w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{all}</SelectItem>
          {Object.entries(options).map(([key, text]) => (
            <SelectItem key={key} value={key}>
              {text}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
