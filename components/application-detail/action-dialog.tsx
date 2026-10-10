"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"

import { type ApplicationAction, type ApplicationDetails } from "@/components/applications/applications-types"
import { ACTIONS } from "@/components/application-detail/action-config"
import { FormNotice } from "@/components/settings/settings-section"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { performAction } from "@/lib/applications"
import { getApiErrorMessage } from "@/lib/axios"

type ActionDialogProps = {
  applicationId: number
  action: ApplicationAction | null
  onClose: () => void
  onDone: (details: ApplicationDetails, message: string) => void
}

export function ActionDialog({ applicationId, action, onClose, onDone }: ActionDialogProps) {
  const [comment, setComment] = useState("")
  const [error, setError] = useState<string>()
  const [pending, setPending] = useState(false)
  const config = action ? ACTIONS[action] : null
  const needsComment = Boolean(config?.commentLabel)

  const close = () => {
    if (pending) return
    setComment("")
    setError(undefined)
    onClose()
  }

  const confirm = async () => {
    if (!action || !config) return
    if (needsComment && !comment.trim()) {
      setError(`მიუთითეთ: ${config.commentLabel?.toLowerCase()}.`)
      return
    }

    setPending(true)
    setError(undefined)
    try {
      const { message, ...details } = await performAction(applicationId, action, needsComment ? comment.trim() : undefined)
      setComment("")
      onDone(details, message)
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={action !== null} onOpenChange={(open) => !open && close()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{config?.title}</DialogTitle>
          <DialogDescription>{config?.description}</DialogDescription>
        </DialogHeader>

        {needsComment ? (
          <div className="space-y-2">
            <Label htmlFor="workflow-comment">{config?.commentLabel} *</Label>
            <Textarea
              id="workflow-comment"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              maxLength={2000}
              rows={4}
              aria-invalid={Boolean(error) && !comment.trim()}
              autoFocus
            />
          </div>
        ) : null}

        {error ? <FormNotice tone="error">{error}</FormNotice> : null}

        <DialogFooter>
          <Button variant="outline" className="h-10" onClick={close} disabled={pending}>
            გაუქმება
          </Button>
          <Button variant={config?.variant === "destructive" ? "destructive" : "default"} className="h-10" onClick={confirm} disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            {config?.label}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
