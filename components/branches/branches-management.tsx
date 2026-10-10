"use client"

import { useEffect, useState } from "react"
import { Plus } from "lucide-react"

import { BranchFormDialog } from "@/components/branches/branch-form-dialog"
import { BranchesTable } from "@/components/branches/branches-table"
import { type Branch, type BranchFormInput } from "@/components/branches/branches-types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { api, getApiErrorMessage } from "@/lib/axios"
import { API_ROUTES } from "@/lib/routes"

type DialogState = { open: boolean; branch?: Branch }

function replaceBranch(branches: Branch[], next: Branch) {
  return branches.map((branch) => (branch.id === next.id ? next : branch))
}

export function BranchesManagement() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string>()
  const [actionError, setActionError] = useState<string>()
  const [togglingId, setTogglingId] = useState<number>()
  const [dialog, setDialog] = useState<DialogState>({ open: false })

  useEffect(() => {
    let active = true

    api
      .get<{ branches: Branch[] }>(API_ROUTES.admin.branches)
      .then((response) => {
        if (active) setBranches(response.data?.branches ?? [])
      })
      .catch((error) => {
        if (active) setLoadError(getApiErrorMessage(error) || "ფილიალების ჩატვირთვა ვერ მოხერხდა.")
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const handleSubmit = async (value: BranchFormInput) => {
    const editing = dialog.branch

    if (editing) {
      const response = await api.put<{ branch: Branch }>(API_ROUTES.admin.branch(String(editing.id)), {
        ...value,
        is_active: editing.is_active,
      })
      const updated = response.data?.branch
      if (updated) setBranches((current) => replaceBranch(current, updated))
      return
    }

    const response = await api.post<{ branch: Branch }>(API_ROUTES.admin.branches, value)
    const created = response.data?.branch
    if (created) setBranches((current) => [...current, created].sort((a, b) => a.code.localeCompare(b.code)))
  }

  const handleToggleActive = async (branch: Branch) => {
    setTogglingId(branch.id)
    setActionError(undefined)
    try {
      const response = await api.put<{ branch: Branch }>(API_ROUTES.admin.branch(String(branch.id)), {
        code: branch.code,
        name: branch.name,
        is_active: !branch.is_active,
      })
      const updated = response.data?.branch
      if (updated) setBranches((current) => replaceBranch(current, updated))
    } catch (error) {
      setActionError(getApiErrorMessage(error) || "სტატუსის შეცვლა ვერ მოხერხდა.")
    } finally {
      setTogglingId(undefined)
    }
  }

  const error = loadError ?? actionError

  return (
    <Card>
      <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground text-sm">
          ფილიალი არ იშლება — გათიშული ფილიალი ახალ მომხმარებელს ვეღარ მიენიჭება.
        </p>
        <Button type="button" className="h-10" onClick={() => setDialog({ open: true })}>
          <Plus className="size-4" />
          ფილიალის დამატება
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {error ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <BranchesTable
          branches={branches}
          loading={loading}
          togglingId={togglingId}
          onEdit={(branch) => setDialog({ open: true, branch })}
          onToggleActive={handleToggleActive}
        />
      </CardContent>

      <BranchFormDialog
        open={dialog.open}
        branch={dialog.branch}
        onOpenChange={(open) => setDialog((current) => ({ ...current, open }))}
        onSubmit={handleSubmit}
      />
    </Card>
  )
}
