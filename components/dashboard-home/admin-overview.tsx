"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Building2, Users } from "lucide-react"

import { KpiCard } from "@/components/dashboard-home/kpi-card"
import { api } from "@/lib/axios"
import { API_ROUTES } from "@/lib/routes"

type Counts = { users?: number; branches?: number }

// For roles without loan data (administrator): user and branch counts plus shortcuts.
export function AdminOverview() {
  const [counts, setCounts] = useState<Counts>({})

  useEffect(() => {
    let active = true

    Promise.allSettled([
      api.get<{ users?: unknown[] }>(API_ROUTES.admin.users),
      api.get<{ branches?: unknown[] }>(API_ROUTES.admin.branches),
    ]).then(([users, branches]) => {
      if (!active) return
      setCounts({
        users: users.status === "fulfilled" ? users.value.data?.users?.length : undefined,
        branches: branches.status === "fulfilled" ? branches.value.data?.branches?.length : undefined,
      })
    })

    return () => {
      active = false
    }
  }, [])

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Link href="/dashboard/users" className="rounded-[14px] focus-visible:outline-2 focus-visible:outline-ring">
        <KpiCard label="მომხმარებლები" value={counts.users ?? "…"} hint={<Users className="size-4" aria-hidden="true" />} />
      </Link>
      <Link href="/dashboard/branches" className="rounded-[14px] focus-visible:outline-2 focus-visible:outline-ring">
        <KpiCard label="ფილიალები" value={counts.branches ?? "…"} hint={<Building2 className="size-4" aria-hidden="true" />} />
      </Link>
    </div>
  )
}
