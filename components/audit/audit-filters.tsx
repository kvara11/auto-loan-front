"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DebouncedSearch } from "@/components/shared/debounced-search"
import { type AuditFilters as Filters, EMPTY_AUDIT_FILTERS, SUBJECT_TYPE_LABELS } from "@/lib/audit"

// Radix Select can't use "" as an item value.
const ALL = "all"

type AuditFiltersProps = {
  value: Filters
  actions: Record<string, string>
  onChange: (value: Filters) => void
}

export function AuditFilters({ value, actions, onChange }: AuditFiltersProps) {
  const hasFilters = Object.values(value).some((item) => item !== "")
  const set = (patch: Partial<Filters>) => onChange({ ...value, ...patch })

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm">
      <div className="w-full max-w-sm">
        <DebouncedSearch
          id="audit-search"
          label="ძებნა"
          placeholder="ობიექტი ან მომხმარებლის სახელი"
          maxLength={100}
          value={value.search}
          onChange={(search) => set({ search })}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <FilterSelect id="audit-action" label="ქმედება" className="sm:w-64" value={value.action} all="ყველა ქმედება" options={actions} onChange={(action) => set({ action })} />
        <FilterSelect id="audit-type" label="ობიექტის ტიპი" className="sm:w-44" value={value.subject_type} all="ყველა ტიპი" options={SUBJECT_TYPE_LABELS} onChange={(subject_type) => set({ subject_type })} />

        <div className="space-y-2 sm:w-44">
          <Label htmlFor="audit-start">თარიღი — დან</Label>
          <Input id="audit-start" type="date" className="h-10" value={value.start_date} max={value.end_date || undefined} onChange={(event) => set({ start_date: event.target.value })} />
        </div>
        <div className="space-y-2 sm:w-44">
          <Label htmlFor="audit-end">თარიღი — მდე</Label>
          <Input id="audit-end" type="date" className="h-10" value={value.end_date} min={value.start_date || undefined} onChange={(event) => set({ end_date: event.target.value })} />
        </div>

        <Button type="button" variant="outline" className="h-10" disabled={!hasFilters} onClick={() => onChange(EMPTY_AUDIT_FILTERS)}>
          გასუფთავება
        </Button>
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
