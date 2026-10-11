"use client"

import { useCallback, useEffect, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { fetchAdminOverview, fetchOverview } from "@/lib/dashboard/api"
import { mockAdmin, mockOverview } from "@/lib/dashboard/mock"
import { type MockPersona } from "@/lib/dashboard/mock-series"
import { defaultRange, readQuery, readView } from "@/lib/dashboard/periods"
import { type AdminOverview, type DashboardQuery, type DashboardView, type Overview } from "@/lib/dashboard/types"
import { getApiErrorMessage } from "@/lib/axios"

// The period lives in the URL (?period=30d, or ?period=range&from=&to=); one value drives every block.
// Debug: ?view=loading|empty|error forces a state, ?mock=1 uses mock data, ?persona= picks the mock's role.
export function useDashboardParams() {
  const params = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const query = readQuery(params)

  const setQuery = useCallback((next: DashboardQuery) => {
    const search = new URLSearchParams(params.toString())
    search.set("period", next.period)
    const range = next.period === "range" ? (next.from && next.to ? next : { ...next, ...defaultRange() }) : null
    if (range) {
      search.set("from", range.from)
      search.set("to", range.to)
    } else {
      search.delete("from")
      search.delete("to")
    }
    router.replace(`${pathname}?${search.toString()}`, { scroll: false })
  }, [params, pathname, router])

  return { query, setQuery, view: readView(params), mock: params.get("mock") === "1", persona: params.get("persona") }
}

type Loaded<T> = { data?: T; error?: string; loading: boolean; updatedAt?: Date; retry: () => void }

const FORCED_ERROR = "მონაცემების განახლება ვერ მოხერხდა"

// Real data unless mocked. Data is kept per key (the query): a new period shows skeletons until it arrives,
// while a failed reload keeps the last data on screen with the error banner.
function useLoaded<T>(load: () => Promise<T>, key: string, view: DashboardView, fake: (() => T) | null): Loaded<T> {
  const [state, setState] = useState<{ key?: string; data?: T; updatedAt?: Date; error?: string; errorKey?: string }>({})
  const [attempt, setAttempt] = useState(0)
  const real = fake === null && view !== "loading"

  useEffect(() => {
    if (!real) return
    let active = true
    load()
      .then((data) => active && setState({ key, data, updatedAt: new Date() }))
      .catch((err) => active && setState((s) => ({ ...s, error: getApiErrorMessage(err) || FORCED_ERROR, errorKey: key })))
    return () => {
      active = false
    }
    // `load` is rebuilt each render; the key identifies what it loads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, attempt, real])

  const retry = useCallback(() => {
    setState((s) => ({ ...s, error: undefined, errorKey: undefined }))
    setAttempt((n) => n + 1)
  }, [])

  if (view === "loading") return { loading: true, retry }
  if (fake) return { data: fake(), loading: false, error: view === "error" ? FORCED_ERROR : undefined, updatedAt: new Date(), retry }

  const failed = state.errorKey === key
  const current = state.key === key
  return {
    data: current || failed ? state.data : undefined,
    loading: !current && !failed,
    error: view === "error" ? FORCED_ERROR : failed ? state.error : undefined,
    updatedAt: state.updatedAt,
    retry,
  }
}

export function useOverview(query: DashboardQuery, view: DashboardView, mock: boolean, persona: MockPersona) {
  const key = JSON.stringify(query)
  const fake = mock || view === "empty" ? () => mockOverview(query, persona, view === "empty") : null
  return useLoaded<Overview>(() => fetchOverview(query), key, view, fake)
}

export function useAdminOverview(view: DashboardView, mock: boolean) {
  const fake = mock || view === "empty" ? () => mockAdmin(view === "empty") : null
  return useLoaded<AdminOverview>(fetchAdminOverview, "admin", view, fake)
}
