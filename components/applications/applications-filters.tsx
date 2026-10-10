"use client"

import { type ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getStatusInfo, STATUS_ORDER } from "@/lib/application-status"
import { EMPTY_APPLICATION_FILTERS, type ApplicationFilters } from "@/lib/applications"

// Radix Select can't use "" as an item value.
const ALL = "all"

type ApplicationsFiltersProps = {
  value: ApplicationFilters
  onChange: (value: ApplicationFilters) => void
  // Page action shown at the right end of the bar (e.g. "ახალი განაცხადი"); first on mobile.
  action?: ReactNode
}

export function ApplicationsFilters({ value, onChange, action }: ApplicationsFiltersProps) {
  const hasFilters = value.status !== "" || value.start_date !== "" || value.end_date !== ""

  return (
    <div className="grid gap-3 rounded-xl border bg-card p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-[220px_200px_200px_auto_1fr] lg:items-end">
      <div className="space-y-2">
        <Label htmlFor="filter-status">სტატუსი</Label>
        <Select value={value.status || ALL} onValueChange={(next) => onChange({ ...value, status: next === ALL ? "" : next })}>
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

      <div className="space-y-2">
        <Label htmlFor="filter-start">შექმნის თარიღი — დან</Label>
        <Input
          id="filter-start"
          type="date"
          className="h-10"
          value={value.start_date}
          max={value.end_date || undefined}
          onChange={(event) => onChange({ ...value, start_date: event.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="filter-end">შექმნის თარიღი — მდე</Label>
        <Input
          id="filter-end"
          type="date"
          className="h-10"
          value={value.end_date}
          min={value.start_date || undefined}
          onChange={(event) => onChange({ ...value, end_date: event.target.value })}
        />
      </div>

      <Button
        type="button"
        variant="outline"
        className="h-10 sm:col-span-2 lg:col-span-1 lg:justify-self-start"
        disabled={!hasFilters}
        onClick={() => onChange(EMPTY_APPLICATION_FILTERS)}
      >
        გასუფთავება
      </Button>

      {action ? <div className="order-first sm:col-span-2 lg:order-none lg:col-span-1 lg:justify-self-end">{action}</div> : null}
    </div>
  )
}
