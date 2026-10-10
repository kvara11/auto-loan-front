import { api } from "@/lib/axios"

export type Attachment = {
  id: number
  category: string
  category_label: string
  file_name: string
  mime_type: string | null
  size: number
  uploaded_by: { id: number; first_name: string; last_name: string } | null
  created_at: string
  can_delete: boolean
}

export type AttachmentList = {
  attachments: Attachment[]
  // The current user may add files now (officer: own Draft/Returned; risk reviewer: Submitted).
  can_upload: boolean
  categories: Record<string, string>
}

// Same limits as the backend's StoreAttachmentRequest.
export const ATTACHMENT_ACCEPT = ".jpg,.jpeg,.png,.webp,.heic,.heif,.pdf"
export const ATTACHMENT_MAX_BYTES = 20 * 1024 * 1024

const base = (applicationId: number | string) => `/api/applications/${applicationId}/attachments`

export async function fetchAttachments(applicationId: number | string): Promise<AttachmentList> {
  const response = await api.get<AttachmentList>(base(applicationId))
  return response.data ?? { attachments: [], can_upload: false, categories: {} }
}

export async function uploadAttachment(applicationId: number, file: File, category: string, onProgress?: (percent: number) => void) {
  const body = new FormData()
  body.append("file", file)
  body.append("category", category)

  // The axios instance defaults to JSON; multipart must be set so FormData isn't turned into JSON.
  const response = await api.post<{ attachment: Attachment }>(base(applicationId), body, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (event) => onProgress?.(event.total ? Math.round((event.loaded / event.total) * 100) : 0),
  })
  return response.data?.attachment
}

export async function deleteAttachment(applicationId: number, attachmentId: number) {
  return api.delete(`${base(applicationId)}/${attachmentId}`)
}

// Direct link to the API: the auth cookie goes along because API and app are the same site
// (127.0.0.1). `inline` opens images/PDFs in the browser instead of downloading.
export function attachmentUrl(applicationId: number, attachmentId: number, inline = false) {
  return `${process.env.NEXT_PUBLIC_API_URL}${base(applicationId)}/${attachmentId}/download${inline ? "?inline=1" : ""}`
}

export const isImage = (attachment: Attachment) => /^image\/(jpeg|png|webp)$/.test(attachment.mime_type ?? "")

export function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
