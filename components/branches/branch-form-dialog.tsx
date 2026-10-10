"use client"

import { useEffect, useState } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { type Branch, type BranchFormInput } from "@/components/branches/branches-types"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { getApiErrorMessage, getApiFieldErrors } from "@/lib/axios"

const branchSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "ფილიალის კოდი აუცილებელია")
    .max(20, "კოდი არ უნდა აღემატებოდეს 20 სიმბოლოს")
    .regex(/^[A-Za-z0-9_-]+$/, "მხოლოდ ლათინური ასოები, ციფრები, ტირე და ქვედა ტირე"),
  name: z.string().trim().min(1, "ფილიალის სახელი აუცილებელია").max(255, "სახელი ძალიან გრძელია"),
})

type BranchFormDialogProps = {
  open: boolean
  branch?: Branch
  onOpenChange: (open: boolean) => void
  onSubmit: (value: BranchFormInput) => Promise<void>
}

export function BranchFormDialog({ open, branch, onOpenChange, onSubmit }: BranchFormDialogProps) {
  const [submitError, setSubmitError] = useState<string>()
  const form = useForm<BranchFormInput>({
    resolver: zodResolver(branchSchema),
    defaultValues: { code: "", name: "" },
  })

  useEffect(() => {
    if (!open) return
    form.reset({ code: branch?.code ?? "", name: branch?.name ?? "" })
  }, [branch, form, open])

  const handleOpenChange = (next: boolean) => {
    if (!next) setSubmitError(undefined)
    onOpenChange(next)
  }

  const handleSubmit = async (value: BranchFormInput) => {
    setSubmitError(undefined)
    try {
      await onSubmit(value)
      handleOpenChange(false)
    } catch (error) {
      const fieldErrors = getApiFieldErrors(error)
      Object.entries(fieldErrors).forEach(([field, message]) => {
        if (field === "code" || field === "name") form.setError(field, { message })
      })
      if (Object.keys(fieldErrors).length === 0) {
        setSubmitError(getApiErrorMessage(error) || "ფილიალის შენახვა ვერ მოხერხდა.")
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{branch ? "ფილიალის რედაქტირება" : "ფილიალის დამატება"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" autoComplete="off">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>კოდი</FormLabel>
                  <FormControl>
                    <Input className="h-10" placeholder="TBS-01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>სახელი</FormLabel>
                  <FormControl>
                    <Input className="h-10" placeholder="თბილისი — ვაკე" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                {branch ? "შენახვა" : "დამატება"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
