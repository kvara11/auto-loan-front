"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Pencil, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { clientName, type Client } from "@/lib/clients"

type ClientHeaderProps = {
  client: Client
  canEdit: boolean
  canCreate: boolean
  onEdit: () => void
}

export function ClientHeader({ client, canEdit, canCreate, onEdit }: ClientHeaderProps) {
  const router = useRouter()

  // Back to wherever the user came from (list, an application); a page opened directly goes to the list.
  const goBack = () => {
    if (window.history.length > 1) router.back()
    else router.push("/dashboard/clients")
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-[22px]">
      <div className="min-w-0">
        <h1 className="text-xl font-bold break-words sm:text-[22px]">{clientName(client)}</h1>
        <p className="mt-0.5 text-sm text-muted-foreground tabular-nums">პირადი ნომერი: {client.personal_id}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {/* The wizard looks the client up by an 11-digit personal ID. */}
        {canCreate && /^\d{11}$/.test(client.personal_id) ? (
          <Button asChild className="h-10">
            <Link href={`/dashboard/applications/new?personal_id=${encodeURIComponent(client.personal_id)}`}>
              <Plus className="size-4" />
              ახალი განაცხადი
            </Link>
          </Button>
        ) : null}
        {canEdit ? (
          <Button variant="outline" className="h-10" onClick={onEdit}>
            <Pencil className="size-4" />
            რედაქტირება
          </Button>
        ) : null}
        <Button variant="outline" className="h-10" onClick={goBack}>
          <ArrowLeft className="size-4" />
          უკან
        </Button>
      </div>
    </div>
  )
}
