"use client"

import { Edit, Power, Trash2 } from "lucide-react"

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
import { type UserRecord } from "@/components/users/users-types"

type UsersTableProps = {
  users: UserRecord[]
  loading: boolean
  onEdit: (user: UserRecord) => void
  onToggleStatus: (userId: string) => void
  onDelete: (user: UserRecord) => void
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value))
}

export function UsersTable({ users, loading, onEdit, onToggleStatus, onDelete }: UsersTableProps) {
  if (loading) {
    return (
      <div className="flex min-h-65 items-center justify-center rounded-xl border">
        <Loading />
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="flex min-h-65 flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-6 text-center">
        <p className="text-base font-medium sm:text-lg">მომხმარებელი ვერ მოიძებნა</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>სახელი</TableHead>
            <TableHead>გვარი</TableHead>
            <TableHead>იმეილი</TableHead>
            <TableHead>როლი</TableHead>
            <TableHead>სტატუსი</TableHead>
            <TableHead>შექმნის დრო</TableHead>
            <TableHead className="text-right">ოპერირება</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.first_name} {user.last_name}</TableCell>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell className="capitalize">{user.role}</TableCell>
              <TableCell>
                <Badge variant={user.status === "active" ? "success" : "inactive"} className="capitalize">
                  {user.status}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(user.createdAt)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" className="bg-yellow-100" size="sm" onClick={() => onEdit(user)}>
                    <Edit className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onToggleStatus(user.id)}
                    aria-label={user.status === "active" ? "Deactivate user" : "Activate user"}
                    className={`${user.status === "active" ? "bg-red-100" : "bg-green-100"}`}
                  >
                    <Power className='size-3.5 text-back' />
                  </Button>
                  {/* <Button type="button" variant="destructive" size="sm" onClick={() => onDelete(user)} aria-label="Delete user">
                    <Trash2 className="size-3.5" />
                  </Button> */}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
