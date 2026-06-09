"use client"

import { useEffect, useState } from "react"
import type { ReactNode } from "react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loading } from "@/components/ui/loading"
import { api, getApiErrorMessage } from "@/lib/axios"

type ApplicationDetailRecord = {
  id: string | number
  application_no?: string
  client_name?: string
  status?: string
  requested_amount?: number | string
  currency?: string
  created_at?: string
  personal_id?: string
  first_name?: string
  last_name?: string
  phone?: string
  email?: string
  address?: string
  legal_address?: string
  birth_date?: string
  loan_purpose?: string
  car_make?: string
  car_model?: string
  car_year?: number | string
  seller_price?: number | string
  market_value?: number | string
  notes?: string
}

type ApplicationDetailProps = {
  id: string
}

function formatDate(value?: string) {
  if (!value) return "-"

  return new Intl.DateTimeFormat("ka-GE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value))
}

function formatAmount(value?: number | string) {
  if (value === undefined || value === null || value === "") return "-"

  const amount = typeof value === "string" ? Number(value) : value

  return Number.isNaN(amount) ? String(value) : amount.toLocaleString("en-US")
}

export function ApplicationDetail({ id }: ApplicationDetailProps) {
  const [application, setApplication] = useState<ApplicationDetailRecord | undefined>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | undefined>()

  useEffect(() => {
    let active = true

    const loadApplication = async () => {
      try {
        const response = await api.get<ApplicationDetailRecord>(`/api/applications/${encodeURIComponent(id)}`)

        if (!active) return

        if (!response.success || !response.data) {
          setError(response.message || "Unable to load application")
          return
        }

        setApplication(response.data)
        setError(undefined)
      } catch (requestError) {
        if (!active) return

        setError(getApiErrorMessage(requestError) || "Unable to load application")
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadApplication()

    return () => {
      active = false
    }
  }, [id])

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-xl border">
        <Loading />
      </div>
    )
  }

  if (error || !application) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Application not available</CardTitle>
          <CardDescription className="text-sm sm:text-base">{error || "The selected application could not be loaded."}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Application Details</CardTitle>
        <CardDescription className="text-sm sm:text-base">Overview for application #{application.application_no ?? application.id}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DetailItem label="Status" value={<Badge variant="outline">{application.status ?? "-"}</Badge>} />
          <DetailItem label="Client Name" value={application.client_name ?? "-"} />
          <DetailItem label="Requested Amount" value={`${formatAmount(application.requested_amount)} ${application.currency ?? ""}`.trim()} />
          <DetailItem label="Created At" value={formatDate(application.created_at)} />
          <DetailItem label="Personal ID" value={application.personal_id ?? "-"} />
          <DetailItem label="Phone" value={application.phone ?? "-"} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DetailItem label="Car" value={`${application.car_make ?? "-"} ${application.car_model ?? ""}`.trim()} />
          <DetailItem label="Car Year" value={application.car_year?.toString() ?? "-"} />
          <DetailItem label="Seller Price" value={formatAmount(application.seller_price)} />
          <DetailItem label="Market Value" value={formatAmount(application.market_value)} />
          <DetailItem label="Birth Date" value={application.birth_date ?? "-"} />
          <DetailItem label="Email" value={application.email ?? "-"} />
        </div>

        {application.loan_purpose ? (
          <div>
            <p className="text-muted-foreground text-sm">Loan Purpose</p>
            <p className="text-sm sm:text-base">{application.loan_purpose}</p>
          </div>
        ) : null}

        {application.notes ? (
          <div>
            <p className="text-muted-foreground text-sm">Notes</p>
            <p className="text-sm sm:text-base whitespace-pre-wrap">{application.notes}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

function DetailItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-lg border px-4 py-3">
      <p className="text-muted-foreground text-xs uppercase tracking-wide">{label}</p>
      <div className="mt-1 text-sm sm:text-base">{value}</div>
    </div>
  )
}