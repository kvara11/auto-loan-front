"use client"

import { useState, type FormEvent } from "react"
import { KeyRound } from "lucide-react"

import { FormNotice, SettingsSection } from "@/components/settings/settings-section"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api, getApiErrorMessage } from "@/lib/axios"
import { API_ROUTES } from "@/lib/routes"

const EMPTY = { current_password: "", password: "", password_confirmation: "" }

const FIELDS = [
  { name: "current_password", label: "მიმდინარე პაროლი", autoComplete: "current-password" },
  { name: "password", label: "ახალი პაროლი", autoComplete: "new-password" },
  { name: "password_confirmation", label: "გაიმეორეთ ახალი პაროლი", autoComplete: "new-password" },
] as const

export function SecuritySection() {
  const [open, setOpen] = useState(false)
  const [values, setValues] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string>()
  const [success, setSuccess] = useState<string>()

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    setValues(EMPTY)
    setError(undefined)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!values.current_password || !values.password || !values.password_confirmation) {
      setError("შეავსეთ ყველა ველი.")
      return
    }
    if (values.password !== values.password_confirmation) {
      setError("პაროლები არ ემთხვევა.")
      return
    }

    setSaving(true)
    setError(undefined)
    try {
      // On success the backend signs out every other session of this user.
      await api.post(API_ROUTES.auth.changePassword, values)
      handleOpenChange(false)
      setSuccess("პაროლი წარმატებით შეიცვალა. სხვა მოწყობილობებზე სესიები დასრულდა.")
    } catch (requestError) {
      setError(getApiErrorMessage(requestError) || "პაროლის შეცვლა ვერ მოხერხდა.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <SettingsSection title="უსაფრთხოება" description="პაროლის შეცვლა. შეცვლის შემდეგ სხვა მოწყობილობებზე სესიები დასრულდება.">
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <Button type="button" variant="outline" className="h-10 w-full sm:w-auto" onClick={() => { setSuccess(undefined); setOpen(true) }}>
          <KeyRound className="size-4" />
          პაროლის შეცვლა
        </Button>

        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>პაროლის შეცვლა</DialogTitle>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {FIELDS.map(({ name, label, autoComplete }) => (
              <div key={name} className="space-y-2">
                <Label htmlFor={name}>{label}</Label>
                <Input
                  id={name}
                  type="password"
                  autoComplete={autoComplete}
                  className="h-10"
                  value={values[name]}
                  onChange={(event) => setValues((current) => ({ ...current, [name]: event.target.value }))}
                />
              </div>
            ))}

            {error ? <FormNotice tone="error">{error}</FormNotice> : null}

            <DialogFooter>
              <Button type="button" variant="outline" className="h-10" onClick={() => handleOpenChange(false)}>
                გაუქმება
              </Button>
              <Button type="submit" className="h-10" disabled={saving}>
                {saving ? "ინახება..." : "შენახვა"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {success ? <FormNotice tone="success">{success}</FormNotice> : null}
    </SettingsSection>
  )
}
