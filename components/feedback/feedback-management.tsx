"use client"

import { useEffect, useState } from "react"

import { FeedbackReplyDialog } from "@/components/feedback/feedback-reply-dialog"
import { FeedbackTable } from "@/components/feedback/feedback-table"
import { TablePagination } from "@/components/shared/table-pagination"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PAGE_SIZE_OPTIONS } from "@/lib/applications"
import {
  FEEDBACK_STATUSES,
  FEEDBACK_TYPES,
  feedbackErrorMessage,
  fetchFeedbackPage,
  type Feedback,
  type FeedbackFilters,
} from "@/lib/feedback"
import { type PageMeta } from "@/lib/pagination"

// Radix Select can't use "" as an item value.
const ALL = "all"

type Query = { filters: FeedbackFilters; page: number; perPage: number }

// T-209: super-admin's list of users' feedback; opens on the new ones.
export function FeedbackManagement() {
  const [items, setItems] = useState<Feedback[]>([])
  const [meta, setMeta] = useState<PageMeta>()
  const [query, setQuery] = useState<Query>({ filters: { status: "new", type: "" }, page: 1, perPage: PAGE_SIZE_OPTIONS[1] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()
  const [replying, setReplying] = useState<Feedback>()

  useEffect(() => {
    let active = true

    fetchFeedbackPage(query.filters, query.page, query.perPage)
      .then((result) => {
        if (!active) return
        setItems(result.items)
        setMeta(result.meta)
        setError(undefined)
      })
      .catch((err) => active && setError(feedbackErrorMessage(err, "შეტყობინებების ჩატვირთვა ვერ მოხერხდა")))
      .finally(() => active && setLoading(false))

    return () => {
      active = false
    }
  }, [query])

  const changeQuery = (next: Partial<Query>) => {
    setLoading(true)
    setQuery((current) => ({ ...current, page: 1, ...next }))
  }
  const setFilter = (patch: Partial<FeedbackFilters>) => changeQuery({ filters: { ...query.filters, ...patch } })

  if (error) {
    return (
      <div className="flex min-h-65 items-center justify-center rounded-xl border border-dashed bg-card px-6 text-center">
        <p className="text-base font-medium">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm sm:flex-row sm:items-end">
        <FilterSelect id="feedback-filter-status" label="სტატუსი" value={query.filters.status} all="ყველა სტატუსი" options={FEEDBACK_STATUSES} onChange={(status) => setFilter({ status: status as FeedbackFilters["status"] })} />
        <FilterSelect id="feedback-filter-type" label="ტიპი" value={query.filters.type} all="ყველა ტიპი" options={FEEDBACK_TYPES} onChange={(type) => setFilter({ type: type as FeedbackFilters["type"] })} />
      </div>

      <FeedbackTable items={items} loading={loading} onReply={setReplying} />
      {meta ? (
        <TablePagination
          meta={meta}
          sizes={PAGE_SIZE_OPTIONS}
          disabled={loading}
          onPageChange={(page) => changeQuery({ page })}
          onPerPageChange={(perPage) => changeQuery({ perPage })}
        />
      ) : null}

      {replying ? (
        <FeedbackReplyDialog
          item={replying}
          onClose={() => setReplying(undefined)}
          onSaved={(saved) => {
            setItems((current) => current.map((item) => (item.id === saved.id ? saved : item)))
            setReplying(undefined)
          }}
        />
      ) : null}
    </div>
  )
}

type FilterSelectProps = { id: string; label: string; value: string; all: string; options: Record<string, string>; onChange: (value: string) => void }

function FilterSelect({ id, label, value, all, options, onChange }: FilterSelectProps) {
  return (
    <div className="space-y-2 sm:w-50">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value || ALL} onValueChange={(next) => onChange(next === ALL ? "" : next)}>
        <SelectTrigger id={id} className="h-10 w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{all}</SelectItem>
          {Object.entries(options).map(([key, text]) => (
            <SelectItem key={key} value={key}>
              {text}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
