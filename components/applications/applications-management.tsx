"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loading } from "@/components/ui/loading"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { api, getApiErrorMessage } from "@/lib/axios"

type ApplicationRecord = {
  id: string | number
  application_no?: string
  client_name?: string
  status?: string
  requested_amount?: number | string
  currency?: string
  created_at?: string
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

function formatStatus(value?: string) {
  if (!value) return "-"

  return value.replace(/_/g, " ")
}

export function ApplicationsManagement() {
  const [applications, setApplications] = useState<ApplicationRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | undefined>()

  useEffect(() => {
    let active = true

    const loadApplications = async () => {
      try {
        const response = await api.get<{ applications?: ApplicationRecord[] } | ApplicationRecord[]>("/api/applications")

        if (!active) return

        if (!response.success) {
          setError(response.message || "Unable to load applications")
          setApplications([])
          return
        }

        const records = Array.isArray(response.data)
          ? response.data
          : response.data?.applications ?? []

        setApplications(records)
        setError(undefined)
      } catch (requestError) {
        if (!active) return

        setError(getApiErrorMessage(requestError) || "Unable to load applications")
        setApplications([])
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadApplications()

    return () => {
      active = false
    }
  }, [])

  return (
    <Card>
      <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* <div className="space-y-1">
          <CardTitle className="text-base sm:text-lg">Applications</CardTitle>
          <CardDescription className="text-sm sm:text-base">Minimal overview of loan applications.</CardDescription>
        </div> */}

        <Button asChild type="button" className="h-10">
          <Link href="/dashboard/applications/new">
            <Plus className="size-4" />
            ახალი განაცხადი
          </Link>
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex min-h-64 items-center justify-center rounded-xl border">
            <Loading />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-dashed px-6 py-10 text-center">
            <p className="text-base font-medium sm:text-lg">Something went wrong</p>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">{error}</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="rounded-xl border border-dashed px-6 py-10 text-center">
            <p className="text-base font-medium sm:text-lg">No applications found</p>
          </div>
        ) : (
          <div className="rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Application No</TableHead>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested Amount</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {applications.map((application) => (
                  <TableRow key={String(application.id)}>
                    <TableCell>{application.application_no ?? "-"}</TableCell>
                    <TableCell>{application.client_name ?? "-"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{formatStatus(application.status)}</Badge>
                    </TableCell>
                    <TableCell>{formatAmount(application.requested_amount)}</TableCell>
                    <TableCell>{application.currency ?? "-"}</TableCell>
                    <TableCell>{formatDate(application.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild type="button" variant="outline" size="sm">
                        <Link href={`/dashboard/applications/${application.id}`}>View</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}