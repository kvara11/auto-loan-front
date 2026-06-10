"use client"

import { Eye } from "lucide-react"

import { Badge } from "@/components/ui/badge"
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

type ApplicationsTableProps = {
  applications: ApplicationRecord[]
  loading: boolean
  onView: (application: ApplicationRecord) => void
}

function formatDate(value: string) {
  if (!value) return "-"
  return new Intl.DateTimeFormat("ka-GE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value))
}

function formatAmount(value: number | string, currency: string) {
  const amount = typeof value === "string" ? Number(value) : value
  if (Number.isNaN(amount)) return `${value} ${currency}`
  return `${amount.toLocaleString("en-US")} ${currency}`
}

export function ApplicationsTable({
  applications,
  loading,
  onView,
}: ApplicationsTableProps) {
  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-xl border">
        <Loading />
      </div>
    )
  }

  if (applications.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-6 text-center">
        <p className="text-base font-medium sm:text-lg">განაცხადები ვერ მოიძებნა</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
            <TableHead className="w-[120px]">განაცხადი #</TableHead>
            <TableHead>კლიენტი</TableHead>
            <TableHead>თანხა</TableHead>
            <TableHead className="hidden md:table-cell">ვადა / %</TableHead>
            <TableHead className="hidden lg:table-cell">ავტომობილი</TableHead>
            <TableHead>LTV</TableHead>
            <TableHead>სტატუსი</TableHead>
            <TableHead className="hidden xl:table-cell">თარიღი</TableHead>
            <TableHead className="text-right">ოპერირება</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((app) => (
            <TableRow key={app.id} className="group transition-colors">
              <TableCell className="font-medium text-slate-900">
                {app.application_no || app.id}
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">
                    {app.client.first_name} {app.client.last_name}
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-tight">
                    ოფიცერი: {app.officer.first_name} {app.officer.last_name}
                  </span>
                </div>
              </TableCell>
              <TableCell className="font-bold">
                {formatAmount(app.requested_amount, app.currency)}
              </TableCell>
              <TableCell className="hidden md:table-cell text-slate-600">
                <div className="flex flex-col">
                  <span>{app.loan_term_months} თვე</span>
                  <span className="text-xs font-medium text-slate-400">{app.annual_interest_rate}%</span>
                </div>
              </TableCell>
              <TableCell className="hidden lg:table-cell text-slate-600">
                <div className="flex flex-col">
                  <span className="text-sm">{app.car_make} / {app.car_model}</span>
                  <span className="text-xs text-slate-400">{app.car_year} წ.</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5">
                  <span className={`font-bold ${app.ltv_warning ? 'text-red-500' : 'text-slate-700'}`}>
                    {app.ltv}%
                  </span>
                  {app.ltv_warning && (
                    <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" title={app.ltv_warning} />
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge 
                  variant={app.status === "Draft" ? "outline" : "default"}
                  className={`
                    ${app.status === "Draft" ? "bg-slate-50" : ""}
                    ${app.status === "Approved" ? "bg-green-100 text-green-800 border-green-200" : ""}
                    ${app.status === "Rejected" ? "bg-red-100 text-red-800 border-red-200" : ""}
                  `}
                >
                  {app.status}
                </Badge>
              </TableCell>
              <TableCell className="hidden xl:table-cell text-slate-500 text-xs">
                {formatDate(app.created_at)}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onView(app)}
                  className="h-8 w-8 p-0 cursor-pointer"
                  title="დეტალები"
                >
                  <Eye className="size-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
