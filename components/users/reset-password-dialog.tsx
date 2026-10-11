"use client"

import { useState } from "react"
import { Eye, EyeOff, KeyRound, Wand2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { type UserRecord } from "@/components/users/users-types"
import { api, getApiErrorMessage, getApiFieldErrors } from "@/lib/axios"
import { API_ROUTES } from "@/lib/routes"

const SETS = ["ABCDEFGHJKLMNPQRSTUVWXYZ", "abcdefghijkmnpqrstuvwxyz", "23456789", "!@#$%*?-_"]

// 14 characters with at least one of each set (the backend's policy: mixed case, number, symbol).
function generatePassword() {
  const random = (max: number) => crypto.getRandomValues(new Uint32Array(1))[0] % max
  const all = SETS.join("")
  const chars = [...SETS.map((set) => set[random(set.length)]), ...Array.from({ length: 10 }, () => all[random(all.length)])]
  for (let i = chars.length - 1; i > 0; i--) {
    const j = random(i + 1)
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }
  return chars.join("")
}

// T-208: an administrator sets a new password for a user who forgot theirs (users.manage).
// All of the user's sessions end; the change log records who did it.
export function ResetPasswordDialog({ user }: { user: UserRecord }) {
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmation, setConfirmation] = useState("")
  const [visible, setVisible] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [banner, setBanner] = useState<string>()
  const [done, setDone] = useState<string>()
  const [saving, setSaving] = useState(false)
  const name = `${user.first_name} ${user.last_name}`

  const changeOpen = (next: boolean) => {
    setOpen(next)
    if (!next) return
    setPassword("")
    setConfirmation("")
    setVisible(false)
    setErrors({})
    setBanner(undefined)
    setDone(undefined)
  }

  const generate = () => {
    const value = generatePassword()
    setPassword(value)
    setConfirmation(value)
    setVisible(true)
    setErrors({})
  }

  const submit = async () => {
    const found: Record<string, string> = {}
    if (password.length < 8) found.password = "პაროლი უნდა შეიცავდეს მინიმუმ 8 სიმბოლოს."
    else if (password !== confirmation) found.password_confirmation = "პაროლები არ ემთხვევა."
    setErrors(found)
    setBanner(undefined)
    if (Object.keys(found).length) return

    setSaving(true)
    try {
      const response = await api.post(API_ROUTES.admin.userPassword(user.id), { password, password_confirmation: confirmation })
      setDone(response.message || "პაროლი აღდგა.")
    } catch (err) {
      const fields = getApiFieldErrors(err)
      setErrors(fields)
      if (!Object.keys(fields).length) setBanner(getApiErrorMessage(err) || "პაროლის აღდგენა ვერ მოხერხდა.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="icon" className="size-9" aria-label="პაროლის აღდგენა" title="პაროლის აღდგენა">
          <KeyRound className="size-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>პაროლის აღდგენა</DialogTitle>
          <DialogDescription>
            {name} ({user.username}) მიიღებს ახალ პაროლს და ყველა მოწყობილობიდან გამოვა. პაროლი თავად გადაეცით მომხმარებელს.
          </DialogDescription>
        </DialogHeader>

        {done ? (
          <div className="space-y-3">
            <p className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">{done}</p>
            <p className="text-sm text-muted-foreground">
              ახალი პაროლი: <span className="font-mono text-foreground select-all">{password}</span>
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <PasswordInput id="reset-password" label="ახალი პაროლი" value={password} visible={visible} error={errors.password} onChange={setPassword} />
            <PasswordInput id="reset-password-confirmation" label="გაიმეორეთ პაროლი" value={confirmation} visible={visible} error={errors.password_confirmation} onChange={setConfirmation} />
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" className="h-10" onClick={generate}>
                <Wand2 className="size-4" />
                გენერირება
              </Button>
              <Button type="button" variant="ghost" className="h-10" onClick={() => setVisible((current) => !current)}>
                {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                {visible ? "დამალვა" : "ჩვენება"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">მინიმუმ 8 სიმბოლო: დიდი და პატარა ასო, ციფრი და სპეციალური სიმბოლო.</p>
            {banner ? <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{banner}</p> : null}
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" className="h-10" onClick={() => changeOpen(false)}>
            {done ? "დახურვა" : "გაუქმება"}
          </Button>
          {done ? null : (
            <Button type="button" className="h-10" disabled={saving} onClick={() => void submit()}>
              პაროლის აღდგენა
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type PasswordInputProps = { id: string; label: string; value: string; visible: boolean; error?: string; onChange: (value: string) => void }

function PasswordInput({ id, label, value, visible, error, onChange }: PasswordInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={visible ? "text" : "password"}
        autoComplete="new-password"
        className="h-10 font-mono"
        value={value}
        aria-invalid={Boolean(error)}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  )
}
