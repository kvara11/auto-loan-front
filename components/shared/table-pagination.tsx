"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type PageMeta } from "@/lib/pagination"

type TablePaginationProps = {
  meta: PageMeta
  // Page sizes offered in the select.
  sizes: number[]
  disabled?: boolean
  onPageChange: (page: number) => void
  onPerPageChange: (perPage: number) => void
}

// "ნაჩვენებია X–Y / N", page size and previous/next for a server-paginated list.
export function TablePagination({ meta, sizes, disabled, onPageChange, onPerPageChange }: TablePaginationProps) {
  if (meta.total === 0) return null

  const from = (meta.current_page - 1) * meta.per_page + 1
  const to = Math.min(meta.current_page * meta.per_page, meta.total)

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground tabular-nums">
        ნაჩვენებია {from}–{to} / {meta.total}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">გვერდზე:</span>
        <Select value={String(meta.per_page)} onValueChange={(next) => onPerPageChange(Number(next))} disabled={disabled}>
          <SelectTrigger className="h-10 w-20" aria-label="ჩანაწერები გვერდზე">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sizes.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="ml-auto flex items-center gap-2 sm:ml-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-10"
            aria-label="წინა გვერდი"
            title="წინა გვერდი"
            disabled={disabled || meta.current_page <= 1}
            onClick={() => onPageChange(meta.current_page - 1)}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="min-w-14 text-center text-sm tabular-nums">
            {meta.current_page} / {meta.last_page}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-10"
            aria-label="შემდეგი გვერდი"
            title="შემდეგი გვერდი"
            disabled={disabled || meta.current_page >= meta.last_page}
            onClick={() => onPageChange(meta.current_page + 1)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
