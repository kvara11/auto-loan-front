"use client"

import { Edit, Power } from "lucide-react"

import { type Branch } from "@/components/branches/branches-types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loading } from "@/components/ui/loading"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type BranchesTableProps = {
  branches: Branch[]
  loading: boolean
  togglingId?: number
  onEdit: (branch: Branch) => void
  onToggleActive: (branch: Branch) => void
}

export function BranchesTable({ branches, loading, togglingId, onEdit, onToggleActive }: BranchesTableProps) {
  if (loading) {
    return (
      <div className="flex min-h-65 items-center justify-center rounded-xl border">
        <Loading />
      </div>
    )
  }

  if (branches.length === 0) {
    return (
      <div className="flex min-h-65 flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-6 text-center">
        <p className="text-base font-medium sm:text-lg">ფილიალები ჯერ არ არის დამატებული</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>კოდი</TableHead>
            <TableHead>სახელი</TableHead>
            <TableHead className="hidden md:table-cell">მომხმარებლები</TableHead>
            <TableHead>სტატუსი</TableHead>
            <TableHead className="text-right">ოპერირება</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {branches.map((branch) => (
            <TableRow key={branch.id}>
              <TableCell className="font-medium">{branch.code}</TableCell>
              <TableCell>{branch.name}</TableCell>
              <TableCell className="hidden md:table-cell">{branch.users_count}</TableCell>
              <TableCell>
                <Badge variant={branch.is_active ? "success" : "inactive"}>
                  {branch.is_active ? "აქტიური" : "გათიშული"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10"
                    onClick={() => onEdit(branch)}
                    aria-label="რედაქტირება"
                  >
                    <Edit className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10"
                    onClick={() => onToggleActive(branch)}
                    disabled={togglingId === branch.id}
                    aria-label={branch.is_active ? "გათიშვა" : "გააქტიურება"}
                  >
                    <Power className="size-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
