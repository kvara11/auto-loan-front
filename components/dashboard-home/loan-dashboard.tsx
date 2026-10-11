"use client"

import { type ReactNode } from "react"

import { ActivityBlock } from "@/components/dashboard-home/activity-block"
import { AttentionBlock } from "@/components/dashboard-home/attention-block"
import { FunnelBlock } from "@/components/dashboard-home/funnel-block"
import { AgeBlock, IncomeBlock, RankBlock, TermsBlock } from "@/components/dashboard-home/insight-blocks"
import { KpiGrid, PortfolioRow } from "@/components/dashboard-home/kpi-grid"
import { MyWorkBlock } from "@/components/dashboard-home/my-work-block"
import { ErrorBanner, OverviewHead } from "@/components/dashboard-home/overview-head"
import { PeriodSwitcher } from "@/components/dashboard-home/period-switcher"
import { QueueBlock } from "@/components/dashboard-home/queue-block"
import { ReportBlock } from "@/components/dashboard-home/report-block"
import { StatusBlock } from "@/components/dashboard-home/status-block"
import { TeamBlock } from "@/components/dashboard-home/team-block"
import { TrendBlock } from "@/components/dashboard-home/trend-block"
import { useDashboardParams, useOverview } from "@/components/dashboard-home/use-dashboard"
import { useAuthUser } from "@/lib/auth-storage"
import { buildKpis } from "@/lib/dashboard/kpis"
import { mockOverview } from "@/lib/dashboard/mock"
import { type Persona } from "@/lib/dashboard/types"

// The design's 12-column layouts (DashView `L`): [block, desktop span, half-width from md].
const LAYOUT: Record<Persona, [string, number, boolean?][]> = {
  manager: [["kpi", 12], ["pf", 12], ["att", 4], ["fn", 8], ["st", 4], ["tr", 8], ["br", 6, true], ["te", 6, true], ["in", 6, true], ["ag", 6, true], ["tm", 8], ["ac", 4], ["rp", 12]],
  officer: [["kpi", 12], ["pf", 12], ["my", 8], ["att", 4], ["fn", 7], ["st", 5], ["tr", 12], ["br", 4, true], ["te", 4, true], ["ac", 4], ["in", 6, true], ["ag", 6, true], ["rp", 12]],
  risk: [["q", 8], ["kpi", 4], ["pf", 12], ["att", 4], ["st", 8], ["tr", 12], ["te", 4, true], ["in", 4, true], ["ag", 4, true], ["br", 6, true], ["ac", 6], ["rp", 12]],
}

const SPAN: Record<number, string> = { 4: "xl:col-span-4", 5: "xl:col-span-5", 6: "xl:col-span-6", 7: "xl:col-span-7", 8: "xl:col-span-8", 12: "xl:col-span-12" }

// Mirrors the backend's DashboardController::persona(), used until the first response arrives.
export function personaFor(permissions: string[] = []): Persona {
  if (permissions.includes("applications.view.all") || permissions.includes("applications.view.branch")) return "manager"
  if (permissions.includes("applications.create")) return "officer"
  return "risk"
}

export function LoanDashboard() {
  const user = useAuthUser()
  const { query, setQuery, view, mock, persona: forced } = useDashboardParams()
  const fallback = mock && ["manager", "officer", "risk"].includes(forced ?? "") ? (forced as Persona) : personaFor(user?.permissions)
  const { data, loading, error, updatedAt, retry } = useOverview(query, view, mock, fallback)
  const persona = data?.persona ?? fallback
  const kpis = buildKpis(data ?? mockOverview(query, persona, true))
  const name = user ? `${user.first_name} ${user.last_name}` : ""

  const head = {
    manager: [user?.branch && !user.permissions?.includes("applications.view.all") ? `${user.branch.name} — ფილიალის მიმოხილვა` : "საერთო მიმოხილვა",
      "ყველა მაჩვენებელი შედარებულია წინა ანალოგიურ პერიოდთან"],
    officer: ["ჩემი მიმოხილვა", `მხოლოდ თქვენი განაცხადები · ${[name, user?.branch?.name].filter(Boolean).join(", ")}`],
    risk: ["რისკების მიმოხილვა", "ყველა ფილიალი · რიგი დალაგებულია ლოდინის დროით"],
  }[persona]

  const blocks: Record<string, ReactNode> = {
    kpi: <KpiGrid kpis={kpis} loading={loading} compact={persona === "risk"} />,
    pf: <PortfolioRow />,
    q: <QueueBlock items={data?.queue_items} total={data?.queue.count ?? 0} loading={loading} />,
    my: <MyWorkBlock data={data?.mine} loading={loading} />,
    att: <AttentionBlock data={data?.attention} persona={persona} loading={loading} />,
    fn: <FunnelBlock data={data?.funnel} periodLabel={data?.period.label} loading={loading} />,
    st: <StatusBlock data={data?.statuses} loading={loading} />,
    tr: <TrendBlock data={data?.trend} loading={loading} />,
    br: <RankBlock data={data} loading={loading} />,
    te: <TermsBlock data={data} loading={loading} />,
    in: <IncomeBlock data={data} loading={loading} />,
    ag: <AgeBlock data={data} loading={loading} />,
    tm: <TeamBlock rows={data?.team} periodLabel={data?.period.label} loading={loading} />,
    ac: <ActivityBlock events={data?.activity} meId={user?.id} officerView={persona === "officer"} loading={loading} />,
    rp: <ReportBlock rows={data?.report} current={query.period} loading={loading} />,
  }

  return (
    <div className="flex flex-col gap-3.5 sm:gap-5">
      <OverviewHead title={head[0]} text={head[1]}>
        <PeriodSwitcher query={query} onChange={setQuery} />
      </OverviewHead>
      {error ? <ErrorBanner hasData={Boolean(data)} updatedAt={updatedAt} message={error} onRetry={retry} /> : null}
      <div className="grid grid-cols-12 items-stretch gap-3.5 sm:gap-5">
        {LAYOUT[persona].map(([key, span, half]) => (
          <div key={key} className={`col-span-12 flex min-w-0 flex-col [&>*]:flex-1 ${half ? "md:col-span-6" : ""} ${SPAN[span]}`}>
            {blocks[key]}
          </div>
        ))}
      </div>
    </div>
  )
}
