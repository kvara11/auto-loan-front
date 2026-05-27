import { type RegisterInput } from "@/lib/validations/auth"

export type UserRole = "admin" | "manager" | "user"
export type UserStatus = "active" | "inactive"

export type UserRecord = RegisterInput & {
  id: string
  role: UserRole
  status: UserStatus
  createdAt: string
}

export type UserFilters = {
  search: string
  role: UserRole | "all"
  status: UserStatus | "all"
}

export type UserFormInput = RegisterInput & {
  role: UserRole
  status: UserStatus
}

export const roleOptions: Array<{ label: string; value: UserRole }> = [
  { label: "Admin", value: "admin" },
  { label: "Manager", value: "manager" },
  { label: "User", value: "user" },
]

export const statusOptions: Array<{ label: string; value: UserStatus }> = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
]

export const defaultFilters: UserFilters = {
  search: "",
  role: "all",
  status: "all",
}
