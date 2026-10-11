"use client"

import Link from "next/link"
import { type ReactNode } from "react"

import { Block, Chip, type ChipTone, Empty } from "@/components/dashboard-home/block"
import { ErrorBanner, OverviewHead } from "@/components/dashboard-home/overview-head"
import { useAdminOverview, useDashboardParams } from "@/components/dashboard-home/use-dashboard"
import { fmt, relativeTime, shortPerson } from "@/lib/dashboard/format"

const more = (href: string, label: string) => (
  <Link href={href} className="inline-flex min-h-8 items-center text-[13px] font-semibold text-primary hover:underline">{label} →</Link>
)

function Stat({ value, chip, tone = "ok" }: { value: number; chip: string; tone?: ChipTone }) {
  return (
    <div className="flex items-baseline gap-2.5">
      <b className="text-[34px] leading-none font-bold tabular-nums">{fmt(value)}</b>
      <Chip tone={tone}>{chip}</Chip>
    </div>
  )
}

const Rows = ({ children }: { children: ReactNode }) => <div className="flex flex-col gap-2 text-[13px] tabular-nums">{children}</div>
const Row = ({ label, value }: { label: ReactNode; value: ReactNode }) => (
  <div className="flex items-center justify-between gap-3"><span className="min-w-0 truncate text-muted-foreground">{label}</span><b>{value}</b></div>
)

// The administrator's view: no period switcher and no loan data — users, branches and security.
export function AdminDashboard() {
  const { view, mock } = useDashboardParams()
  const { data, loading, error, updatedAt, retry } = useAdminOverview(view, mock)
  const failed = data?.failed_sign_ins

  return (
    <div className="flex flex-col gap-3.5 sm:gap-5">
      <OverviewHead title="სისტემის მიმოხილვა" text="მომხმარებლები, ფილიალები და უსაფრთხოება · სესხების მონაცემები აქ არ ჩანს" />
      {error ? <ErrorBanner hasData={Boolean(data)} updatedAt={updatedAt} message={error} onRetry={retry} /> : null}
      <div className="grid grid-cols-1 gap-3.5 sm:gap-5 md:grid-cols-3">
        <Block title="მომხმარებლები" action={more("/dashboard/users", "მართვა")} loading={loading}>
          {data?.users ? (
            <>
              <Stat value={data.users.total} chip={`${fmt(data.users.active)} აქტიური`} />
              <Rows>{data.users.roles.map((r) => <Row key={r.name} label={r.label} value={fmt(r.count)} />)}</Rows>
            </>
          ) : null}
        </Block>
        <Block title="ფილიალები" action={more("/dashboard/branches", "მართვა")} loading={loading}>
          {data?.branches ? (
            <>
              <Stat value={data.branches.total} chip={`${fmt(data.branches.active)} აქტიური`} />
              <Rows>
                {data.branches.items.length === 0 ? <Row label="ფილიალები ჯერ არ არის" value="" /> : data.branches.items.map((b) => (
                  <Row key={b.code} label={`${b.code} · ${b.name}`} value={b.active ? `${fmt(b.users)} მომხმ.` : <Chip tone="m">არააქტიური</Chip>} />
                ))}
              </Rows>
            </>
          ) : null}
        </Block>
        <Block title="წარუმატებელი შესვლები" meta="ბოლო 24 სთ" loading={loading}>
          {failed ? (
            <>
              <Stat value={failed.count} tone={failed.count ? "w" : "ok"}
                chip={failed.count ? `${failed.accounts.length} ანგარიში` : "ყველაფერი რიგზეა"} />
              <Rows>
                {failed.accounts.map((a) => (
                  <Row key={`${a.username}-${a.last_at}`} label={`${a.username ?? "—"} · ${a.ip ?? "—"} · ${relativeTime(a.last_at)}`}
                    value={<Chip tone={a.attempts >= 3 ? "d" : a.attempts > 1 ? "w" : "m"}>{a.attempts} ცდა</Chip>} />
                ))}
              </Rows>
            </>
          ) : data ? <Empty title="ჟურნალის ნახვის უფლება არ გაქვთ" /> : null}
        </Block>
        <Block title="ცვლილებების ჟურნალი" action={more("/dashboard/audit", "სრული ჟურნალი")} className="md:col-span-3" loading={loading}
          empty={data && (data.changes?.length ?? 0) === 0 ? <Empty title="ცვლილებები ჯერ არ დაფიქსირებულა" /> : null}>
          <div className="flex flex-col">
            {data?.changes?.map((c) => (
              <div key={c.id} className="grid grid-cols-1 gap-0.5 border-b py-2.5 text-[13px] last:border-b-0 sm:grid-cols-[120px_minmax(0,1fr)_140px] sm:items-center sm:gap-3">
                <span className="text-xs text-muted-foreground tabular-nums">{relativeTime(c.created_at)}</span>
                <span className="min-w-0">{c.action_label}{c.subject ? `: ${c.subject}` : ""}</span>
                <span className="text-xs text-muted-foreground sm:text-end">{c.by ? shortPerson(c.by) : "სისტემა"}</span>
              </div>
            ))}
          </div>
        </Block>
      </div>
    </div>
  )
}
