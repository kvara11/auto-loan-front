import { api } from "@/lib/axios"

export type ApplicationComment = {
  id: number
  type: string
  type_label: string
  body: string
  user: { id: number; first_name: string; last_name: string } | null
  // Snapshot of the author's role when they wrote it.
  role: string | null
  role_label: string | null
  created_at: string
}

export type CommentList = {
  comments: ApplicationComment[]
  // The types the current user may write now (type → label); empty = read only.
  types: Record<string, string>
}

// Same limit as the backend's ApplicationComment::MAX_LENGTH.
export const COMMENT_MAX_LENGTH = 5000

const base = (applicationId: number | string) => `/api/applications/${applicationId}/comments`

export async function fetchComments(applicationId: number | string): Promise<CommentList> {
  const response = await api.get<CommentList>(base(applicationId))
  return { comments: response.data?.comments ?? [], types: response.data?.types ?? {} }
}

export async function addComment(applicationId: number, body: string, type: string) {
  const response = await api.post<{ comment: ApplicationComment }>(base(applicationId), { body, type })
  return response.data?.comment
}
