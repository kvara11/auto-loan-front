import { type RegisterInput } from "@/lib/validations/auth"

export type UserRole = string
export type UserStatus = "active" | "inactive"

export type UserRecord = RegisterInput & {
  id: string
  role: UserRole
  roleDisplayName?: string
  status: UserStatus
  created_at: string
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

export const statusOptions: Array<{ label: string; value: UserStatus }> = [
  { label: "აქტიური", value: "active" },
  { label: "გაუქმებული", value: "inactive" },
]

export const defaultFilters: UserFilters = {
  search: "",
  role: "all",
  status: "all",
}
