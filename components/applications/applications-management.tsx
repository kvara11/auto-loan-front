"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getApiErrorMessage } from "@/lib/axios"
import { useAuthUser } from "@/lib/auth-storage"
import {
  defaultApplicationFilters,
  fetchApplicationsPage,
  listFilterSearch,
  readListFilters,
  PAGE_SIZE_OPTIONS,
  type ApplicationFilters,
} from "@/lib/applications"
import { type PageMeta } from "@/lib/pagination"
import { type ApplicationRecord } from "@/components/applications/applications-types"
import { ApplicationsFilters } from "@/components/applications/applications-filters"
import { ApplicationsTable } from "@/components/applications/applications-table"
import { TablePagination } from "@/components/shared/table-pagination"

type Query = { filters: ApplicationFilters; page: number; perPage: number }


export function ApplicationsManagement() {
  const [applications, setApplications] = useState<ApplicationRecord[]>([])
  const [meta, setMeta] = useState<PageMeta>()
  const params = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [query, setQuery] = useState<Query>(() => ({ filters: readListFilters(params), page: 1, perPage: PAGE_SIZE_OPTIONS[1] }))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | undefined>()
  // The filters follow the URL: a link or back/forward with other filters replaces them.
  const [urlKey, setUrlKey] = useState(params.toString())
  if (params.toString() !== urlKey) {
    setUrlKey(params.toString())
    setLoading(true)
    setQuery((current) => ({ ...current, page: 1, filters: readListFilters(params) }))
  }
  // UX only: the backend enforces applications.create on POST /api/applications.
  const canCreate = useAuthUser()?.permissions?.includes("applications.create") ?? false

  // Filtering and paging happen on the backend; "ძიება" or a page change reloads the page.
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
    if (next.filters) {
      const search = listFilterSearch(next.filters)
      setUrlKey(search)
      router.replace(search ? `${pathname}?${search}` : pathname, { scroll: false })
    }
    // New filters or page size start from the first page.
    setQuery((current) => ({ ...current, page: 1, ...next }))
  }

  return (
    <div className="space-y-4">
      <ApplicationsFilters
        value={query.filters}
        loading={loading}
        onSearch={(filters) => changeQuery({ filters })}
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
          <Button variant="outline" className="mt-4 h-10" onClick={() => changeQuery({ filters: defaultApplicationFilters() })}>
            ფილტრების გასუფთავება
          </Button>
        </div>
      ) : (
        <>
          <ApplicationsTable applications={applications} loading={loading} />
          {meta ? (
            <TablePagination
              meta={meta}
              sizes={PAGE_SIZE_OPTIONS}
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
