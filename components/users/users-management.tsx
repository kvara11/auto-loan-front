"use client"

import { useEffect, useMemo, useState } from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UsersFilters } from "@/components/users/users-filters"
import { UsersTable } from "@/components/users/users-table"
import { UserFormDialog } from "@/components/users/user-form-dialog"
import { DeleteUserDialog } from "@/components/users/delete-user-dialog"
import { mockUsers } from "@/components/users/mock-users"
import { defaultFilters, type UserFilters, type UserFormInput, type UserRecord } from "@/components/users/users-types"

type FormDialogState = {
  open: boolean
  mode: "create" | "edit"
  user?: UserRecord
}

export function UsersManagement() {
  const [users, setUsers] = useState<UserRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<UserFilters>(defaultFilters)
  const [formDialog, setFormDialog] = useState<FormDialogState>({ open: false, mode: "create" })
  const [userToDelete, setUserToDelete] = useState<UserRecord | undefined>()

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setUsers(mockUsers)
      setLoading(false)
    }, 450)

    return () => window.clearTimeout(timeoutId)
  }, [])

  const filteredUsers = useMemo(() => {
    const normalizedSearch = filters.search.trim().toLowerCase()

    return users.filter((user) => {
      const fullName = `${user.first_name} ${user.last_name}`.toLowerCase()
      const matchesSearch =
        normalizedSearch.length === 0 ||
        fullName.includes(normalizedSearch) ||
        user.email.toLowerCase().includes(normalizedSearch) ||
        user.username.toLowerCase().includes(normalizedSearch)
      const matchesRole = filters.role === "all" || user.role === filters.role
      const matchesStatus = filters.status === "all" || user.status === filters.status

      return matchesSearch && matchesRole && matchesStatus
    })
  }, [filters, users])

  const handleCreateOrEdit = (value: UserFormInput) => {
    if (formDialog.mode === "edit" && formDialog.user) {
      setUsers((current) =>
        current.map((user) =>
          user.id === formDialog.user?.id
            ? {
                ...user,
                ...value,
              }
            : user
        )
      )

      return
    }

    const nextUser: UserRecord = {
      id: `u-${Date.now()}`,
      ...value,
      createdAt: new Date().toISOString(),
    }

    setUsers((current) => [nextUser, ...current])
  }

  const handleToggleStatus = (userId: string) => {
    setUsers((current) =>
      current.map((user) =>
        user.id === userId
          ? {
              ...user,
              status: user.status === "active" ? "inactive" : "active",
            }
          : user
      )
    )
  }

  const handleDelete = (userId: string) => {
    setUsers((current) => current.filter((user) => user.id !== userId))
    setUserToDelete(undefined)
  }

  return (
    <Card>
      <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <CardTitle className="text-base sm:text-lg">Users</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Manage account access, roles, and status for platform users.
          </CardDescription>
        </div>
        <Button
          type="button"
          className="h-10"
          onClick={() => setFormDialog({ open: true, mode: "create", user: undefined })}
        >
          <Plus className="size-4" />
          Create User
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        <UsersFilters value={filters} onChange={setFilters} />

        <UsersTable
          users={filteredUsers}
          loading={loading}
          onEdit={(user) => setFormDialog({ open: true, mode: "edit", user })}
          onToggleStatus={handleToggleStatus}
          onDelete={setUserToDelete}
        />
      </CardContent>

      <UserFormDialog
        open={formDialog.open}
        mode={formDialog.mode}
        initialUser={formDialog.user}
        onOpenChange={(open) => setFormDialog((current) => ({ ...current, open }))}
        onSubmit={handleCreateOrEdit}
      />

      <DeleteUserDialog
        user={userToDelete}
        open={Boolean(userToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setUserToDelete(undefined)
          }
        }}
        onConfirm={handleDelete}
      />
    </Card>
  )
}
