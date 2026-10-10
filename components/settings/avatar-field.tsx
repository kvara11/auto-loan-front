"use client"

import { useEffect, useRef, useState } from "react"
import { Check, ImageUp, Loader2, Trash2, X } from "lucide-react"

import { UserAvatar } from "@/components/dashboard/user-avatar"
import { FormNotice } from "@/components/settings/settings-section"
import { Button } from "@/components/ui/button"
import { saveAuthUser, useAuthUser } from "@/lib/auth-storage"
import { AVATAR_ACCEPT, deleteAvatar, resizeAvatar, uploadAvatar } from "@/lib/avatar"
import { getApiErrorMessage } from "@/lib/axios"
import { type ProfileInfo } from "@/lib/settings"

type Pending = { blob: Blob; url: string }

// Pick → cropped preview → "შენახვა" uploads it; saved at once, independent of the name form.
export function AvatarField({ profile }: { profile: ProfileInfo }) {
  const input = useRef<HTMLInputElement>(null)
  const authUser = useAuthUser()
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url)
  const [pending, setPending] = useState<Pending | null>(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<{ tone: "error" | "success"; text: string }>()

  useEffect(() => () => {
    if (pending) URL.revokeObjectURL(pending.url)
  }, [pending])

  const apply = (url: string | null, text: string) => {
    setAvatarUrl(url)
    setPending(null)
    // The top bar reads the cached user, so it updates without a new login.
    if (authUser) saveAuthUser({ ...authUser, avatar_url: url })
    setNotice({ tone: "success", text })
  }

  const run = async (action: () => Promise<void>) => {
    setBusy(true)
    setNotice(undefined)
    try {
      await action()
    } catch (error) {
      setNotice({ tone: "error", text: getApiErrorMessage(error) || (error as Error).message })
    } finally {
      setBusy(false)
    }
  }

  const pick = (file?: File) => run(async () => {
    if (input.current) input.current.value = ""
    if (!file) return
    const blob = await resizeAvatar(file)
    setPending({ blob, url: URL.createObjectURL(blob) })
  })

  const save = () => run(async () => {
    if (!pending) return
    const { avatarUrl: url, message } = await uploadAvatar(pending.blob)
    apply(url, message || "ავატარი განახლდა.")
  })

  const remove = () => run(async () => apply(null, (await deleteAvatar()) || "ავატარი წაიშალა."))

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <UserAvatar user={{ ...profile, avatar_url: avatarUrl }} src={pending?.url} className="size-20" fallbackClassName="text-xl" />
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            {pending ? (
              <>
                <Button type="button" className="h-10" onClick={save} disabled={busy}>
                  {busy ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                  ავატარის შენახვა
                </Button>
                <Button type="button" variant="outline" className="h-10" onClick={() => setPending(null)} disabled={busy}>
                  <X className="size-4" />
                  გაუქმება
                </Button>
              </>
            ) : (
              <>
                <Button type="button" variant="outline" className="h-10" onClick={() => input.current?.click()} disabled={busy}>
                  {busy ? <Loader2 className="size-4 animate-spin" /> : <ImageUp className="size-4" />}
                  {avatarUrl ? "ავატარის შეცვლა" : "ავატარის ატვირთვა"}
                </Button>
                {avatarUrl ? (
                  <Button type="button" variant="outline" className="h-10 text-destructive hover:text-destructive" onClick={remove} disabled={busy}>
                    <Trash2 className="size-4" />
                    წაშლა
                  </Button>
                ) : null}
              </>
            )}
          </div>
          <p className="text-xs text-muted-foreground">JPG, PNG ან WEBP. სურათი კვადრატად მოიჭრება ცენტრიდან.</p>
        </div>
        <input ref={input} type="file" accept={AVATAR_ACCEPT} className="hidden" onChange={(event) => void pick(event.target.files?.[0])} />
      </div>
      {notice ? <FormNotice tone={notice.tone}>{notice.text}</FormNotice> : null}
    </div>
  )
}
