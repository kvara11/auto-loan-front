"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

import { KpiCard } from "@/components/dashboard-home/kpi-card"
import { type AdminSummary, fetchAdminSummary } from "@/lib/dashboard"

// For roles without loan data (administrator): user and branch counts from GET /api/dashboard/admin, plus shortcuts.
export function AdminOverview() {
  const [summary, setSummary] = useState<AdminSummary>()

  useEffect(() => {
    let active = true

    fetchAdminSummary()
      .then((result) => active && setSummary(result))
      .catch(() => active && setSummary({ users: null, branches: null }))

    return () => {
      active = false
    }
  }, [])

  const card = (label: string, count: AdminSummary["users"] | undefined) => (
    <KpiCard label={label} value={count === undefined ? "…" : (count?.total ?? "—")} hint={count ? `${count.active} აქტიური` : undefined} />
  )

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Link href="/dashboard/users" className="rounded-[14px] focus-visible:outline-2 focus-visible:outline-ring">
        {card("მომხმარებლები", summary === undefined ? undefined : summary.users)}
      </Link>
      <Link href="/dashboard/branches" className="rounded-[14px] focus-visible:outline-2 focus-visible:outline-ring">
        {card("ფილიალები", summary === undefined ? undefined : summary.branches)}
      </Link>
    </div>
  )
}
