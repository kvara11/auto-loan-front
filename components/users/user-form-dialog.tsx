"use client"

import { useEffect, useMemo, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch, type Control, type FieldPath } from "react-hook-form"

import { type BranchOption } from "@/components/branches/branches-types"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { buildUserFormSchema, emptyUserForm } from "@/components/users/user-form-schema"
import { BRANCH_REQUIRED_ROLES, type UserFormInput, type UserRecord } from "@/components/users/users-types"
import { getApiErrorMessage, getApiFieldErrors } from "@/lib/axios"

type Option = { label: string; value: string }

type UserFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  initialUser?: UserRecord
  onSubmit: (value: UserFormInput) => Promise<void>
  roles: Option[]
  branches: BranchOption[]
}

const NO_BRANCH = "none"

function TextField({ control, name, label, type = "text" }: {
  control: Control<UserFormInput>
  name: FieldPath<UserFormInput>
  label: string
  type?: string
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input className="h-10" type={type} autoComplete={type === "password" ? "new-password" : "off"} {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

// `emptyOption`: an option whose value stands for "" (e.g. "no branch"); Radix Select can't use "" as an item value.
function SelectField({ control, name, label, placeholder, options, emptyOption }: {
  control: Control<UserFormInput>
  name: "role" | "branch_id"
  label: string
  placeholder: string
  options: Option[]
  emptyOption?: Option
}) {
  const allOptions = emptyOption ? [emptyOption, ...options] : options

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select
            value={field.value || (emptyOption?.value ?? "")}
            onValueChange={(next) => field.onChange(next === emptyOption?.value ? "" : next)}
          >
            <FormControl>
              <SelectTrigger className="h-10">
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {allOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export function UserFormDialog({ open, onOpenChange, mode, initialUser, onSubmit, roles, branches }: UserFormDialogProps) {
  const isCreateMode = mode === "create"
  const [submitError, setSubmitError] = useState<string>()
  const schema = useMemo(() => buildUserFormSchema(mode), [mode])
  const form = useForm<UserFormInput>({ resolver: zodResolver(schema), defaultValues: emptyUserForm })
  const role = useWatch({ control: form.control, name: "role" })

  useEffect(() => {
    if (!open) return
    form.reset(initialUser ? {
      ...emptyUserForm,
      first_name: initialUser.first_name,
      last_name: initialUser.last_name,
      username: initialUser.username,
      email: initialUser.email,
      role: initialUser.role,
      branch_id: initialUser.branchId,
    } : emptyUserForm)
  }, [form, initialUser, open])

  // Only active branches can be assigned; keep the user's current branch visible even if inactive.
  const branchOptions = branches.filter((branch) => branch.active || branch.value === initialUser?.branchId)
  const noBranchOption = BRANCH_REQUIRED_ROLES.includes(role) ? undefined : { label: "ფილიალის გარეშე", value: NO_BRANCH }

  const handleOpenChange = (next: boolean) => {
    if (!next) setSubmitError(undefined)
    onOpenChange(next)
  }

  const handleSubmit = async (value: UserFormInput) => {
    setSubmitError(undefined)
    try {
      await onSubmit(value)
      handleOpenChange(false)
    } catch (error) {
      const fieldErrors = getApiFieldErrors(error)
      Object.entries(fieldErrors).forEach(([field, message]) => {
        if (field in emptyUserForm) form.setError(field as FieldPath<UserFormInput>, { message })
      })
      if (Object.keys(fieldErrors).length === 0) {
        setSubmitError(getApiErrorMessage(error) || "მომხმარებლის შენახვა ვერ მოხერხდა.")
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{isCreateMode ? "მომხმარებლის დამატება" : "მომხმარებლის რედაქტირება"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" autoComplete="off">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField control={form.control} name="first_name" label="სახელი" />
              <TextField control={form.control} name="last_name" label="გვარი" />
              <TextField control={form.control} name="username" label="მომხმარებლის სახელი" />
              <TextField control={form.control} name="email" label="იმეილი" type="email" />
              {isCreateMode ? (
                <>
                  <TextField control={form.control} name="password" label="პაროლი" type="password" />
                  <TextField control={form.control} name="password_confirmation" label="გაიმეორეთ პაროლი" type="password" />
                </>
              ) : null}
              <SelectField control={form.control} name="role" label="როლი" placeholder="აირჩიეთ როლი" options={roles} />
              <SelectField control={form.control} name="branch_id" label="ფილიალი" placeholder="აირჩიეთ ფილიალი" options={branchOptions} emptyOption={noBranchOption} />
            </div>

            {submitError ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {submitError}
              </div>
            ) : null}

            <DialogFooter>
              <Button type="button" variant="outline" className="h-10" onClick={() => handleOpenChange(false)}>
                გაუქმება
              </Button>
              <Button type="submit" className="h-10" disabled={form.formState.isSubmitting}>
                {isCreateMode ? "დამატება" : "შენახვა"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
