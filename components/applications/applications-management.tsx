"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getApiErrorMessage } from "@/lib/axios"
import { useAuthUser } from "@/lib/auth-storage"
import {
  EMPTY_APPLICATION_FILTERS,
  fetchApplicationsPage,
  PAGE_SIZE_OPTIONS,
  type ApplicationFilters,
  type PageMeta,
} from "@/lib/applications"
import { type ApplicationRecord } from "@/components/applications/applications-types"
import { ApplicationsFilters } from "@/components/applications/applications-filters"
import { ApplicationsPagination } from "@/components/applications/applications-pagination"
import { ApplicationsTable } from "@/components/applications/applications-table"

type Query = { filters: ApplicationFilters; page: number; perPage: number }

const INITIAL_QUERY: Query = { filters: EMPTY_APPLICATION_FILTERS, page: 1, perPage: PAGE_SIZE_OPTIONS[1] }

export function ApplicationsManagement() {
  const [applications, setApplications] = useState<ApplicationRecord[]>([])
  const [meta, setMeta] = useState<PageMeta>()
  const [query, setQuery] = useState<Query>(INITIAL_QUERY)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | undefined>()
  // UX only: the backend enforces applications.create on POST /api/applications.
  const canCreate = useAuthUser()?.permissions?.includes("applications.create") ?? false

  // Filtering and paging happen on the backend; every change reloads the page.
  useEffect(() => {
    let active = true

    fetchApplicationsPage(query.filters, query.page, query.perPage)
      .then((result) => {
        if (!active) return
        // The page ran past the end (e.g. the list shrank): go to the last one.
        if (result.applications.length === 0 && result.meta.total > 0 && query.page > result.meta.last_page) {
          setQuery((current) => ({ ...current, page: result.meta.last_page }))
          return
        }
        setApplications(result.applications)
        setMeta(result.meta)
        setError(undefined)
        setLoading(false)
      })
      .catch((requestError) => {
        if (!active) return
        setError(getApiErrorMessage(requestError) || "განაცხადების ჩატვირთვა ვერ მოხერხდა")
        setApplications([])
        setMeta(undefined)
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [query])

  const changeQuery = (next: Partial<Query>) => {
    setLoading(true)
    // New filters or page size start from the first page.
    setQuery((current) => ({ ...current, page: 1, ...next }))
  }

  return (
    <div className="space-y-4">
      <ApplicationsFilters
        value={query.filters}
        onChange={(filters) => changeQuery({ filters })}
        action={
          canCreate ? (
            <Button asChild type="button" className="h-10 w-full sm:w-auto">
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
          <Button variant="outline" className="mt-4 h-10" onClick={() => changeQuery({ filters: EMPTY_APPLICATION_FILTERS })}>
            ფილტრების გასუფთავება
          </Button>
        </div>
      ) : (
        <>
          <ApplicationsTable applications={applications} loading={loading} />
          {meta ? (
            <ApplicationsPagination
              meta={meta}
              disabled={loading}
              onPageChange={(page) => changeQuery({ page })}
              onPerPageChange={(perPage) => changeQuery({ perPage })}
            />
          ) : null}
        </>
      )}
    </div>
  )
}
