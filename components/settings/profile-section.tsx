"use client"

import { useState } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Save } from "lucide-react"

import { AvatarField } from "@/components/settings/avatar-field"
import { FormNotice, SettingsSection } from "@/components/settings/settings-section"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { saveAuthUser, useAuthUser } from "@/lib/auth-storage"
import { getApiErrorMessage, getApiFieldErrors } from "@/lib/axios"
import { updateProfile, type ProfileInfo } from "@/lib/settings"

// Mirrors UpdateProfileRequest on the backend.
const profileSchema = z.object({
  first_name: z.string().trim().min(2, "სახელი უნდა შეიცავდეს მინიმუმ 2 სიმბოლოს").max(100, "სახელი ძალიან გრძელია"),
  last_name: z.string().trim().min(2, "გვარი უნდა შეიცავდეს მინიმუმ 2 სიმბოლოს").max(200, "გვარი ძალიან გრძელია"),
})

type ProfileFormValues = z.infer<typeof profileSchema>

const NAME_FIELDS = [
  { name: "first_name", label: "სახელი" },
  { name: "last_name", label: "გვარი" },
] as const

export function ProfileSection({ profile }: { profile: ProfileInfo }) {
  const authUser = useAuthUser()
  const [notice, setNotice] = useState<{ tone: "error" | "success"; text: string }>()
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { first_name: profile.first_name, last_name: profile.last_name },
  })
  const { isDirty, isSubmitting } = form.formState

  const handleSubmit = async (value: ProfileFormValues) => {
    setNotice(undefined)
    try {
      const { profile: saved, message } = await updateProfile(value)
      const names = { first_name: saved?.first_name ?? value.first_name, last_name: saved?.last_name ?? value.last_name }

      // The saved values become the new baseline, so the button disables again.
      form.reset(names)
      if (authUser) saveAuthUser({ ...authUser, ...names })
      setNotice({ tone: "success", text: message || "პროფილი განახლდა." })
    } catch (error) {
      const fieldErrors = getApiFieldErrors(error)
      Object.entries(fieldErrors).forEach(([field, message]) => {
        if (field === "first_name" || field === "last_name") form.setError(field, { message })
      })
      if (Object.keys(fieldErrors).length === 0) {
        setNotice({ tone: "error", text: getApiErrorMessage(error) || "პროფილის შენახვა ვერ მოხერხდა." })
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} autoComplete="off">
        <SettingsSection
          title="პირადი ინფორმაცია"
          description="თქვენი ავატარი, სახელი და გვარი. მომხმარებლის სახელს და იმეილს ადმინისტრატორი ცვლის."
          footer={
            <Button type="submit" className="h-10" disabled={!isDirty || isSubmitting}>
              <Save className="size-4" />
              {isSubmitting ? "ინახება..." : "შენახვა"}
            </Button>
          }
        >
          <AvatarField profile={profile} />
          <div className="grid gap-4 sm:grid-cols-2">
            {NAME_FIELDS.map(({ name, label }) => (
              <FormField
                key={name}
                control={form.control}
                name={name}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                      <Input className="h-10" disabled={isSubmitting} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <ReadOnlyField id="username" label="მომხმარებლის სახელი" value={profile.username} />
            <ReadOnlyField id="email" label="იმეილი" value={profile.email} />
          </div>

          {notice ? <FormNotice tone={notice.tone}>{notice.text}</FormNotice> : null}
        </SettingsSection>
      </form>
    </Form>
  )
}

function ReadOnlyField({ id, label, value }: { id: string; label: string; value: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} className="h-10 bg-muted/50" value={value} readOnly />
    </div>
  )
}
