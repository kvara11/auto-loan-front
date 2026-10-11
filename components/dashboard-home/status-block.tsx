import { Block, Empty } from "@/components/dashboard-home/block"
import { getStatusInfo, STATUS_ORDER } from "@/lib/application-status"
import { compactMoney, fmt, money } from "@/lib/dashboard/format"
import { type Overview } from "@/lib/dashboard/types"

// The five statuses of the period's applications, each in its --status-* colour, with count and ₾ sum.
export function StatusBlock({ data, loading }: { data?: Overview["statuses"]; loading: boolean }) {
  const rows = STATUS_ORDER.map((status) => data?.find((s) => s.status === status) ?? { status, count: 0, amount: 0 })
  const max = Math.max(1, ...rows.map((r) => r.count))
  const count = rows.reduce((s, r) => s + r.count, 0)
  const amount = rows.reduce((s, r) => s + r.amount, 0)

  return (
    <Block
      title="სტატუსების განაწილება"
      meta={data ? `${fmt(count)} განაცხადი · ${compactMoney(amount)}` : null}
      loading={loading}
      empty={data && count === 0 ? <Empty title="სტატუსები ჯერ არ არის" text="განაცხადების შექმნისთანავე აქ გამოჩნდება." /> : null}
    >
      <div className="flex flex-col gap-3">
        {rows.map((row) => {
          const info = getStatusInfo(row.status)
          const color = `var(--status-${info.key})`
          return (
            <div key={row.status} className="grid grid-cols-[minmax(0,1fr)_40px_76px] items-center gap-x-2.5 gap-y-1.5 text-[13px] @md:grid-cols-[150px_minmax(0,1fr)_44px_92px]">
              <span className="flex min-w-0 items-center gap-2 font-semibold"><i className="size-2.5 flex-none rounded-[3px]" style={{ background: color }} />{info.label}</span>
              <div className="col-span-3 row-start-2 h-2.5 overflow-hidden rounded-full bg-muted @md:col-span-1 @md:row-start-auto" role="img" aria-label={`${info.label}: ${fmt(row.count)}, ${money(row.amount)}`}>
                <i className="block h-full rounded-full" style={{ width: `${(row.count / max) * 100}%`, background: color }} />
              </div>
              <span className="text-end font-bold tabular-nums">{fmt(row.count)}</span>
              <span className="text-end text-xs text-muted-foreground tabular-nums">{compactMoney(row.amount)}</span>
            </div>
          )
        })}
      </div>
    </Block>
  )
}
