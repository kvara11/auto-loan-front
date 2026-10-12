"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { ClientsFilters } from "@/components/clients/clients-filters"
import { ClientsTable } from "@/components/clients/clients-table"
import { TablePagination } from "@/components/shared/table-pagination"
import { PAGE_SIZE_OPTIONS } from "@/lib/applications"
import { clientsErrorMessage, fetchClientsPage, type Client } from "@/lib/clients"
import { type PageMeta } from "@/lib/pagination"

type Query = { search: string; page: number; perPage: number }

// The whole client registry (Q-17), newest first; the search lives in the URL (?search=) so back/refresh keep it.
export function ClientsManagement() {
  const params = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [clients, setClients] = useState<Client[]>([])
  const [meta, setMeta] = useState<PageMeta>()
  const [query, setQuery] = useState<Query>(() => ({ search: params.get("search") ?? "", page: 1, perPage: PAGE_SIZE_OPTIONS[1] }))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()
  // Back/forward to another search replaces it.
  const [urlSearch, setUrlSearch] = useState(params.get("search") ?? "")
  if ((params.get("search") ?? "") !== urlSearch) {
    setUrlSearch(params.get("search") ?? "")
    setLoading(true)
    setQuery((current) => ({ ...current, page: 1, search: params.get("search") ?? "" }))
  }

  useEffect(() => {
    let active = true

    fetchClientsPage(query.search, query.page, query.perPage)
      .then((result) => {
        if (!active) return
        // The page ran past the end: go to the last one.
        if (result.clients.length === 0 && result.meta.total > 0 && query.page > result.meta.last_page) {
          setQuery((current) => ({ ...current, page: result.meta.last_page }))
          return
        }
        setClients(result.clients)
        setMeta(result.meta)
        setError(undefined)
        setLoading(false)
      })
      .catch((requestError) => {
        if (!active) return
        setError(clientsErrorMessage(requestError, "კლიენტების ჩატვირთვა ვერ მოხერხდა"))
        setClients([])
        setMeta(undefined)
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [query])

  const changeQuery = (next: Partial<Query>) => {
    setLoading(true)
    if (next.search !== undefined) {
      setUrlSearch(next.search)
      router.replace(next.search ? `${pathname}?${new URLSearchParams({ search: next.search })}` : pathname, { scroll: false })
    }
    // A new search or page size starts from the first page.
    setQuery((current) => ({ ...current, page: 1, ...next }))
  }

  return (
    <div className="space-y-4">
      <ClientsFilters value={query.search} loading={loading} onSearch={(search) => changeQuery({ search })} />

      {error ? (
        <div className="rounded-xl border border-dashed bg-card px-6 py-10 text-center">
          <p className="text-base font-medium text-destructive sm:text-lg">შეცდომა</p>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">{error}</p>
          {query.search ? (
            <Button variant="outline" className="mt-4 h-10" onClick={() => changeQuery({ search: "" })}>
              ძებნის გასუფთავება
            </Button>
          ) : null}
        </div>
      ) : (
        <>
          <ClientsTable clients={clients} loading={loading} searched={query.search !== ""} />
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
