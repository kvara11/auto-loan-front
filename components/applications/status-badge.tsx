import { Badge, BadgeDot } from "@/components/ui/badge"
import { getStatusInfo } from "@/lib/application-status"

export function StatusBadge({ status, short = false }: { status: string | null | undefined; short?: boolean }) {
  const info = getStatusInfo(status)

  return (
    <Badge variant={info.key}>
      <BadgeDot />
      {short ? info.shortLabel : info.label}
    </Badge>
  )
}
