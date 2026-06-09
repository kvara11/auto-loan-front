"use client"

import { useEffect, useState } from "react"
import type { FormEvent, ReactNode } from "react"
import { Bell, PanelLeft, Save, ShieldAlert } from "lucide-react"

import { useDashboardShellState } from "@/components/dashboard/dashboard-shell-state"
import { useAuthUser, saveAuthUser } from "@/lib/auth-storage"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { api, getApiErrorMessage } from "@/lib/axios"
import { API_ROUTES } from "@/lib/routes"
import { applyTheme, setStoredSidebarCollapsed, setStoredTheme } from "@/lib/ui-preferences"
import { useSettings } from "@/hooks/use-settings"

function ToggleButton({
    active,
    label,
    onClick,
}: {
    active: boolean
    label: string
    onClick: () => void
}) {
    return (
        <Button type="button" variant={active ? "default" : "outline"} className="h-10" onClick={onClick}>
            {label}
        </Button>
    )
}

function SectionCard({
    title,
    description,
    children,
}: {
    title: string
    description: string
    children: ReactNode
}) {
    return (
        <Card>
            <CardHeader className="space-y-1">
                <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
                <CardDescription className="text-sm sm:text-base">{description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">{children}</CardContent>
        </Card>
    )
}

export function SettingsForm() {
    const dashboardShellState = useDashboardShellState()
    const collapsed = dashboardShellState?.collapsed ?? false
    const setCollapsed = dashboardShellState?.setCollapsed ?? (() => undefined)
    const authUser = useAuthUser()
    const { settings, status, error, success, isDirty, updateSetting, submit } = useSettings()
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
    const [password, setPassword] = useState("")
    const [passwordVerify, setPasswordVerify] = useState("")
    const [passwordStatus, setPasswordStatus] = useState<"idle" | "saving">("idle")
    const [passwordError, setPasswordError] = useState<string | null>(null)
    const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)

    useEffect(() => {
        applyTheme(settings.theme)
    }, [settings.theme])

    const handleThemeChange = (value: string) => {
        const nextTheme = value === "dark" ? "dark" : "light"

        updateSetting("theme", nextTheme)
    }

    const handleSidebarCollapsedChange = () => {
        const nextValue = !settings.sidebar_collapsed

        updateSetting("sidebar_collapsed", nextValue)
        setCollapsed(nextValue)
    }

    const handleNotificationsChange = () => {
        updateSetting("notifications", !settings.notifications)
    }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const saved = await submit()

        if (!saved) return

        if (authUser) {
            saveAuthUser({
                ...authUser,
                first_name: settings.first_name,
                last_name: settings.last_name,
                email: settings.email,
            })
        }

        setStoredTheme(settings.theme)
        setStoredSidebarCollapsed(settings.sidebar_collapsed)
    }

    const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!password || !passwordVerify) {
            setPasswordError("Both password fields are required.")
            return
        }

        if (password !== passwordVerify) {
            setPasswordError("Passwords do not match.")
            return
        }

        try {
            setPasswordStatus("saving")
            setPasswordError(null)
            setPasswordSuccess(null)

            await api.post(API_ROUTES.auth.changePassword, {
                password,
                password_verify: passwordVerify,
            })

            setPasswordSuccess("Password changed.")
            setPassword("")
            setPasswordVerify("")
            setIsPasswordDialogOpen(false)
        } catch (requestError: unknown) {
            setPasswordError(getApiErrorMessage(requestError) || "Could not change password.")
        } finally {
            setPasswordStatus("idle")
        }
    }

    return (
        <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">პარამეტრები</h2>
                    {/* <p className="text-muted-foreground text-sm sm:text-base">
                        მართეთ თქვენი პროფილი და აპლიკაციის პარამეტრები ერთი ადგილიდან.
                    </p> */}
                </div>

                <div className="flex items-center gap-3">
                    <Badge variant={isDirty ? "default" : "secondary"} className="h-8 px-3 text-xs sm:text-sm">
                        {status === "saving" ? "შენახვა" : isDirty ? "შეცვლილია" : "განახლებულია"}
                    </Badge>
                    <Button type="submit" className="h-10" disabled={status === "loading" || status === "saving"}>
                        <Save className="mr-2 size-4" />
                        შენახვა
                    </Button>
                </div>
            </div>

            {error ? (
                <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-4 py-3 text-sm sm:text-base">
                    {error}
                </div>
            ) : null}

            {success ? (
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300 sm:text-base">
                    {success}
                </div>
            ) : null}

            <div className="grid gap-4 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <SectionCard
                        title="პროფილი"
                        description="შეცვალეთ თქვენი სახელი და ელ.ფოსტა."
                    >
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="first_name">სახელი</Label>
                                <Input
                                    id="first_name"
                                    className="h-10"
                                    value={settings.first_name}
                                    onChange={(event) => updateSetting("first_name", event.target.value)}
                                    disabled={status === "loading" || status === "saving"}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="last_name">გვარი</Label>
                                <Input
                                    id="last_name"
                                    className="h-10"
                                    value={settings.last_name}
                                    onChange={(event) => updateSetting("last_name", event.target.value)}
                                    disabled={status === "loading" || status === "saving"}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">იმეილი</Label>
                            <Input id="email" className="h-10" value={settings.email} readOnly/>
                        </div>
                    </SectionCard>
                </div>

                <SectionCard
                    title="Preferences"
                    description="Control how the interface behaves and what notifications you receive."
                >
                    <div className="space-y-2">
                        <Label htmlFor="theme">თემა</Label>
                        <Select value={settings.theme} onValueChange={handleThemeChange} disabled={status === "loading"}>
                            <SelectTrigger id="theme" className="h-10">
                                <SelectValue placeholder="Select theme" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="light">Light</SelectItem>
                                <SelectItem value="dark">Dark</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Notifications</Label>
                        <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
                            <div className="flex items-center gap-3">
                                <Bell className="text-muted-foreground size-4" />
                                <div>
                                    <p className="text-sm font-medium sm:text-base">Enabled</p>
                                    <p className="text-muted-foreground text-xs sm:text-sm">Email and in-app alerts</p>
                                </div>
                            </div>
                            <ToggleButton
                                active={settings.notifications}
                                label={settings.notifications ? "On" : "Off"}
                                onClick={handleNotificationsChange}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Sidebar collapsed</Label>
                        <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
                            <div className="flex items-center gap-3">
                                <PanelLeft className="text-muted-foreground size-4" />
                                <div>
                                    <p className="text-sm font-medium sm:text-base">Compact sidebar</p>
                                    <p className="text-muted-foreground text-xs sm:text-sm">Applies to dashboard navigation</p>
                                </div>
                            </div>
                            <ToggleButton
                                active={collapsed}
                                label={collapsed ? "Collapsed" : "Expanded"}
                                onClick={handleSidebarCollapsedChange}
                            />
                        </div>
                    </div>
                </SectionCard>

                <SectionCard
                    title="უსაფრთხოება"
                    description="შეცვალეთ თქვენი პაროლი."
                >
                    <div className="rounded-lg border border-dashed p-4">
                        <div className="flex gap-3 items-center">
                            <ShieldAlert className="text-muted-foreground mt-0.5 size-4" />
                            <div className="space-y-3">
                                {/* <div className="space-y-1">
                                    <p className="text-sm font-medium sm:text-base">Password changes</p>
                                    <p className="text-muted-foreground text-xs sm:text-sm">
                                        Update your password in a secure popup before saving.
                                    </p>
                                </div> */}

                                <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                                    <Button type="button" className="h-10" onClick={() => setIsPasswordDialogOpen(true)}>
                                        პაროლის შეცვლა
                                    </Button>

                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>პაროლის შეცვლა</DialogTitle>
                                            {/* <DialogDescription>
                                                შეიყვანეთ ახალი პაროლი ორჯერ, რომ დაადასტუროთ განახლება.
                                            </DialogDescription> */}
                                        </DialogHeader>

                                        <form className="space-y-4" onSubmit={handlePasswordSubmit}>
                                            <div className="space-y-2">
                                                <Label htmlFor="password">პაროლი</Label>
                                                <Input
                                                    id="password"
                                                    type="password"
                                                    className="h-10"
                                                    value={password}
                                                    onChange={(event) => setPassword(event.target.value)}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="password_verify">გაიმეორეთ პაროლი</Label>
                                                <Input
                                                    id="password_verify"
                                                    type="password"
                                                    className="h-10"
                                                    value={passwordVerify}
                                                    onChange={(event) => setPasswordVerify(event.target.value)}
                                                />
                                            </div>

                                            {passwordError ? (
                                                <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-3 py-2 text-sm">
                                                    {passwordError}
                                                </div>
                                            ) : null}

                                            {passwordSuccess ? (
                                                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
                                                    {passwordSuccess}
                                                </div>
                                            ) : null}

                                            <DialogFooter>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setIsPasswordDialogOpen(false)}
                                                >
                                                    გაუქმება
                                                </Button>
                                                <Button type="submit" disabled={passwordStatus === "saving"}>
                                                    {passwordStatus === "saving" ? "შენახვა..." : "შენახვა"}
                                                </Button>
                                            </DialogFooter>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    </div>
                </SectionCard>
            </div>
        </form>
    )
}