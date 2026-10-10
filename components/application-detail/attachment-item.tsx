"use client"

import { Download, FileText, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { shortName } from "@/lib/applications"
import { attachmentUrl, formatFileSize, isImage, type Attachment } from "@/lib/attachments"
import { formatDate } from "@/lib/format"

type AttachmentItemProps = { applicationId: number; attachment: Attachment; onDelete: (attachment: Attachment) => void }

export function AttachmentItem({ applicationId, attachment, onDelete }: AttachmentItemProps) {
  const preview = attachmentUrl(applicationId, attachment.id, true)

  return (
    <li className="flex items-center gap-3 rounded-lg border p-2.5">
      <a href={preview} target="_blank" rel="noreferrer" className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted" aria-label={`გახსნა: ${attachment.file_name}`}>
        {isImage(attachment) ? (
          // A private file served by the API with the auth cookie; next/image can't optimize it.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="size-full object-cover" loading="lazy" />
        ) : (
          <FileText className="size-6 text-muted-foreground" />
        )}
      </a>

      <div className="min-w-0 flex-1">
        <a href={preview} target="_blank" rel="noreferrer" className="block truncate text-sm font-semibold hover:underline">
          {attachment.file_name}
        </a>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <Badge variant="outline">{attachment.category_label}</Badge>
          <span className="tabular-nums">{formatFileSize(attachment.size)}</span>
          <span className="tabular-nums">{shortName(attachment.uploaded_by)} · {formatDate(attachment.created_at)}</span>
        </div>
      </div>

      <Button asChild variant="outline" size="icon" className="size-10 shrink-0">
        <a href={attachmentUrl(applicationId, attachment.id)} aria-label="ჩამოტვირთვა" title="ჩამოტვირთვა">
          <Download className="size-4" />
        </a>
      </Button>
      {attachment.can_delete ? (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="icon" className="size-10 shrink-0 text-destructive hover:text-destructive" aria-label="წაშლა" title="წაშლა">
              <Trash2 className="size-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>ფაილის წაშლა</AlertDialogTitle>
              <AlertDialogDescription>„{attachment.file_name}“ განაცხადიდან წაიშლება. ჩანაწერი ისტორიაში დარჩება.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="h-10">გაუქმება</AlertDialogCancel>
              <AlertDialogAction className="h-10 bg-destructive text-white hover:bg-destructive/90" onClick={() => onDelete(attachment)}>
                წაშლა
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : null}
    </li>
  )
}
