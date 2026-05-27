"use client"

import { Edit, Power, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
        <p className="text-muted-foreground text-sm sm:text-base">Loading users...</p>
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="flex min-h-65 flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-6 text-center">
        <p className="text-base font-medium sm:text-lg">No users found</p>
        <p className="text-muted-foreground text-sm sm:text-base">
          Try adjusting filters or create a new user.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
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
                  <Button type="button" variant="outline" size="sm" onClick={() => onEdit(user)}>
                    <Edit className="size-3.5" />
                    Edit
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => onToggleStatus(user.id)}>
                    <Power className="size-3.5" />
                    {user.status === "active" ? "Deactivate" : "Activate"}
                  </Button>
                  <Button type="button" variant="destructive" size="sm" onClick={() => onDelete(user)}>
                    <Trash2 className="size-3.5" />
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
