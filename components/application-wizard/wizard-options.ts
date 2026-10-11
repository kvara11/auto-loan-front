// Select options of the wizard; values match the backend's validation (LoanApplicationRules, ClientRules).
export type Option = { value: string; label: string }

export const MARITAL_OPTIONS: Option[] = [
  { value: "single", label: "დასაოჯახებელი" },
  { value: "married", label: "დაოჯახებული" },
  { value: "divorced", label: "განქორწინებული" },
  { value: "widowed", label: "ქვრივი" },
]

export const INCOME_TYPE_OPTIONS: Option[] = [
  { value: "employee", label: "დასაქმებული" },
  { value: "entrepreneur", label: "მეწარმე" },
  { value: "lease", label: "იჯარა" },
]

export const FEE_TYPE_OPTIONS: Option[] = [
  { value: "amount", label: "GEL" },
  { value: "percent", label: "%" },
]

export const CUSTOMS_OPTIONS: Option[] = [
  { value: "cleared", label: "განბაჟებული" },
  { value: "not_cleared", label: "განუბაჟებელი" },
]

export const CONDITION_OPTIONS: Option[] = [
  { value: "excellent", label: "იდეალური" },
  { value: "good", label: "კარგი" },
  { value: "average", label: "საშუალო" },
  { value: "bad", label: "ცუდი" },
]

export function optionLabel(options: Option[], value: string | null | undefined) {
  return options.find((option) => option.value === value)?.label ?? value ?? ""
}
