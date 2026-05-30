"use client"

import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  defaultFilters,
  statusOptions,
  type UserFilters,
} from "@/components/users/users-types"

type UsersFiltersProps = {
  value: UserFilters
  onChange: (value: UserFilters) => void
  roles: Array<{ label: string; value: string }>
}

export function UsersFilters({ value, onChange, roles }: UsersFiltersProps) {
  const hasActiveFilters =
    value.search.trim() !== "" || value.role !== defaultFilters.role || value.status !== defaultFilters.status

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_220px_220px_auto]">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={value.search}
            onChange={(event) => onChange({ ...value, search: event.target.value })}
            placeholder="მოძებნეთ სახელით, მომხმარებლის სახელით ან ელ. ფოსტით"
            className="h-10 pl-9"
          />
        </div>

        <Select value={value.role} onValueChange={(next) => onChange({ ...value, role: next as UserFilters["role"] })}>
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">როლი</SelectItem>
            {roles.map((role) => (
              <SelectItem key={role.value} value={role.value}>
                {role.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={value.status}
          onValueChange={(next) => onChange({ ...value, status: next as UserFilters["status"] })}
        >
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">სტატუსი</SelectItem>
            {statusOptions.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="outline"
          className="h-10"
          disabled={!hasActiveFilters}
          onClick={() => onChange(defaultFilters)}
        >
          გასუფთავება
        </Button>
      </div>
    </div>
  )
}
