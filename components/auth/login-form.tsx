"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertTriangle, Loader2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { clearAuthUser, saveAuthUser, type AuthUser } from "@/lib/auth-storage"
import { api, getApiErrorMessage } from "@/lib/axios"
import { API_ROUTES } from "@/lib/routes"
import { loginSchema, type LoginInput } from "@/lib/validations/auth"

const FIELDS = [
  { name: "username", label: "მომხმარებელი", type: "text", autoComplete: "username" },
  { name: "password", label: "პაროლი", type: "password", autoComplete: "current-password" },
] as const

export function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "", remember_me: false },
  })
  const submitting = form.formState.isSubmitting

  const onSubmit = async (data: LoginInput) => {
    setError(null)
    try {
      const response = await api.post<{ user?: AuthUser }, LoginInput>(API_ROUTES.auth.login, data)
      if (response.data?.user) saveAuthUser(response.data.user)
      router.push("/dashboard")
    } catch (requestError: unknown) {
      clearAuthUser()
      setError(getApiErrorMessage(requestError) || "მომხმარებელი ან პაროლი არასწორია.")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
        {FIELDS.map(({ name, label, type, autoComplete }) => (
          <FormField
            key={name}
            control={form.control}
            name={name}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[13px] font-semibold">{label}</FormLabel>
                <FormControl>
                  <Input {...field} type={type} autoComplete={autoComplete} placeholder={label} aria-invalid={error ? true : undefined} className="h-10" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}

        {error ? (
          <div role="alert" className="flex items-center gap-2 rounded-[10px] border border-destructive bg-[color-mix(in_oklch,var(--destructive)_12%,var(--card))] px-3 py-2.5 text-[13px] text-destructive">
            <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
            {error}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <FormField
            control={form.control}
            name="remember_me"
            render={({ field }) => (
              <label className="flex min-h-10 cursor-pointer items-center gap-2 text-[13px]">
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(event) => field.onChange(event.target.checked)}
                  className="size-[18px] rounded-[5px] border-input accent-primary"
                />
                დამიმახსოვრე
              </label>
            )}
          />
          <span className="flex items-center gap-2 text-[13px] text-muted-foreground" aria-disabled="true">
            პაროლი დაგავიწყდათ?
            <Badge variant="outline">მალე</Badge>
          </span>
        </div>

        <Button type="submit" className="h-11 w-full" disabled={submitting}>
          {submitting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
          {submitting ? "შესვლა..." : "შესვლა"}
        </Button>
        <p className="text-center text-xs text-muted-foreground">წვდომის პრობლემის შემთხვევაში მიმართეთ ადმინისტრატორს</p>
      </form>
    </Form>
  )
}
