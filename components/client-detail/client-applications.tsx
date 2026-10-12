"use client"

import { useEffect, useState } from "react"

import { type ApplicationRecord } from "@/components/applications/applications-types"
import { ApplicationsTable } from "@/components/applications/applications-table"
import { TablePagination } from "@/components/shared/table-pagination"
import { EMPTY_APPLICATION_FILTERS, fetchApplicationsPage } from "@/lib/applications"
import { getApiErrorMessage } from "@/lib/axios"
import { type PageMeta } from "@/lib/pagination"

const SIZES = [5, 10, 20]

type Query = { page: number; perPage: number }

// The client's applications that the viewer may see (GET /api/applications?client_id=, same scope as the list).
export function ClientApplications({ clientId }: { clientId: number }) {
  const [applications, setApplications] = useState<ApplicationRecord[]>([])
  const [meta, setMeta] = useState<PageMeta>()
  const [query, setQuery] = useState<Query>({ page: 1, perPage: SIZES[0] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()

  useEffect(() => {
    let active = true

    fetchApplicationsPage(EMPTY_APPLICATION_FILTERS, query.page, query.perPage, { client_id: clientId })
      .then((result) => {
        if (!active) return
        setApplications(result.applications)
        setMeta(result.meta)
        setError(undefined)
      })
      .catch((err) => active && setError(getApiErrorMessage(err) || "განაცხადების ჩატვირთვა ვერ მოხერხდა"))
      .finally(() => active && setLoading(false))

    return () => {
      active = false
    }
  }, [clientId, query])

  const changeQuery = (next: Partial<Query>) => {
    setLoading(true)
    setQuery((current) => ({ ...current, page: 1, ...next }))
  }

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-[17px] font-semibold">განაცხადები</h2>
        <p className="mt-0.5 text-[13px] text-muted-foreground">ნაჩვენებია მხოლოდ თქვენთვის ხილული განაცხადები.</p>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>
      ) : !loading && applications.length === 0 ? (
        <div className="flex min-h-32 items-center justify-center rounded-xl border border-dashed bg-card px-6 text-center text-sm text-muted-foreground">
          ამ კლიენტს თქვენთვის ხილული განაცხადი არ აქვს.
        </div>
      ) : (
        <>
          <ApplicationsTable applications={applications} loading={loading} />
          {meta ? (
            <TablePagination
              meta={meta}
              sizes={SIZES}
              disabled={loading}
              onPageChange={(page) => changeQuery({ page })}
              onPerPageChange={(perPage) => changeQuery({ perPage })}
            />
          ) : null}
        </>
      )}
    </section>
  )
}
