"use client"

import { useState } from "react"

import { FormNotice } from "@/components/settings/settings-section"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { getApiErrorMessage } from "@/lib/axios"
import { FEEDBACK_STATUSES, updateFeedback, type Feedback, type FeedbackStatus } from "@/lib/feedback"

type FeedbackReplyDialogProps = { item: Feedback; onClose: () => void; onSaved: (item: Feedback) => void }

// Status + reply. A new reply reaches the author in the bell. Mounted only while open.
export function FeedbackReplyDialog({ item, onClose, onSaved }: FeedbackReplyDialogProps) {
  const [status, setStatus] = useState<FeedbackStatus>(item.status)
  const [reply, setReply] = useState(item.reply ?? "")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string>()

  const save = async () => {
    setSaving(true)
    setError(undefined)
    try {
      onSaved(await updateFeedback(item.id, { status, reply: reply.trim() }))
    } catch (err) {
      setError(getApiErrorMessage(err) || "შენახვა ვერ მოხერხდა")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>პასუხი</DialogTitle>
          <DialogDescription className="line-clamp-3 whitespace-pre-line">{item.body}</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="feedback-status">სტატუსი</Label>
          <Select value={status} onValueChange={(next) => setStatus(next as FeedbackStatus)}>
            <SelectTrigger id="feedback-status" className="h-10 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(FEEDBACK_STATUSES) as FeedbackStatus[]).map((key) => (
                <SelectItem key={key} value={key}>
                  {FEEDBACK_STATUSES[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="feedback-reply">პასუხი ავტორს</Label>
          <Textarea id="feedback-reply" rows={4} maxLength={2000} placeholder="ავტორი პასუხს შეტყობინებებში ნახავს" value={reply} onChange={(event) => setReply(event.target.value)} />
        </div>
        {error ? <FormNotice tone="error">{error}</FormNotice> : null}

        <DialogFooter>
          <Button type="button" variant="outline" className="h-10" onClick={onClose}>
            გაუქმება
          </Button>
          <Button type="button" className="h-10" disabled={saving} onClick={() => void save()}>
            {saving ? "ინახება..." : "შენახვა"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
