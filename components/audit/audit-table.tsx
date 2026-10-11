"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

import { AuditChanges } from "@/components/audit/audit-changes"
import { UserAvatar } from "@/components/dashboard/user-avatar"
import { Badge } from "@/components/ui/badge"
import { Loading } from "@/components/ui/loading"
import { actionVariant, type AuditEvent, SUBJECT_TYPE_LABELS } from "@/lib/audit"
import { formatDateTime } from "@/lib/format"
import { cn } from "@/lib/utils"

type AuditTableProps = { events: AuditEvent[]; loading: boolean }

// Rows instead of a <table>, so an entry stacks on mobile and its details open below it.
export function AuditTable({ events, loading }: AuditTableProps) {
  const [openId, setOpenId] = useState<number>()

  if (loading) {
    return (
      <div className="flex min-h-65 items-center justify-center rounded-xl border bg-card shadow-sm">
        <Loading />
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="flex min-h-65 items-center justify-center rounded-xl border border-dashed bg-card px-6 text-center">
        <p className="text-base font-medium sm:text-lg">ჩანაწერები ვერ მოიძებნა</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="hidden grid-cols-[150px_210px_minmax(0,1fr)_minmax(0,1.2fr)_120px_20px] gap-4 border-b px-4 py-3 text-xs font-semibold tracking-[0.03em] text-muted-foreground uppercase md:grid">
        <span>დრო</span>
        <span>ვინ</span>
        <span>ქმედება</span>
        <span>ობიექტი</span>
        <span className="md:invisible lg:visible">IP</span>
        <span />
      </div>
      {events.map((event) => (
        <AuditRow
          key={event.id}
          event={event}
          open={openId === event.id}
          onToggle={() => setOpenId((current) => (current === event.id ? undefined : event.id))}
        />
      ))}
    </div>
  )
}

function AuditRow({ event, open, onToggle }: { event: AuditEvent; open: boolean; onToggle: () => void }) {
  const actor = event.user ? `${event.user.first_name} ${event.user.last_name}` : "სისტემაში შეუსვლელი"

  return (
    <div className="border-b last:border-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="grid min-h-14 w-full grid-cols-[minmax(0,1fr)_20px] items-center gap-x-4 gap-y-1.5 px-4 py-3 text-left text-sm transition-colors hover:bg-muted md:grid-cols-[150px_210px_minmax(0,1fr)_minmax(0,1.2fr)_120px_20px]"
      >
        <span className="text-xs text-muted-foreground tabular-nums md:text-[13px]">{formatDateTime(event.created_at)}</span>
        <ChevronDown className={cn("size-4 justify-self-end text-muted-foreground transition-transform md:order-last", open && "rotate-180")} />
        <span className="col-span-2 flex min-w-0 items-center gap-2 md:col-span-1">
          <UserAvatar user={event.user} className="size-7" fallbackClassName="text-[11px]" />
          <span className="truncate">{actor}</span>
        </span>
        <span className="col-span-2 md:col-span-1">
          <Badge variant={actionVariant(event.action)}>{event.action_label}</Badge>
        </span>
        <span className="col-span-2 min-w-0 md:col-span-1">
          <span className="block truncate font-medium">{event.subject_label ?? "—"}</span>
          {event.subject_type ? (
            <span className="text-xs text-muted-foreground">{SUBJECT_TYPE_LABELS[event.subject_type] ?? event.subject_type}</span>
          ) : null}
        </span>
        <span className="hidden text-[13px] text-muted-foreground tabular-nums md:invisible md:block lg:visible">{event.ip ?? "—"}</span>
      </button>

      {open ? (
        <div className="space-y-2 bg-muted/40 px-4 py-3">
          <AuditChanges event={event} />
          {event.ip ? <p className="text-xs text-muted-foreground lg:hidden">IP: {event.ip}</p> : null}
        </div>
      ) : null}
    </div>
  )
}
