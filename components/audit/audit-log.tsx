"use client"

import { useEffect, useState } from "react"
import { isAxiosError } from "axios"

import { AuditFilters } from "@/components/audit/audit-filters"
import { AuditTable } from "@/components/audit/audit-table"
import { TablePagination } from "@/components/shared/table-pagination"
import { Button } from "@/components/ui/button"
import { AUDIT_PAGE_SIZES, type AuditEvent, type AuditFilters as Filters, EMPTY_AUDIT_FILTERS, fetchAuditEvents } from "@/lib/audit"
import { getApiErrorMessage } from "@/lib/axios"
import { type PageMeta } from "@/lib/pagination"

type Query = { filters: Filters; page: number; perPage: number }

const INITIAL_QUERY: Query = { filters: EMPTY_AUDIT_FILTERS, page: 1, perPage: AUDIT_PAGE_SIZES[1] }

// The change log page (T-206): read-only, filtered and paged on the backend.
export function AuditLog() {
  const [events, setEvents] = useState<AuditEvent[]>([])
  const [actions, setActions] = useState<Record<string, string>>({})
  const [meta, setMeta] = useState<PageMeta>()
  const [query, setQuery] = useState<Query>(INITIAL_QUERY)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()

  useEffect(() => {
    let active = true

    fetchAuditEvents(query.filters, query.page, query.perPage)
      .then((result) => {
        if (!active) return
        if (result.events.length === 0 && result.meta.total > 0 && query.page > result.meta.last_page) {
          setQuery((current) => ({ ...current, page: result.meta.last_page }))
          return
        }
        setEvents(result.events)
        setActions(result.actions)
        setMeta(result.meta)
        setError(undefined)
        setLoading(false)
      })
      .catch((requestError) => {
        if (!active) return
        // Opened by URL without audit.view: the backend's 401 text is English.
        const forbidden = isAxiosError(requestError) && requestError.response?.status === 401
        setError(forbidden ? "ცვლილებების ჟურნალის ნახვის უფლება არ გაქვთ." : getApiErrorMessage(requestError) || "ჟურნალის ჩატვირთვა ვერ მოხერხდა")
        setEvents([])
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
      <AuditFilters value={query.filters} actions={actions} onChange={(filters) => changeQuery({ filters })} />

      {error ? (
        <div className="rounded-xl border border-dashed bg-card px-6 py-10 text-center">
          <p className="text-base font-medium text-destructive sm:text-lg">შეცდომა</p>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">{error}</p>
          <Button variant="outline" className="mt-4 h-10" onClick={() => changeQuery({ filters: EMPTY_AUDIT_FILTERS })}>
            ფილტრების გასუფთავება
          </Button>
        </div>
      ) : (
        <>
          <AuditTable events={events} loading={loading} />
          {meta ? (
            <TablePagination
              meta={meta}
              sizes={AUDIT_PAGE_SIZES}
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
