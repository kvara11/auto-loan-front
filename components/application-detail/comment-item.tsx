import { Badge } from "@/components/ui/badge"
import { shortName } from "@/lib/applications"
import { type ApplicationComment } from "@/lib/comments"
import { formatDateTime } from "@/lib/format"
import { cn } from "@/lib/utils"

// One comment; conclusions/recommendations are tinted and labelled so they stand out in the thread.
export function CommentItem({ comment }: { comment: ApplicationComment }) {
  const isConclusion = comment.type !== "comment"

  return (
    <li className={cn("flex flex-col gap-1.5 rounded-lg border p-3", isConclusion && "border-info/40 bg-info/5")}>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="text-sm font-semibold">{shortName(comment.user)}</span>
        {comment.role_label ? <span className="text-xs text-muted-foreground">{comment.role_label}</span> : null}
        {isConclusion ? <Badge variant="info">{comment.type_label}</Badge> : null}
        <span className="ml-auto text-xs text-muted-foreground tabular-nums">{formatDateTime(comment.created_at)}</span>
      </div>
      <p className="text-sm break-words whitespace-pre-line">{comment.body}</p>
    </li>
  )
}
