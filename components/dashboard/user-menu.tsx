"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { isAxiosError } from "axios"
import { LogOut, Settings } from "lucide-react"

import { UserAvatar } from "@/components/dashboard/user-avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { clearAuthUser, useAuthUser } from "@/lib/auth-storage"
import { api } from "@/lib/axios"
import { API_ROUTES } from "@/lib/routes"

export function UserMenu() {
  const router = useRouter()
  const user = useAuthUser()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      await api.post(API_ROUTES.auth.logout)
    } catch (error: unknown) {
      if (!isAxiosError(error) || error.response?.status !== 401) console.error("Logout failed", error)
    } finally {
      clearAuthUser()
      router.replace("/login")
      router.refresh()
      setLoggingOut(false)
    }
  }

  const meta = [user?.role?.display_name, user?.branch?.name].filter(Boolean).join(" · ")

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="მომხმარებლის მენიუ"
          title="პროფილი და პარამეტრები"
          className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <UserAvatar user={user} className="cursor-pointer" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex flex-col gap-0.5 py-2">
          <span className="text-sm font-semibold">{user ? `${user.first_name} ${user.last_name}` : "…"}</span>
          {meta ? <span className="text-xs font-normal text-muted-foreground">{meta}</span> : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="h-10" onSelect={() => router.push("/settings")}>
          <Settings className="size-4" />
          პარამეტრები
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" className="h-10" onSelect={handleLogout} disabled={loggingOut}>
          <LogOut className="size-4" />
          {loggingOut ? "..." : "გასვლა"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
