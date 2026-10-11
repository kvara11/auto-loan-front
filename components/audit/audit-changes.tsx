import { Badge } from "@/components/ui/badge"
import { type AuditEvent, fieldLabel, formatAuditValue } from "@/lib/audit"

// The details of one entry: field | იყო | გახდა; a permission list shows what was added and removed.
export function AuditChanges({ event }: { event: AuditEvent }) {
  const oldValues = event.old_values ?? {}
  const newValues = event.new_values ?? {}
  const keys = [...new Set([...Object.keys(oldValues), ...Object.keys(newValues)])]

  if (keys.length === 0) {
    return <p className="text-sm text-muted-foreground">დამატებითი მონაცემები არ არის.</p>
  }

  return (
    <div className="rounded-lg border bg-card">
      {/* Fixed thirds: long values wrap instead of pushing the table off a phone screen. */}
      <table className="w-full table-fixed text-sm">
        <thead>
          <tr className="border-b text-left text-xs font-semibold tracking-[0.03em] text-muted-foreground uppercase">
            <th className="w-[30%] px-3 py-2">ველი</th>
            <th className="px-3 py-2">იყო</th>
            <th className="px-3 py-2">გახდა</th>
          </tr>
        </thead>
        <tbody>
          {keys.map((key) =>
            key === "permissions" ? (
              <PermissionsRow key={key} before={asList(oldValues[key])} after={asList(newValues[key])} />
            ) : (
              <tr key={key} className="border-b last:border-0 align-top">
                <td className="px-3 py-2 font-medium break-words">{fieldLabel(key)}</td>
                <td className="px-3 py-2 break-words text-muted-foreground">{formatAuditValue(key, oldValues[key])}</td>
                <td className="px-3 py-2 break-words">{formatAuditValue(key, newValues[key])}</td>
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  )
}

const asList = (value: unknown) => (Array.isArray(value) ? value.map(String) : [])

function PermissionsRow({ before, after }: { before: string[]; after: string[] }) {
  const added = after.filter((name) => !before.includes(name))
  const removed = before.filter((name) => !after.includes(name))

  return (
    <tr className="border-b last:border-0 align-top">
      <td className="px-3 py-2 font-medium break-words">{fieldLabel("permissions")}</td>
      <td className="px-3 py-2" colSpan={2}>
        <div className="flex flex-wrap gap-1.5">
          {added.map((name) => <Badge key={`+${name}`} variant="success">+ {name}</Badge>)}
          {removed.map((name) => <Badge key={`-${name}`} variant="destructive">− {name}</Badge>)}
          {added.length + removed.length === 0 ? <span className="text-muted-foreground">ცვლილება არ არის</span> : null}
        </div>
      </td>
    </tr>
  )
}
