"use client"

import { useState } from "react"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PERSONAL_ID_WIDTH } from "@/lib/utils"

type ClientsFiltersProps = {
  value: string
  loading: boolean
  onSearch: (search: string) => void
}

// A draft like the other lists: nothing is requested until "ძიება" (or Enter).
export function ClientsFilters({ value, loading, onSearch }: ClientsFiltersProps) {
  const [draft, setDraft] = useState(value)
  const [synced, setSynced] = useState(value)

  // The parent applied another search (back/forward, the error card's reset): show it.
  if (value !== synced) {
    setSynced(value)
    setDraft(value)
  }

  const submit = () => onSearch(draft.trim())

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm sm:flex-row sm:items-end">
      <div className={`space-y-2 ${PERSONAL_ID_WIDTH}`}>
        <Label htmlFor="clients-search">ძებნა</Label>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="clients-search"
            type="search"
            autoComplete="off"
            maxLength={50}
            placeholder="პირადი ნომერი, სახელი ან ტელეფონი"
            className="h-10 pl-9"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && submit()}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="button" className="h-10 flex-1 sm:flex-none" disabled={loading} onClick={submit}>
          <Search className="size-4" />
          ძიება
        </Button>
        <Button type="button" variant="outline" className="h-10 flex-1 sm:flex-none" disabled={!draft && !value} onClick={() => onSearch("")}>
          გასუფთავება
        </Button>
      </div>
    </div>
  )
}
