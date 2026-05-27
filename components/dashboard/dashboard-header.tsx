"use client"

import { Menu, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { isAxiosError } from "axios"

import { clearAuthUser } from "@/lib/auth-storage"
import { api } from "@/lib/axios"
import { API_ROUTES } from "@/lib/routes"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type DashboardHeaderProps = {
    onOpenMobileMenu: () => void
}

export function DashboardHeader({ onOpenMobileMenu }: DashboardHeaderProps) {
    const router = useRouter()
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    const handleLogout = async () => {
        if (isLoggingOut) return

        setIsLoggingOut(true)

        try {
            await api.post(API_ROUTES.auth.logout)
        } catch (error: unknown) {
            if (!isAxiosError(error) || error.response?.status !== 401) {
                console.error("Logout failed", error)
            }
        } finally {
            clearAuthUser()
            router.replace("/login")
            router.refresh()
            setIsLoggingOut(false)
        }
    }

    return (
        <header className="bg-background flex h-16 items-center justify-between border-b px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-10 lg:hidden"
                    aria-label="Open navigation"
                    onClick={onOpenMobileMenu}
                >
                    <Menu className="size-5" />
                </Button>

                <h1 className="text-sm font-semibold sm:text-base lg:text-lg">Dashboard</h1>
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-10" aria-label="Open user menu">
                        <Avatar className="size-8">
                            <AvatarFallback>
                                <User className="size-4" />
                            </AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuItem className="h-10 text-sm sm:text-base">ინფორმაცია</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        variant="destructive"
                        className="h-10 text-sm sm:text-base"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                    >
                        {isLoggingOut ? "..." : "გასვლა"}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    )
}