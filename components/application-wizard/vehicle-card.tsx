"use client"

import { Field, FormInput, FormSelect } from "@/components/application-wizard/form-field"
import { useVehicleOptions, type VehicleOption } from "@/components/application-wizard/use-vehicle-options"
import { type CardProps } from "@/components/application-wizard/wizard-form"
import { CONDITION_OPTIONS, CUSTOMS_OPTIONS } from "@/components/application-wizard/wizard-options"
import { WizardSection } from "@/components/application-wizard/wizard-section"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type IdField = "car_make_id" | "car_model_id" | "fuel_type_id" | "transmission_id"

type IdSelectProps = CardProps & { name: IdField; label: string; items: VehicleOption[]; loading: boolean; disabled?: boolean }

// car_db reference selects (0 = nothing chosen).
function IdSelect({ form, errors, set, name, label, items, loading, disabled }: IdSelectProps) {
  return (
    <Field id={name} label={label} required error={errors[name]}>
      <Select value={form[name] ? String(form[name]) : undefined} onValueChange={(value) => set(name, Number(value))} disabled={loading || disabled}>
        <SelectTrigger id={name} className="h-10 w-full" aria-invalid={Boolean(errors[name])}>
          <SelectValue placeholder={loading ? "იტვირთება..." : "აირჩიეთ"} />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => <SelectItem key={item.id} value={String(item.id)}>{item.title}</SelectItem>)}
        </SelectContent>
      </Select>
    </Field>
  )
}

export function VehicleCard(props: CardProps) {
  const { options, loading } = useVehicleOptions()
  const models = options.models.filter((model) => model.make_id === props.form.car_make_id)
  // A new make clears the model, which belongs to the old one.
  const set: CardProps["set"] = (field, value) => {
    props.set(field, value)
    if (field === "car_make_id") props.set("car_model_id", 0)
  }
  const bound = { ...props, set }

  return (
    <WizardSection title="ავტომობილი" description="ინფორმაცია უზრუნველყოფის შესახებ.">
      <IdSelect {...bound} name="car_make_id" label="მარკა" items={options.makes} loading={loading} />
      <IdSelect {...bound} name="car_model_id" label="მოდელი" items={models} loading={loading} disabled={!props.form.car_make_id} />
      <FormInput {...props} name="car_year" label="წელი" inputMode="numeric" maxLength={4} required />
      <FormInput {...props} name="engine" label="ძრავი" inputMode="decimal" placeholder="მაგ: 1.8" />
      <IdSelect {...bound} name="fuel_type_id" label="საწვავის ტიპი" items={options.fuels} loading={loading} />
      <IdSelect {...bound} name="transmission_id" label="გადაცემათა კოლოფი" items={options.transmissions} loading={loading} />
      <FormInput {...props} name="mileage_km" label="გარბენი (კმ)" inputMode="numeric" />
      <FormInput {...props} name="vin" label="VIN კოდი" maxLength={17} className="[&_input]:uppercase" />
      <FormInput {...props} name="plate_number" label="სახელმწიფო ნომერი" maxLength={20} className="[&_input]:uppercase" />
      <FormInput {...props} name="seller_price" label="გამყიდველის ფასი (GEL)" inputMode="decimal" placeholder="0.00" />
      <FormSelect {...props} name="customs_status" label="განბაჟება" options={CUSTOMS_OPTIONS} />
      <FormSelect {...props} name="vehicle_condition" label="მდგომარეობა" options={CONDITION_OPTIONS} />
    </WizardSection>
  )
}
