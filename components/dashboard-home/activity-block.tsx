import Link from "next/link"
import { Activity } from "lucide-react"

import { Block, Empty, SkeletonRows } from "@/components/dashboard-home/block"
import { StatusBadge } from "@/components/applications/status-badge"
import { UserAvatar } from "@/components/dashboard/user-avatar"
import { activityText } from "@/lib/dashboard/activity"
import { relativeTime } from "@/lib/dashboard/format"
import { type ActivityEvent } from "@/lib/dashboard/types"

type Props = { events?: ActivityEvent[]; meId?: number; officerView: boolean; loading: boolean }

export function ActivityBlock({ events, meId, officerView, loading }: Props) {
  return (
    <Block
      title="ბოლო აქტივობა"
      action={<Link href="/dashboard/applications" className="inline-flex min-h-8 items-center text-[13px] font-semibold text-primary hover:underline">ისტორია →</Link>}
      loading={loading}
      skeleton={<SkeletonRows count={5} className="h-10" />}
      empty={events && events.length === 0 ? <Empty icon={<Activity strokeWidth={1.6} />} title="აქტივობა ჯერ არ არის" text="მოვლენები აქ გამოჩნდება რეალურ დროში." /> : null}
    >
      <ul className="flex flex-col">
        {events?.map((event) => {
          const t = activityText(event, meId, officerView)
          return (
            <li key={event.id} className="grid grid-cols-[30px_minmax(0,1fr)] gap-2.5 border-b py-2.5 last:border-b-0">
              <UserAvatar user={event.actor ?? { first_name: "?", last_name: "" }} className="size-[30px]" fallbackClassName="text-[11px]" />
              <div className="min-w-0">
                <p className="text-[13px] leading-normal">
                  <b className="font-semibold">{t.who}</b> {t.verb}{" "}
                  {event.application ? (
                    <Link href={`/dashboard/applications/${event.application.id}`} className="font-semibold text-foreground hover:underline" title={event.application.application_no ?? undefined}>{t.id}</Link>
                  ) : null}
                  {t.tail}
                </p>
                <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground tabular-nums">
                  {t.status ? <StatusBadge status={t.status} short /> : null}
                  <span>{relativeTime(event.created_at)}</span>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </Block>
  )
}
