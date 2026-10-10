"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"

import { UserAvatar } from "@/components/dashboard/user-avatar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { type UserRecord } from "@/components/users/users-types"
import { deleteUserAvatar } from "@/lib/avatar"
import { getApiErrorMessage } from "@/lib/axios"

type AvatarModerationProps = { user: UserRecord; onRemoved: (userId: string) => void }

// In the edit dialog: the user's avatar and, if they have one, "ავატარის წაშლა" (users.manage).
export function AvatarModeration({ user, onRemoved }: AvatarModerationProps) {
  const [error, setError] = useState<string>()
  // Kept locally: changing the dialog's user would reset the form being edited.
  const [removed, setRemoved] = useState(false)
  const avatarUrl = removed ? null : user.avatarUrl
  const person = { first_name: user.first_name, last_name: user.last_name, avatar_url: avatarUrl }

  const remove = async () => {
    setError(undefined)
    try {
      await deleteUserAvatar(user.id)
      setRemoved(true)
      onRemoved(user.id)
    } catch (err) {
      setError(getApiErrorMessage(err) || "ავატარის წაშლა ვერ მოხერხდა.")
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <UserAvatar user={person} className="size-12" />
      {avatarUrl ? (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button type="button" variant="outline" className="h-10 text-destructive hover:text-destructive">
              <Trash2 className="size-4" />
              ავატარის წაშლა
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>ავატარის წაშლა</AlertDialogTitle>
              <AlertDialogDescription>
                {user.first_name} {user.last_name}-ს ავატარი წაიშლება და ინიციალები გამოჩნდება. ახალს თავად ატვირთავს.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="h-10">გაუქმება</AlertDialogCancel>
              <AlertDialogAction className="h-10" onClick={() => void remove()}>წაშლა</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : (
        <span className="text-sm text-muted-foreground">ავატარი არ არის ატვირთული</span>
      )}
      {error ? <span className="text-sm text-destructive">{error}</span> : null}
    </div>
  )
}
