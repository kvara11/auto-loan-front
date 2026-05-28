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
  { label: "ადმინი", value: "admin" },
  { label: "მენეჯერი", value: "manager" },
  { label: "მომხმარებელი", value: "user" },
]

export const statusOptions: Array<{ label: string; value: UserStatus }> = [
  { label: "აქტიური", value: "active" },
  { label: "გაუქმებული", value: "inactive" },
]

export const defaultFilters: UserFilters = {
  search: "",
  role: "all",
  status: "all",
}
