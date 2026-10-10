"use client"

import { useCallback, useEffect, useState } from "react"

import { AttachmentItem } from "@/components/application-detail/attachment-item"
import { AttachmentUpload } from "@/components/application-detail/attachment-upload"
import { FormNotice } from "@/components/settings/settings-section"
import { deleteAttachment, fetchAttachments, type Attachment, type AttachmentList } from "@/lib/attachments"
import { getApiErrorMessage } from "@/lib/axios"

type AttachmentsCardProps = {
  applicationId: number
  // Status changes open or close the upload window, so the list reloads with it.
  status: string
  onChanged: () => void
}

// "დანართები" (T-406): photos and PDFs of the application, including the Credit Info report.
export function AttachmentsCard({ applicationId, status, onChanged }: AttachmentsCardProps) {
  const [data, setData] = useState<AttachmentList | null>(null)
  const [error, setError] = useState<string>()

  const load = useCallback(() => {
    fetchAttachments(applicationId).then(setData).catch((err) => setError(getApiErrorMessage(err)))
  }, [applicationId])

  useEffect(() => {
    load()
  }, [load, status])

  const remove = async (attachment: Attachment) => {
    setError(undefined)
    try {
      await deleteAttachment(applicationId, attachment.id)
      load()
      onChanged()
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
  }

  const items = data?.attachments ?? []

  return (
    <section className="flex flex-col gap-3 rounded-xl border bg-card p-5 shadow-sm sm:p-[22px]">
      <h2 className="text-[17px] font-semibold">
        დანართები <span className="text-sm font-normal text-muted-foreground tabular-nums">{items.length ? `(${items.length})` : ""}</span>
      </h2>

      {data?.can_upload ? (
        <AttachmentUpload
          applicationId={applicationId}
          categories={data.categories}
          onUploaded={() => {
            load()
            onChanged()
          }}
          onError={setError}
        />
      ) : null}
      {error ? <FormNotice tone="error">{error}</FormNotice> : null}

      {data && items.length === 0 ? <p className="py-4 text-center text-sm text-muted-foreground">ფაილები არ არის დამატებული</p> : null}
      <ul className="flex flex-col gap-2">
        {items.map((attachment) => (
          <AttachmentItem key={attachment.id} applicationId={applicationId} attachment={attachment} onDelete={remove} />
        ))}
      </ul>
    </section>
  )
}
