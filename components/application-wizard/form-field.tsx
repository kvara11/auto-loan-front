"use client"

import { type ComponentProps, type ReactNode } from "react"

import { type CardProps, type WizardForm } from "@/components/application-wizard/wizard-form"
import { type Option } from "@/components/application-wizard/wizard-options"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

type StringField = { [K in keyof WizardForm]: WizardForm[K] extends string ? K : never }[keyof WizardForm]
type BooleanField = { [K in keyof WizardForm]: WizardForm[K] extends boolean ? K : never }[keyof WizardForm]

type FieldProps = { id: string; label: string; required?: boolean; error?: string; className?: string; children: ReactNode }

// Label + control + error message (the control gets aria-invalid for the red border).
export function Field({ id, label, required, error, className, children }: FieldProps) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-2", className)}>
      <Label htmlFor={id}>
        {label}
        {required ? <span className="text-destructive">*</span> : null}
      </Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  )
}

// "decimal": amounts, rates (12.5); "integer": counts, months, days, years.
export type NumberKind = "decimal" | "integer"

const NUMBER_KEY: Record<NumberKind, RegExp> = { decimal: /[\d.]/, integer: /\d/ }

// Number inputs: type="number" (the browser keeps letters out), no sign or exponent keys, no spin arrows,
// and the mouse wheel doesn't change the value while scrolling the page. min/max can still be passed.
export function numberInputProps(kind: NumberKind): ComponentProps<"input"> {
  return {
    type: "number",
    min: 0,
    step: kind === "decimal" ? "any" : 1,
    inputMode: kind === "decimal" ? "decimal" : "numeric",
    className: "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
    onKeyDown: (event) => {
      if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !NUMBER_KEY[kind].test(event.key)) event.preventDefault()
    },
    onWheel: (event) => event.currentTarget.blur(),
  }
}

type InputProps = CardProps & {
  name: StringField
  label: string
  required?: boolean
  className?: string
  // A number (type="number"); see numberInputProps.
  number?: NumberKind
  // A code made of digits (personal ID, IE number): stays text so leading zeros and the length are kept.
  digits?: boolean
} & Omit<ComponentProps<"input">, "name" | "value" | "onChange" | "form">

// A text input bound to one form field, or a number/digits-only one.
export function FormInput({ form, errors, set, name, label, required, className, number, digits, ...input }: InputProps) {
  const numeric = number ? numberInputProps(number) : {}

  return (
    <Field id={name} label={label} required={required} error={errors[name]} className={className}>
      <Input
        id={name}
        value={form[name]}
        onChange={(event) => set(name, digits ? event.target.value.replace(/\D/g, "") : event.target.value)}
        aria-invalid={Boolean(errors[name])}
        inputMode={digits ? "numeric" : undefined}
        {...numeric}
        {...input}
        className={cn("h-10", digits && "tabular-nums", numeric.className)}
      />
    </Field>
  )
}

type SelectProps = CardProps & {
  name: StringField
  label: string
  options: Option[]
  required?: boolean
  placeholder?: string
  className?: string
}

export function FormSelect({ form, errors, set, name, label, options, required, placeholder = "აირჩიეთ", className }: SelectProps) {
  return (
    <Field id={name} label={label} required={required} error={errors[name]} className={className}>
      <Select value={form[name] || undefined} onValueChange={(value) => set(name, value)}>
        <SelectTrigger id={name} className="h-10 w-full" aria-invalid={Boolean(errors[name])}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  )
}

export function FormCheckbox({ form, set, name, label }: CardProps & { name: BooleanField; label: string }) {
  return (
    <label htmlFor={name} className="flex min-h-10 cursor-pointer items-center gap-2.5 text-sm font-medium">
      <Checkbox id={name} checked={form[name]} onChange={(event) => set(name, event.target.checked)} />
      {label}
    </label>
  )
}
