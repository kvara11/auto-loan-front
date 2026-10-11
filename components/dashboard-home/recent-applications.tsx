import Link from "next/link"

import { type ApplicationRecord } from "@/components/applications/applications-types"
import { StatusBadge } from "@/components/applications/status-badge"
import { ApplicationRow } from "@/components/dashboard-home/application-row"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { shortName, vehicleLabel } from "@/lib/applications"
import { formatDate, formatMoney } from "@/lib/format"

// The backend sends the latest five of the user's scope.
export function RecentApplications({ applications: recent }: { applications: ApplicationRecord[] }) {

  return (
    <section className="flex flex-col gap-3.5 rounded-xl border bg-card p-4 shadow-sm sm:p-[22px]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[17px] font-semibold">ბოლო განაცხადები</h2>
        <Link href="/dashboard/applications" className="shrink-0 text-sm font-medium whitespace-nowrap text-primary hover:underline">
          ყველას ნახვა →
        </Link>
      </div>

      {recent.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">განაცხადები ვერ მოიძებნა</p>
      ) : (
        <>
          <div className="flex flex-col gap-2 md:hidden">
            {recent.map((app) => <ApplicationRow key={app.id} app={app} />)}
          </div>

          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>№</TableHead>
                  <TableHead>კლიენტი</TableHead>
                  <TableHead className="hidden lg:table-cell">ოფიცერი</TableHead>
                  <TableHead>თანხა</TableHead>
                  <TableHead className="hidden xl:table-cell">ავტომობილი</TableHead>
                  <TableHead>სტატუსი</TableHead>
                  <TableHead>თარიღი</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-semibold tabular-nums">
                      <Link href={`/dashboard/applications/${app.id}`} className="hover:underline">
                        {app.application_no || `#${app.id}`}
                      </Link>
                    </TableCell>
                    <TableCell>{app.client ? `${app.client.first_name} ${app.client.last_name}` : "—"}</TableCell>
                    <TableCell className="hidden lg:table-cell">{shortName(app.officer)}</TableCell>
                    <TableCell className="tabular-nums">{formatMoney(app.requested_amount, app.currency)}</TableCell>
                    <TableCell className="hidden xl:table-cell">{vehicleLabel(app)}</TableCell>
                    <TableCell><StatusBadge status={app.status} short /></TableCell>
                    <TableCell className="text-[13px] text-muted-foreground tabular-nums">{formatDate(app.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </section>
  )
}
