"use client"

import { useEffect } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { registerSchema } from "@/lib/validations/auth"
import { statusOptions, type UserFormInput, type UserRecord } from "@/components/users/users-types"

const userFormSchema = registerSchema.extend({
  role: z.string().min(1, "როლი სავალდებულოა"),
  status: z.enum(["active", "inactive"]),
})

type UserFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  initialUser?: UserRecord
  onSubmit: (value: UserFormInput) => void
  roles: Array<{ label: string; value: string }>
}

const defaultValues: UserFormInput = {
  first_name: "",
  last_name: "",
  username: "",
  email: "",
  password: "",
  role: "",
  status: "active",
}

export function UserFormDialog({ open, onOpenChange, mode, initialUser, onSubmit, roles }: UserFormDialogProps) {

  const noAutoFillProps = {
    "data-1p-ignore": "true",
    "data-lpignore": "true",
  } as const

  const form = useForm<UserFormInput>({
    resolver: zodResolver(userFormSchema),
    defaultValues,
  })

  useEffect(() => {
    if (!open) return

    if (!initialUser) {
      form.reset(defaultValues)
      return
    }

    form.reset({
      first_name: initialUser.first_name,
      last_name: initialUser.last_name,
      username: initialUser.username,
      email: initialUser.email,
      password: initialUser.password,
      role: initialUser.role,
      status: initialUser.status,
    })
  }, [form, initialUser, open])

  const handleSubmit = (value: UserFormInput) => {
    onSubmit(value)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create User" : "Edit User"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new user with registration fields and role settings."
              : "Update user details and account access settings."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" autoComplete="off">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>სახელი</FormLabel>
                    <FormControl>
                      <Input className="h-10" placeholder="John" {...field} {...noAutoFillProps} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>გვარი</FormLabel>
                    <FormControl>
                      <Input className="h-10" placeholder="Doe" {...field} {...noAutoFillProps} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>მომხმარებლის სახელი</FormLabel>
                  <FormControl>
                    <Input className="h-10" placeholder="johndoe" {...field} {...noAutoFillProps} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>იმეილი</FormLabel>
                  <FormControl>
                    <Input className="h-10" placeholder="john@example.com" type="email" {...field} {...noAutoFillProps} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>პაროლი</FormLabel>
                  <FormControl>
                    <Input className="h-10" placeholder="••••••••" type="password" {...field} {...noAutoFillProps} autoComplete="new-password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>როლი</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>სტატუსი</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">{mode === "create" ? "Create User" : "Save Changes"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
