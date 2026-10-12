"use client"

import Link from "next/link"
import { Reply } from "lucide-react"

import { UserAvatar } from "@/components/dashboard/user-avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loading } from "@/components/ui/loading"
import { STATUS_VARIANT, type Feedback } from "@/lib/feedback"
import { formatDateTime } from "@/lib/format"

type FeedbackTableProps = { items: Feedback[]; loading: boolean; onReply: (item: Feedback) => void }

const GRID = "md:grid-cols-[132px_210px_minmax(0,1fr)_104px_40px]"

// Rows instead of a <table> (like the change log), so an entry stacks on mobile.
export function FeedbackTable({ items, loading, onReply }: FeedbackTableProps) {
  if (loading) {
    return (
      <div className="flex min-h-65 items-center justify-center rounded-xl border bg-card shadow-sm">
        <Loading />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-65 items-center justify-center rounded-xl border border-dashed bg-card px-6 text-center">
        <p className="text-base font-medium sm:text-lg">შეტყობინებები არ არის</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className={`hidden gap-4 border-b px-4 py-3 text-xs font-semibold tracking-[0.03em] text-muted-foreground uppercase md:grid ${GRID}`}>
        <span>დრო</span>
        <span>ავტორი</span>
        <span>შეტყობინება</span>
        <span>სტატუსი</span>
        <span />
      </div>
      {items.map((item) => (
        <FeedbackRow key={item.id} item={item} onReply={() => onReply(item)} />
      ))}
    </div>
  )
}

function FeedbackRow({ item, onReply }: { item: Feedback; onReply: () => void }) {
  const author = item.user ? `${item.user.first_name} ${item.user.last_name}` : "—"
  const details = [item.user?.role, item.user?.branch?.name, item.user && !item.user.active ? "გათიშული" : null].filter(Boolean).join(" · ")

  return (
    <div className={`grid grid-cols-[minmax(0,1fr)_40px] items-start gap-x-4 gap-y-2 border-b px-4 py-3.5 text-sm last:border-0 ${GRID}`}>
      <span className="text-xs text-muted-foreground tabular-nums md:pt-1 md:text-[13px]">{formatDateTime(item.created_at)}</span>
      <Button variant="outline" size="icon" className="size-9 justify-self-end md:order-last" title="პასუხი და სტატუსი" aria-label="პასუხი და სტატუსი" onClick={onReply}>
        <Reply className="size-4" />
      </Button>

      <span className="col-span-2 flex min-w-0 items-center gap-2 md:col-span-1">
        <UserAvatar user={item.user} className="size-8" fallbackClassName="text-[11px]" />
        <span className="flex min-w-0 flex-col">
          <span className="truncate font-medium">{author}</span>
          {details ? <span className="truncate text-xs text-muted-foreground">{details}</span> : null}
        </span>
      </span>

      <div className="col-span-2 flex min-w-0 flex-col gap-1.5 md:col-span-1">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant={item.type === "bug" ? "warning" : "info"}>{item.type_label}</Badge>
          {item.page ? (
            <Link href={item.page} className="truncate hover:text-foreground hover:underline">
              {item.page}
            </Link>
          ) : null}
        </div>
        <p className="break-words whitespace-pre-line">{item.body}</p>
        {item.reply ? (
          <p className="rounded-lg border-l-2 border-primary bg-muted px-3 py-2 text-[13px] break-words whitespace-pre-line">
            <span className="font-medium">პასუხი: </span>
            {item.reply}
          </p>
        ) : null}
      </div>

      <span className="col-span-2 md:col-span-1 md:pt-0.5">
        <Badge variant={STATUS_VARIANT[item.status]}>{item.status_label}</Badge>
      </span>
    </div>
  )
}
