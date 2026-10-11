import type { ReactNode } from "react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type SettingsSectionProps = {
  title: string
  description: string
  children: ReactNode
  footer?: ReactNode
}

export function SettingsSection({ title, description, children, footer }: SettingsSectionProps) {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
      {footer ? <CardFooter className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">{footer}</CardFooter> : null}
    </Card>
  )
}

export function FormNotice({ tone, children }: { tone: "error" | "success"; children: ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-2 text-sm",
        tone === "error"
          ? "border-destructive/30 bg-destructive/10 text-destructive"
          : "border-success/30 bg-success/10 text-success",
      )}
    >
      {children}
    </div>
  )
}
