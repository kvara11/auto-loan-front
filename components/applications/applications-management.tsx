"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getApiErrorMessage } from "@/lib/axios"
import { useAuthUser } from "@/lib/auth-storage"
import { EMPTY_APPLICATION_FILTERS, fetchApplications, type ApplicationFilters } from "@/lib/applications"
import { type ApplicationRecord } from "@/components/applications/applications-types"
import { ApplicationsFilters } from "@/components/applications/applications-filters"
import { ApplicationsTable } from "@/components/applications/applications-table"

export function ApplicationsManagement() {
  const [applications, setApplications] = useState<ApplicationRecord[]>([])
  const [filters, setFilters] = useState<ApplicationFilters>(EMPTY_APPLICATION_FILTERS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | undefined>()
  // UX only: the backend enforces applications.create on POST /api/applications.
  const canCreate = useAuthUser()?.permissions?.includes("applications.create") ?? false

  // Filtering happens on the backend; every change reloads the list.
  useEffect(() => {
    let active = true

    fetchApplications(filters)
      .then((records) => {
        if (!active) return
        setApplications(records)
        setError(undefined)
      })
      .catch((requestError) => {
        if (!active) return
        setError(getApiErrorMessage(requestError) || "განაცხადების ჩატვირთვა ვერ მოხერხდა")
        setApplications([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [filters])

  const changeFilters = (next: ApplicationFilters) => {
    setLoading(true)
    setFilters(next)
  }

  return (
    <div className="space-y-4">
      <ApplicationsFilters
        value={filters}
        onChange={changeFilters}
        action={
          canCreate ? (
            <Button asChild type="button" className="h-10 w-full lg:w-auto">
              <Link href="/dashboard/applications/new">
                <Plus className="size-4" />
                ახალი განაცხადი
              </Link>
            </Button>
          ) : null
        }
      />

      {error ? (
        <div className="rounded-xl border border-dashed bg-card px-6 py-10 text-center">
          <p className="text-base font-medium text-destructive sm:text-lg">შეცდომა</p>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">{error}</p>
          <Button variant="outline" className="mt-4 h-10" onClick={() => changeFilters(EMPTY_APPLICATION_FILTERS)}>
            ფილტრების გასუფთავება
          </Button>
        </div>
      ) : (
        <ApplicationsTable applications={applications} loading={loading} />
      )}
    </div>
  )
}
