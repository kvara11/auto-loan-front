"use client"

import Link from "next/link"
import { Eye } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Loading } from "@/components/ui/loading"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { type ApplicationRecord } from "@/components/applications/applications-types"
import { StatusBadge } from "@/components/applications/status-badge"
import { shortName } from "@/lib/applications"
import { formatDate, formatMoney } from "@/lib/format"

type ApplicationsTableProps = {
  applications: ApplicationRecord[]
  loading: boolean
}

export function ApplicationsTable({
  applications,
  loading,
}: ApplicationsTableProps) {
  if (loading) {
    return (
      <div className="flex min-h-65 items-center justify-center rounded-xl border bg-card shadow-sm">
        <Loading />
      </div>
    )
  }

  if (applications.length === 0) {
    return (
      <div className="flex min-h-65 flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-card px-6 text-center">
        <p className="text-base font-medium sm:text-lg">განაცხადები ვერ მოიძებნა</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[120px]">განაცხადი #</TableHead>
            <TableHead>კლიენტი</TableHead>
            <TableHead>თანხა</TableHead>
            <TableHead className="hidden md:table-cell">ვადა / %</TableHead>
            <TableHead className="hidden lg:table-cell">ავტომობილი</TableHead>
            <TableHead>LTV</TableHead>
            <TableHead>სტატუსი</TableHead>
            <TableHead className="hidden w-px px-2 xl:table-cell">თარიღი</TableHead>
            <TableHead className="text-right">ოპერირება</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((app) => (
            <TableRow key={app.id}>
              <TableCell className="font-semibold tabular-nums">
                {app.application_no || app.id}
              </TableCell>
              <TableCell>
                {/* Long officer / branch lines wrap instead of widening the table. */}
                <div className="flex flex-col xl:max-w-60 xl:whitespace-normal">
                  <span className="font-medium">
                    {app.client.first_name} {app.client.last_name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ოფიცერი: {shortName(app.officer)}
                    {app.branch ? ` · ${app.branch.name}` : ""}
                  </span>
                </div>
              </TableCell>
              <TableCell className="font-semibold tabular-nums">
                {formatMoney(app.requested_amount, app.currency)}
              </TableCell>
              <TableCell className="hidden text-muted-foreground md:table-cell">
                <div className="flex flex-col tabular-nums">
                  <span>{app.loan_term_months} თვე</span>
                  <span className="text-xs">{app.annual_interest_rate}%</span>
                </div>
              </TableCell>
              <TableCell className="hidden text-muted-foreground lg:table-cell">
                <div className="flex flex-col">
                  <span className="text-foreground">{app.car_make} / {app.car_model}</span>
                  <span className="text-xs tabular-nums">{app.car_year} წ.</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5">
                  <span className={`font-semibold tabular-nums ${app.ltv_warning ? "text-destructive" : ""}`}>
                    {Number(app.ltv) > 0 ? `${app.ltv}%` : "—"}
                  </span>
                  {app.ltv_warning && (
                    <span className="size-1.5 animate-pulse rounded-full bg-destructive" title={app.ltv_warning} />
                  )}
                </div>
              </TableCell>
              <TableCell>
                <StatusBadge status={app.status} short />
              </TableCell>
              <TableCell className="hidden px-2 text-xs text-muted-foreground tabular-nums xl:table-cell">
                {formatDate(app.created_at)}
              </TableCell>
              <TableCell className="text-right">
                <Button asChild variant="outline" size="icon" className="size-9" title="დეტალები">
                  <Link href={`/dashboard/applications/${app.id}`} aria-label="დეტალები">
                    <Eye className="size-4" />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
