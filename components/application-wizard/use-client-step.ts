"use client"

import { useState } from "react"

import { toClientPayload } from "@/components/application-wizard/wizard-payload"
import { type WizardForm } from "@/components/application-wizard/wizard-form"
import { api } from "@/lib/axios"

export type LookupStatus = "idle" | "existing" | "new"

type ClientRecord = Partial<Record<keyof WizardForm, unknown>> & { id: number }

// Step 1: find the client by personal ID, then create it or save its changes (shared registry, Q-17).
export function useClientStep() {
  const [status, setStatus] = useState<LookupStatus>("idle")
  const [clientId, setClientId] = useState<number | null>(null)
  const [snapshot, setSnapshot] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Returns the found client's fields (to merge into the form), or null for a new client.
  const lookup = async (personalId: string): Promise<Partial<WizardForm> | null> => {
    setLoading(true)
    try {
      const response = await api.get<{ client?: ClientRecord }>(`/api/clients/personal/${encodeURIComponent(personalId)}`)
      const client = response.data?.client
      if (!client?.id) {
        setStatus("new")
        return null
      }

      const fields: Partial<WizardForm> = {
        first_name: String(client.first_name ?? ""), last_name: String(client.last_name ?? ""),
        birth_date: String(client.birth_date ?? "").slice(0, 10), phone: String(client.phone ?? ""),
        email: String(client.email ?? ""), address: String(client.address ?? ""),
        legal_address: String(client.legal_address ?? ""), marital_status: String(client.marital_status ?? ""),
        family_members: client.family_members === null || client.family_members === undefined ? "" : String(client.family_members),
        legal_address_verified: Boolean(client.legal_address_verified),
      }
      setClientId(client.id)
      setStatus("existing")
      return fields
    } catch {
      // 404: not registered yet.
      setStatus("new")
      return null
    } finally {
      setLoading(false)
    }
  }

  // Edit mode: the application's client is fixed.
  const adopt = (form: WizardForm, id: number) => {
    setClientId(id)
    setStatus("existing")
    setSnapshot(JSON.stringify(toClientPayload(form)))
  }

  const remember = (form: WizardForm) => setSnapshot(JSON.stringify(toClientPayload(form)))

  const reset = () => {
    setStatus("idle")
    setClientId(null)
    setSnapshot(null)
  }

  // Creates or updates the client when needed; returns its id. Throws the API error (424 → fields).
  const save = async (form: WizardForm): Promise<number> => {
    const payload = toClientPayload(form)
    const current = JSON.stringify(payload)

    if (clientId && status === "existing") {
      if (current !== snapshot) {
        await api.put(`/api/clients/${clientId}`, payload)
        setSnapshot(current)
      }
      return clientId
    }

    const response = await api.post<{ client?: { id: number } }>("/api/clients", payload)
    const id = response.data?.client?.id
    if (!id) throw new Error(response.message || "კლიენტის შენახვა ვერ მოხერხდა")

    setClientId(id)
    setStatus("existing")
    setSnapshot(current)
    return id
  }

  return { status, clientId, loading, lookup, adopt, remember, reset, save }
}
