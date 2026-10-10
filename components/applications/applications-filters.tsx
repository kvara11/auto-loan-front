"use client"

import { type ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ApplicationsSearch } from "@/components/applications/applications-search"
import { getStatusInfo, STATUS_ORDER } from "@/lib/application-status"
import { EMPTY_APPLICATION_FILTERS, type ApplicationFilters } from "@/lib/applications"
import { PERSONAL_ID_WIDTH } from "@/lib/utils"

// Radix Select can't use "" as an item value.
const ALL = "all"

// A date only needs room for "dd.mm.yyyy" and the picker icon.
const DATE_FIELD = "space-y-2 sm:w-44"

type ApplicationsFiltersProps = {
  value: ApplicationFilters
  onChange: (value: ApplicationFilters) => void
  // Page action shown at the right end of the bar (e.g. "ახალი განაცხადი"); first on mobile.
  action?: ReactNode
}

export function ApplicationsFilters({ value, onChange, action }: ApplicationsFiltersProps) {
  const hasFilters = Object.values(value).some((item) => item !== "")

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm">
      {/* Row 1: search, and the page action at the right end (first on mobile). */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        {action ? <div className="sm:order-last">{action}</div> : null}
        <div className={PERSONAL_ID_WIDTH}>
          <ApplicationsSearch value={value.search} onChange={(search) => onChange({ ...value, search })} />
        </div>
      </div>

      {/* Row 2: status, created-date range, reset. Fixed widths on wider screens; full width on mobile. */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="space-y-2 sm:w-50">
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

        <div className={DATE_FIELD}>
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

        <div className={DATE_FIELD}>
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

        <Button type="button" variant="outline" className="h-10" disabled={!hasFilters} onClick={() => onChange(EMPTY_APPLICATION_FILTERS)}>
          გასუფთავება
        </Button>
      </div>
    </div>
  )
}
