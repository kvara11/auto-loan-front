"use client"

import { useEffect, useMemo, useState } from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { UsersFilters } from "@/components/users/users-filters"
import { UsersTable } from "@/components/users/users-table"
import { UserFormDialog } from "@/components/users/user-form-dialog"
import { DeleteUserDialog } from "@/components/users/delete-user-dialog"
import { defaultFilters, type UserFilters, type UserFormInput, type UserRecord } from "@/components/users/users-types"
import { api } from "@/lib/axios"
import { API_ROUTES } from "@/lib/routes"

type AdminUserResponse = {
  id: number
  first_name: string
  last_name: string
  username: string
  email: string
  role: {
    id: number
    name: string
    display_name: string
  }
  active: boolean
  created_at: string
}

type AdminRoleResponse = {
  id: number
  name: string
  display_name: string
  permissions: string[]
}

type RoleOption = {
  label: string
  value: string
}

function toUserRecord(user: AdminUserResponse): UserRecord {
  return {
    id: String(user.id),
    first_name: user.first_name,
    last_name: user.last_name,
    username: user.username,
    email: user.email,
    password: "",
    role: user.role.name,
    roleDisplayName: user.role.display_name,
    status: user.active ? "active" : "inactive",
    created_at: user.created_at,
  }
}

function toRoleOption(role: AdminRoleResponse): RoleOption {
  return {
    label: role.display_name,
    value: role.name,
  }
}

function getRoleDisplayName(value: string, roles: RoleOption[]) {
  return roles.find((role) => role.value === value)?.label ?? value.replace(/-/g, " ")
}

type FormDialogState = {
  open: boolean
  mode: "create" | "edit"
  user?: UserRecord
}

const PAGE_SIZE_OPTIONS = [10, 20, 50]

export function UsersManagement() {
  const [users, setUsers] = useState<UserRecord[]>([])
  const [roles, setRoles] = useState<RoleOption[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<UserFilters>(defaultFilters)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [togglingUserId, setTogglingUserId] = useState<string | undefined>()
  const [formDialog, setFormDialog] = useState<FormDialogState>({ open: false, mode: "create" })
  const [userToDelete, setUserToDelete] = useState<UserRecord | undefined>()

  useEffect(() => {
    let isMounted = true

    const loadUsers = async () => {
      const [usersResult, rolesResult] = await Promise.allSettled([
        api.get<{ users: AdminUserResponse[] }>(API_ROUTES.admin.users),
        api.get<AdminRoleResponse[]>(API_ROUTES.admin.roles),
      ])

      if (!isMounted) {
        return
      }

      if (usersResult.status === "fulfilled") {
        setUsers((usersResult.value.data?.users ?? []).map(toUserRecord))
      }

      if (rolesResult.status === "fulfilled") {
        setRoles((rolesResult.value.data ?? []).map(toRoleOption))
      }

      setLoading(false)
    }

    loadUsers()

    return () => {
      isMounted = false
    }
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

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const startIndex = (safeCurrentPage - 1) * pageSize
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + pageSize)

  const handleCreateOrEdit = (value: UserFormInput) => {
    if (formDialog.mode === "edit" && formDialog.user) {
      setUsers((current) =>
        current.map((user) =>
          user.id === formDialog.user?.id
            ? {
              ...user,
              ...value,
              roleDisplayName: getRoleDisplayName(value.role, roles),
            }
            : user
        )
      )

      return
    }

    const nextUser: UserRecord = {
      id: `u-${Date.now()}`,
      ...value,
      roleDisplayName: getRoleDisplayName(value.role, roles),
      created_at: new Date().toISOString().slice(0, 10),
    }

    setUsers((current) => [nextUser, ...current])
  }

  const handleToggleStatus = async (userId: string) => {
    const targetUser = users.find((user) => user.id === userId)

    if (!targetUser || togglingUserId === userId) {
      return
    }

    const nextActive = targetUser.status !== "active"

    setTogglingUserId(userId)

    try {
      await api.post(
        API_ROUTES.admin.userActivation(userId),
        { active: nextActive }
      )

      setUsers((current) =>
        current.map((user) =>
          user.id === userId
            ? {
                ...user,
                status: nextActive ? "active" : "inactive",
              }
            : user
        )
      )
    } finally {
      setTogglingUserId(undefined)
    }
  }

  const handleDelete = (userId: string) => {
    setUsers((current) => current.filter((user) => user.id !== userId))
    setUserToDelete(undefined)
  }

  return (
    <Card>
      <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* <div className="space-y-1">
          <CardTitle className="text-base sm:text-lg">მომხმარებლები</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            პლატფორმის მომხმარებლების ანგარიშზე წვდომის, როლებისა და სტატუსის მართვა.
          </CardDescription>
        </div> */}
        <Button
          type="button"
          className="h-10"
          onClick={() => setFormDialog({ open: true, mode: "create", user: undefined })}
        >
          <Plus className="size-4" />
          მომხმარებლის დამატება
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        <UsersFilters
          value={filters}
          onChange={(nextFilters) => {
            setFilters(nextFilters)
            setCurrentPage(1)
          }}
          roles={roles}
        />

        <UsersTable
          users={paginatedUsers}
          loading={loading}
          onEdit={(user) => setFormDialog({ open: true, mode: "edit", user })}
          onToggleStatus={handleToggleStatus}
          togglingUserId={togglingUserId}
        />

        {!loading && filteredUsers.length > 0 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted-foreground text-sm">
              ნაჩვენებია {startIndex + 1}-{Math.min(startIndex + pageSize, filteredUsers.length)} / {filteredUsers.length}
            </p>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">ჩვენება:</span>
                <Select
                  value={String(pageSize)}
                  onValueChange={(next) => {
                    setPageSize(Number(next))
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="h-9 w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <SelectItem key={size} value={String(size)}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9"
                  onClick={() => setCurrentPage(Math.max(1, safeCurrentPage - 1))}
                  disabled={safeCurrentPage === 1}
                >
                  წინა
                </Button>
                <p className="text-sm">
                  {safeCurrentPage} / {totalPages}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9"
                  onClick={() => setCurrentPage(Math.min(totalPages, safeCurrentPage + 1))}
                  disabled={safeCurrentPage >= totalPages}
                >
                  შემდეგი
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <UserFormDialog
        open={formDialog.open}
        mode={formDialog.mode}
        initialUser={formDialog.user}
        onOpenChange={(open) => setFormDialog((current) => ({ ...current, open }))}
        onSubmit={handleCreateOrEdit}
        roles={roles}
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
