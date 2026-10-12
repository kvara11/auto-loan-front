"use client"

import Link from "next/link"
import { Eye } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Loading } from "@/components/ui/loading"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { clientName, type Client } from "@/lib/clients"
import { formatDate } from "@/lib/format"

type ClientsTableProps = {
  clients: Client[]
  loading: boolean
  // An empty search result reads differently from an empty registry.
  searched: boolean
}

export function ClientsTable({ clients, loading, searched }: ClientsTableProps) {
  if (loading) {
    return (
      <div className="flex min-h-65 items-center justify-center rounded-xl border bg-card shadow-sm">
        <Loading />
      </div>
    )
  }

  if (clients.length === 0) {
    return (
      <div className="flex min-h-65 flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-card px-6 text-center">
        <p className="text-base font-medium sm:text-lg">{searched ? "კლიენტი ვერ მოიძებნა" : "კლიენტები ჯერ არ არის"}</p>
        <p className="text-sm text-muted-foreground">კლიენტი რეგისტრირდება ახალი განაცხადის პირველ ნაბიჯზე.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>კლიენტი</TableHead>
            <TableHead className="hidden sm:table-cell">ტელეფონი</TableHead>
            <TableHead className="hidden md:table-cell">ელ-ფოსტა</TableHead>
            {/* Counted within the viewer's own application scope. */}
            <TableHead className="text-center" title="თქვენთვის ხილული განაცხადები">განაცხადები</TableHead>
            <TableHead className="hidden lg:table-cell">ბოლო განაცხადი</TableHead>
            <TableHead className="hidden xl:table-cell">რეგისტრაცია</TableHead>
            <TableHead className="text-right">ოპერირება</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id}>
              <TableCell>
                <div className="flex flex-col whitespace-normal">
                  <span className="font-medium">{clientName(client)}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">{client.personal_id}</span>
                </div>
              </TableCell>
              <TableCell className="hidden tabular-nums sm:table-cell">{client.phone || "—"}</TableCell>
              <TableCell className="hidden max-w-60 truncate text-muted-foreground md:table-cell">{client.email || "—"}</TableCell>
              <TableCell className="text-center font-semibold tabular-nums">{client.applications_count ?? 0}</TableCell>
              <TableCell className="hidden text-muted-foreground tabular-nums lg:table-cell">{formatDate(client.last_application_at)}</TableCell>
              <TableCell className="hidden text-muted-foreground tabular-nums xl:table-cell">{formatDate(client.created_at)}</TableCell>
              <TableCell className="text-right">
                <Button asChild variant="outline" size="icon" className="size-9" title="კლიენტის გვერდი">
                  <Link href={`/dashboard/clients/${client.id}`} aria-label="კლიენტის გვერდი">
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
