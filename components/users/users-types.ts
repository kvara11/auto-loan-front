export type UserRole = string
export type UserStatus = "active" | "inactive"

export type UserRecord = {
  id: string
  first_name: string
  last_name: string
  username: string
  email: string
  role: UserRole
  roleDisplayName?: string
  branchId: string
  branchName?: string
  status: UserStatus
  created_at: string
}

export type UserFilters = {
  search: string
  role: UserRole | "all"
  status: UserStatus | "all"
}

export type UserFormInput = {
  first_name: string
  last_name: string
  username: string
  email: string
  password: string
  password_confirmation: string
  role: UserRole
  branch_id: string
}

// The role that must belong to a branch (backend: StoreUserRequest::branchRules).
// Mirrors StoreUserRequest::BRANCH_REQUIRED_ROLES on the backend.
export const BRANCH_REQUIRED_ROLES = ["credit-officer", "branch-manager"]

export type AdminUserResponse = {
  id: number
  first_name: string
  last_name: string
  username: string
  email: string
  role: { id: number; name: string; display_name: string } | null
  branch: { id: number; code: string; name: string } | null
  active: boolean
  created_at: string
}

export function toUserRecord(user: AdminUserResponse): UserRecord {
  return {
    id: String(user.id),
    first_name: user.first_name,
    last_name: user.last_name,
    username: user.username,
    email: user.email,
    role: user.role?.name ?? "",
    roleDisplayName: user.role?.display_name,
    branchId: user.branch ? String(user.branch.id) : "",
    branchName: user.branch ? `${user.branch.code} — ${user.branch.name}` : undefined,
    status: user.active ? "active" : "inactive",
    created_at: user.created_at,
  }
}

// Payload for POST/PUT /api/admin/users. Passwords are only sent on create.
export function toUserPayload(value: UserFormInput, mode: "create" | "edit") {
  const base = {
    first_name: value.first_name,
    last_name: value.last_name,
    username: value.username,
    email: value.email,
    role: value.role,
    branch_id: value.branch_id ? Number(value.branch_id) : null,
  }

  return mode === "create"
    ? { ...base, password: value.password, password_confirmation: value.password_confirmation }
    : base
}

export const statusOptions: Array<{ label: string; value: UserStatus }> = [
  { label: "აქტიური", value: "active" },
  { label: "გაუქმებული", value: "inactive" },
]

export const defaultFilters: UserFilters = {
  search: "",
  role: "all",
  status: "active",
}
