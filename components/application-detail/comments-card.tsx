"use client"

import { useCallback, useEffect, useState } from "react"

import { CommentForm } from "@/components/application-detail/comment-form"
import { CommentItem } from "@/components/application-detail/comment-item"
import { FormNotice } from "@/components/settings/settings-section"
import { fetchComments, type CommentList } from "@/lib/comments"
import { getApiErrorMessage } from "@/lib/axios"

// "კომენტარები" (T-408): the thread between officer, branch and risk; append-only, oldest first.
export function CommentsCard({ applicationId }: { applicationId: number }) {
  const [data, setData] = useState<CommentList | null>(null)
  const [error, setError] = useState<string>()

  const load = useCallback(() => {
    fetchComments(applicationId).then(setData).catch((err) => setError(getApiErrorMessage(err)))
  }, [applicationId])

  useEffect(() => {
    load()
  }, [load])

  const comments = data?.comments ?? []
  const canWrite = Object.keys(data?.types ?? {}).length > 0

  return (
    <section className="flex flex-col gap-3 rounded-xl border bg-card p-5 shadow-sm sm:p-[22px]">
      <h2 className="text-[17px] font-semibold">
        კომენტარები <span className="text-sm font-normal text-muted-foreground tabular-nums">{comments.length ? `(${comments.length})` : ""}</span>
      </h2>

      {data && comments.length === 0 ? <p className="py-2 text-center text-sm text-muted-foreground">კომენტარები ჯერ არ არის</p> : null}
      <ul className="flex flex-col gap-2">
        {comments.map((comment) => <CommentItem key={comment.id} comment={comment} />)}
      </ul>

      {error ? <FormNotice tone="error">{error}</FormNotice> : null}
      {data && canWrite ? <CommentForm applicationId={applicationId} types={data.types} onAdded={load} onError={setError} /> : null}
    </section>
  )
}
