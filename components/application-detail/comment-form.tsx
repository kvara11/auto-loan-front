"use client"

import { useState, type FormEvent } from "react"
import { Loader2, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { addComment, COMMENT_MAX_LENGTH } from "@/lib/comments"
import { getApiErrorMessage } from "@/lib/axios"

type CommentFormProps = {
  applicationId: number
  types: Record<string, string>
  onAdded: () => void
  onError: (message?: string) => void
}

// The type select appears only when the user may write a conclusion as well as a comment.
export function CommentForm({ applicationId, types, onAdded, onError }: CommentFormProps) {
  const [body, setBody] = useState("")
  const [type, setType] = useState("comment")
  const [sending, setSending] = useState(false)
  const options = Object.entries(types)

  const submit = async (event?: FormEvent) => {
    event?.preventDefault()
    if (!body.trim() || sending) return
    setSending(true)
    onError(undefined)
    try {
      await addComment(applicationId, body.trim(), type)
      setBody("")
      setType("comment")
      onAdded()
    } catch (err) {
      onError(getApiErrorMessage(err))
    } finally {
      setSending(false)
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <Textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) void submit()
        }}
        maxLength={COMMENT_MAX_LENGTH}
        rows={3}
        placeholder="დაწერეთ კომენტარი…"
        aria-label="კომენტარი"
        disabled={sending}
      />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        {options.length > 1 ? (
          <Select value={type} onValueChange={setType} disabled={sending}>
            <SelectTrigger className="h-10 sm:w-56" aria-label="ჩანაწერის ტიპი">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
            </SelectContent>
          </Select>
        ) : null}
        {body.length > COMMENT_MAX_LENGTH - 500 ? (
          <span className="text-xs text-muted-foreground tabular-nums sm:mr-auto">{body.length} / {COMMENT_MAX_LENGTH}</span>
        ) : (
          <span className="hidden text-xs text-muted-foreground sm:mr-auto sm:inline">Ctrl + Enter — გაგზავნა</span>
        )}
        <Button type="submit" className="h-10" disabled={sending || !body.trim()}>
          {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          დამატება
        </Button>
      </div>
    </form>
  )
}
