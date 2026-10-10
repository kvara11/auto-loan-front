"use client"

import { useEffect, useState } from "react"

export type VehicleOption = { id: number; title: string }
export type VehicleModel = VehicleOption & { make_id: number }
export type VehicleOptions = { makes: VehicleOption[]; models: VehicleModel[]; fuels: VehicleOption[]; transmissions: VehicleOption[] }

const EMPTY: VehicleOptions = { makes: [], models: [], fuels: [], transmissions: [] }

// car_db reference data through this app's proxy (app/api/stats/vehicle-options adds the API key).
export function useVehicleOptions() {
  const [options, setOptions] = useState<VehicleOptions>(EMPTY)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    fetch("/api/stats/vehicle-options")
      .then((response) => response.json())
      .then((json) => {
        if (active && json.success && json.data) setOptions(json.data)
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  return { options, loading }
}
