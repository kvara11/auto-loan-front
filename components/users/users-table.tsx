"use client"

import { Edit, Power } from "lucide-react"

import { UserAvatar } from "@/components/dashboard/user-avatar"
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
import { ResetPasswordDialog } from "@/components/users/reset-password-dialog"
import { type UserRecord } from "@/components/users/users-types"

type UsersTableProps = {
  users: UserRecord[]
  loading: boolean
  onEdit: (user: UserRecord) => void
  onToggleStatus: (userId: string) => void
  togglingUserId?: string
}

function formatDate(value: string) {
  if (!value) {
    return "-"
  }

  return new Intl.DateTimeFormat("ka-GE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value))
}

function formatRole(value: string) {
  return value.replace(/-/g, " ")
}

function formatStatus(value: string) {
  return value === "active" ? "აქტიური" : "გაუქმებული"
}

export function UsersTable({ users, loading, onEdit, onToggleStatus, togglingUserId }: UsersTableProps) {
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
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>მომხმარებელი</TableHead>
            <TableHead>როლი</TableHead>
            <TableHead className="hidden md:table-cell">ფილიალი</TableHead>
            <TableHead>სტატუსი</TableHead>
            <TableHead>შექმნის დრო</TableHead>
            <TableHead className="text-right">ოპერირება</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center gap-2.5">
                  <UserAvatar user={{ first_name: user.first_name, last_name: user.last_name, avatar_url: user.avatarUrl }} className="size-8" fallbackClassName="text-xs" />
                  <div className="min-w-0">
                    <p className="font-medium">{user.first_name} {user.last_name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>{user.roleDisplayName ?? formatRole(user.role)}</TableCell>
              <TableCell className="hidden md:table-cell">{user.branchName ?? "—"}</TableCell>
              <TableCell>
                <Badge variant={user.status === "active" ? "success" : "inactive"}>
                  {formatStatus(user.status)}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(user.created_at)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-9"
                    aria-label="რედაქტირება"
                    title="რედაქტირება"
                    onClick={() => onEdit(user)}
                    disabled={user.status !== "active"}
                  >
                    <Edit className="size-3.5" />
                  </Button>
                  {/* The backend refuses a super-admin (CANNOT_EDIT_SUPER_ADMIN). */}
                  {user.role === "super-admin" ? null : <ResetPasswordDialog user={user} />}
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => onToggleStatus(user.id)}
                    aria-label={user.status === "active" ? "გაუქმება" : "აღდგენა"}
                    title={user.status === "active" ? "გაუქმება" : "აღდგენა"}
                    disabled={togglingUserId === user.id}
                    className={`size-9 ${user.status === "active" ? "text-destructive hover:text-destructive" : "text-success hover:text-success"}`}
                  >
                    <Power className="size-3.5" />
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
