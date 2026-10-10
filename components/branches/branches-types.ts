export type Branch = {
  id: number
  code: string
  name: string
  is_active: boolean
  users_count: number
  created_at: string | null
}

export type BranchFormInput = {
  code: string
  name: string
}

export type BranchOption = {
  label: string
  value: string
  active: boolean
}

export function toBranchOption(branch: Branch): BranchOption {
  return {
    label: `${branch.code} — ${branch.name}`,
    value: String(branch.id),
    active: branch.is_active,
  }
}
