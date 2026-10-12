"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { MessageSquarePlus } from "lucide-react"

import { FormNotice } from "@/components/settings/settings-section"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { getApiErrorMessage } from "@/lib/axios"
import { FEEDBACK_TYPES, sendFeedback, type FeedbackType } from "@/lib/feedback"
import { cn } from "@/lib/utils"

const MAX = 2000

// T-209: any user writes a defect or a suggestion from the top bar; only super-admin reads them.
export function FeedbackButton() {
  const pathname = usePathname()
  const [type, setType] = useState<FeedbackType>("bug")
  const [body, setBody] = useState("")
  const [sending, setSending] = useState(false)
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string }>()

  const send = async () => {
    if (!body.trim()) return
    setSending(true)
    setNotice(undefined)
    try {
      const message = await sendFeedback({ type, body: body.trim(), page: pathname })
      setBody("")
      setNotice({ tone: "success", text: message || "მადლობა! შეტყობინება გაიგზავნა." })
    } catch (err) {
      setNotice({ tone: "error", text: getApiErrorMessage(err) || "შეტყობინება ვერ გაიგზავნა" })
    } finally {
      setSending(false)
    }
  }

  return (
    <Popover onOpenChange={(open) => !open && setNotice(undefined)}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="უკუკავშირი"
          title="უკუკავშირი"
          className="flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <MessageSquarePlus className="size-5" />
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-[22rem] max-w-[calc(100vw-2rem)] gap-3 p-4">
        <div>
          <p className="text-sm font-semibold">მოგვწერეთ</p>
          <p className="text-xs text-muted-foreground">შენიშნეთ ხარვეზი ან გაქვთ იდეა? წაიკითხავს სისტემის ადმინისტრატორი.</p>
        </div>

        <div role="radiogroup" aria-label="ტიპი" className="grid grid-cols-2 gap-1 rounded-[10px] bg-muted p-[3px]">
          {(Object.keys(FEEDBACK_TYPES) as FeedbackType[]).map((key) => (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={type === key}
              onClick={() => setType(key)}
              className={cn("h-9 rounded-[8px] text-sm font-medium transition-colors", type === key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
            >
              {FEEDBACK_TYPES[key]}
            </button>
          ))}
        </div>

        <Textarea
          aria-label="შეტყობინება"
          rows={4}
          maxLength={MAX}
          placeholder={type === "bug" ? "რა მოხდა და სად?" : "რა გავაუმჯობესოთ?"}
          value={body}
          onChange={(event) => setBody(event.target.value)}
        />
        {notice ? <FormNotice tone={notice.tone}>{notice.text}</FormNotice> : null}

        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground tabular-nums">{body.length} / {MAX}</span>
          <Button type="button" className="h-10" disabled={sending || !body.trim()} onClick={() => void send()}>
            {sending ? "იგზავნება..." : "გაგზავნა"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
