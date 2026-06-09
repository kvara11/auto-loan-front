"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Trash2, CheckCircle2, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loading } from "@/components/ui/loading";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api, getApiErrorMessage } from "@/lib/axios";
import { cn } from "@/lib/utils";

type LeaseItem = {
  address: string;
  duration: string;
  amount: string;
  currency: string;
  cadastral: string;
};

type ApplicationForm = {
  // 1. Client Data
  personal_id: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  phone: string;
  email: string;
  marital_status: string;
  family_members: string;
  address: string;
  legal_address: string;
  legal_address_verified: boolean;
  client_id?: string | number;

  // 2. Income & Liabilities
  income_source_type: "employee" | "entrepreneur" | "lease" | "";
  existing_liabilities: string;
  // employee
  employer: string;
  position: string;
  work_experience_months: string;
  monthly_income: string;
  monthly_income_currency: string;
  // entrepreneur
  im_number: string;
  work_field: string;
  entrepreneur_income: string;
  entrepreneur_income_currency: string;
  business_address: string;
  debtor_registry_status: string;
  // lease
  lease_income_items: LeaseItem[];

  // 3. Loan Data
  requested_amount: string;
  currency: string;
  loan_term_months: string;
  annual_interest_rate: string;
  commission_fee: string;
  commission_fee_type: "amount" | "percent";
  payment_day: string;
  down_payment: string;
  loan_purpose: string;
  additional_income_enabled: boolean;
  additional_income: string;
  additional_income_currency: string;
  additional_income_type: string;

  // 4. Co-borrower / Guarantor
  has_coborrower_guarantor: boolean;
  co_borrower_name: string;
  co_borrower_personal_id: string;
  guarantor_name: string;
  guarantor_personal_id: string;

  // 5. Vehicle Details
  car_make: string;
  car_model: string;
  car_year: string;
  engine: string;
  fuel_type: string;
  transmission: string;
  mileage_km: string;
  vin: string;
  plate_number: string;
  seller_price: string;
  customs_status: string;
  vehicle_condition: string;
  market_value: string;
  comparable_count: string;
  max_ltv: string;
  vehicle_comment: string;

  // 6. Officer Comment
  officer_comment: string;
};

const defaultForm: ApplicationForm = {
  personal_id: "",
  first_name: "",
  last_name: "",
  birth_date: "",
  phone: "",
  email: "",
  marital_status: "",
  family_members: "",
  address: "",
  legal_address: "",
  legal_address_verified: false,

  income_source_type: "",
  existing_liabilities: "",
  employer: "",
  position: "",
  work_experience_months: "",
  monthly_income: "",
  monthly_income_currency: "GEL",
  im_number: "",
  work_field: "",
  entrepreneur_income: "",
  entrepreneur_income_currency: "GEL",
  business_address: "",
  debtor_registry_status: "",
  lease_income_items: [],

  requested_amount: "",
  currency: "GEL",
  loan_term_months: "",
  annual_interest_rate: "",
  commission_fee: "",
  commission_fee_type: "percent",
  payment_day: "",
  down_payment: "",
  loan_purpose: "",
  additional_income_enabled: false,
  additional_income: "",
  additional_income_currency: "GEL",
  additional_income_type: "",

  has_coborrower_guarantor: false,
  co_borrower_name: "",
  co_borrower_personal_id: "",
  guarantor_name: "",
  guarantor_personal_id: "",

  car_make: "",
  car_model: "",
  car_year: "",
  engine: "",
  fuel_type: "",
  transmission: "",
  mileage_km: "",
  vin: "",
  plate_number: "",
  seller_price: "",
  customs_status: "",
  vehicle_condition: "",
  market_value: "",
  comparable_count: "",
  max_ltv: "80",
  vehicle_comment: "",

  officer_comment: "",
};

type FormErrors = Partial<Record<keyof ApplicationForm, string>>;

const translitMap: Record<string, string> = {
  ა: "a",
  ბ: "b",
  გ: "g",
  დ: "d",
  ე: "e",
  ვ: "v",
  ზ: "z",
  თ: "t",
  ი: "i",
  კ: "k",
  ლ: "l",
  მ: "m",
  ნ: "n",
  ო: "o",
  პ: "p",
  ჟ: "zh",
  რ: "r",
  ს: "s",
  ტ: "t",
  უ: "u",
  ფ: "p",
  ქ: "k",
  ღ: "gh",
  ყ: "q",
  შ: "sh",
  ჩ: "ch",
  ც: "ts",
  ძ: "dz",
  წ: "ts",
  ჭ: "ch",
  ხ: "kh",
  ჯ: "j",
  ჰ: "h",
};

function translit(text: string) {
  return text
    .split("")
    .map((char) => translitMap[char] || char)
    .join("");
}

function titleCase(text: string) {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

function toPayloadNumber(value: string | number | undefined) {
  if (value === undefined || value === null) return undefined;
  if (typeof value === "number") return value;

  const cleanValue = value.toString().replace(/,/g, "").replace(/\s/g, "");
  if (cleanValue.trim() === "") return undefined;

  const parsed = Number(cleanValue);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export function ApplicationFormPage() {
  const router = useRouter();
  const [form, setForm] = useState<ApplicationForm>(defaultForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [lookupLoading, setLookupLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | undefined>();
  const [submitError, setSubmitError] = useState<string | undefined>();
  const [successMessage, setSuccessMessage] = useState<string | undefined>();
  const [step, setStep] = useState(1);
  const [clientLookupStatus, setClientLookupStatus] = useState<"idle" | "existing" | "new">("idle");
  const [clientId, setClientId] = useState<string | number | undefined>();

  useEffect(() => {
    if (!successMessage) return;

    const timeout = window.setTimeout(() => setSuccessMessage(undefined), 3000);

    return () => window.clearTimeout(timeout);
  }, [successMessage]);

  const updateField = <K extends keyof ApplicationForm>(
    field: K,
    value: ApplicationForm[K],
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    if (field === "personal_id") {
      setLookupError(undefined);
    }
  };

  const updateLeaseItem = (
    index: number,
    field: keyof LeaseItem,
    value: string,
  ) => {
    setForm((current) => {
      const items = [...current.lease_income_items];
      items[index] = { ...items[index], [field]: value };
      return { ...current, lease_income_items: items };
    });
  };

  const addLeaseItem = () => {
    setForm((current) => ({
      ...current,
      lease_income_items: [
        ...current.lease_income_items,
        {
          address: "",
          duration: "",
          amount: "",
          currency: "GEL",
          cadastral: "",
        },
      ],
    }));
  };

  const removeLeaseItem = (index: number) => {
    setForm((current) => ({
      ...current,
      lease_income_items: current.lease_income_items.filter(
        (_, i) => i !== index,
      ),
    }));
  };

  const mockLegalAddressCheck = () => {
    updateField("legal_address", "თბილისი, ვაკე-საბურთალო, ფალიაშვილის 41");
    updateField("legal_address_verified", true);
  };

  const mockDebtorRegistryCheck = () => {
    updateField("debtor_registry_status", "ნეგატიური ისტორია არ ფიქსირდება");
  };

  const downPaymentPercentage = useMemo(() => {
    const dp = toPayloadNumber(form.down_payment) || 0;
    const sp = toPayloadNumber(form.seller_price) || 0;
    const req = toPayloadNumber(form.requested_amount) || 0;
    const base = sp || req + dp;
    if (!base) return 0;
    return (dp / base) * 100;
  }, [form.down_payment, form.seller_price, form.requested_amount]);

  const liveLTV = useMemo(() => {
    const req = toPayloadNumber(form.requested_amount) || 0;
    const mv = toPayloadNumber(form.market_value) || 0;
    if (!mv) return 0;
    return (req / mv) * 100;
  }, [form.requested_amount, form.market_value]);

  const handleLookup = async () => {
    if (!form.personal_id.trim()) {
      setLookupError("კლიენტი ვერ მოიძებნა");
      return;
    }

    setLookupLoading(true);
    setLookupError(undefined);

    try {
      const response = await api.get<{ client?: Partial<ApplicationForm> }>(
        `/api/clients/personal/${encodeURIComponent(form.personal_id)}`,
      );

      if (!response.success || !response.data?.client) {
        setLookupError("კლიენტი ვერ მოიძებნა");
        setClientLookupStatus("new");
        return;
      }

      const client = response.data.client;

      setForm((current) => ({
        ...current,
        first_name: current.first_name || client.first_name || "",
        last_name: current.last_name || client.last_name || "",
        phone: current.phone || client.phone || "",
        email: current.email || client.email || "",
        address: current.address || client.address || "",
        legal_address: current.legal_address || client.legal_address || "",
        birth_date: current.birth_date || client.birth_date || "",
      }));
      
      if (client.id) {
        setClientId(client.id);
        setClientLookupStatus("existing");
      } else {
        setClientLookupStatus("new");
      }
    } catch (requestError) {
      setLookupError(
        getApiErrorMessage(requestError) || "კლიენტი ვერ მოიძებნა",
      );
      setClientLookupStatus("new");
    } finally {
      setLookupLoading(false);
    }
  };

  const validateStep1 = () => {
    const nextErrors: FormErrors = {};
    const required: Array<keyof ApplicationForm> = [
      "personal_id",
      "first_name",
      "last_name",
      "phone",
    ];

    for (const field of required) {
      if (!form[field]?.toString().trim()) {
        nextErrors[field] = "აუცილებელი ველი";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleNextStep = async () => {
    if (!validateStep1()) return;

    if (clientLookupStatus === "existing" && clientId) {
      setStep(2);
      return;
    }

    // Create new client
    setSubmitLoading(true);
    setSubmitError(undefined);

    try {
      const response = await api.post("/api/clients", {
        first_name: form.first_name,
        last_name: form.last_name,
        personal_id: form.personal_id,
        birth_date: form.birth_date,
        phone: form.phone,
        email: form.email,
        address: form.address,
        legal_address: form.legal_address,
      });

      if (!response.success || !response.data?.client?.id) {
        setSubmitError(response.message || "ვერ მოხერხდა კლიენტის შექმნა");
        return;
      }

      setClientId(response.data.client.id);
      setStep(2);
    } catch (err) {
      setSubmitError(getApiErrorMessage(err) || "ვერ მოხერხდა კლიენტის შექმნა");
    } finally {
      setSubmitLoading(false);
    }
  };

  const validateStep2 = () => {
    const nextErrors: FormErrors = {};
    const required: Array<keyof ApplicationForm> = [
      "requested_amount",
      "loan_term_months",
      "annual_interest_rate",
      "payment_day",
      "car_make",
      "car_model",
      "car_year",
      "market_value",
    ];

    for (const field of required) {
      const value = form[field];
      if (typeof value === "string" && !value.trim()) {
        nextErrors[field] = "აუცილებელი ველი";
      } else if (value === undefined || value === null) {
        nextErrors[field] = "აუცილებელი ველი";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validate = () => {
    const nextErrors: FormErrors = {};

    const requiredFields: Array<keyof ApplicationForm> = [
      "personal_id",
      "first_name",
      "last_name",
      "phone",
      "email",
      "requested_amount",
      "loan_term_months",
      "annual_interest_rate",
      "payment_day",
      "car_make",
      "car_model",
      "car_year",
      "market_value",
    ];

    for (const field of requiredFields) {
      const value = form[field];
      if (typeof value === "string" && !value.trim()) {
        nextErrors[field] = "აუცილებელი ველი";
      } else if (value === undefined || value === null) {
        nextErrors[field] = "აუცილებელი ველი";
      }
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateStep2()) {
      return;
    }

    if (!clientId) {
      setSubmitError("კლიენტის იდენტიფიკატორი ვერ მოიძებნა");
      return;
    }

    setSubmitLoading(true);
    setSubmitError(undefined);

    try {
      const payload = {
        ...form,
        client_id: clientId,
        requested_amount: toPayloadNumber(form.requested_amount),
        loan_term_months: toPayloadNumber(form.loan_term_months),
        annual_interest_rate: toPayloadNumber(form.annual_interest_rate),
        commission_fee: toPayloadNumber(form.commission_fee),
        payment_day: toPayloadNumber(form.payment_day),
        down_payment: toPayloadNumber(form.down_payment),
        car_year: toPayloadNumber(form.car_year),
        seller_price: toPayloadNumber(form.seller_price),
        market_value: toPayloadNumber(form.market_value),
        existing_liabilities: toPayloadNumber(form.existing_liabilities),
        monthly_income: toPayloadNumber(form.monthly_income),
        entrepreneur_income: toPayloadNumber(form.entrepreneur_income),
        additional_income: toPayloadNumber(form.additional_income),
        family_members: toPayloadNumber(form.family_members),
        mileage_km: toPayloadNumber(form.mileage_km),
        comparable_count: toPayloadNumber(form.comparable_count),
        max_ltv: toPayloadNumber(form.max_ltv),
        lease_income_items: form.lease_income_items.map((item) => ({
          ...item,
          amount: toPayloadNumber(item.amount),
        })),
      };

      const response = await api.post("/api/applications", payload);

      if (!response.success) {
        setSubmitError(response.message || "ვერ მოხერხდა განაცხადის შექმნა");
        return;
      }

      setSuccessMessage("განაცხადი წარმატებით შეიქმნა");
      window.setTimeout(() => {
        router.push("/dashboard/applications");
      }, 900);
    } catch (requestError) {
      setSubmitError(
        getApiErrorMessage(requestError) || "ვერ მოხერხდა განაცხადის შექმნა",
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="relative pb-20">
      {/* Step Indicator */}
      <div className="mb-8 flex items-center justify-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border-2 font-bold text-sm transition-colors",
                step >= 1
                  ? "border-primary bg-primary text-white"
                  : "border-slate-300 text-slate-400"
              )}
            >
              1
            </div>
            <span
              className={cn(
                "text-sm font-bold",
                step >= 1 ? "text-slate-800" : "text-slate-400"
              )}
            >
              კლიენტი
            </span>
          </div>
          <div className="h-0.5 w-12 bg-slate-200" />
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border-2 font-bold text-sm transition-colors",
                step >= 2
                  ? "border-primary bg-primary text-white"
                  : "border-slate-300 text-slate-400"
              )}
            >
              2
            </div>
            <span
              className={cn(
                "text-sm font-bold",
                step >= 2 ? "text-slate-800" : "text-slate-400"
              )}
            >
              განაცხადი
            </span>
          </div>
        </div>
      </div>

      {successMessage ? (
        <div className="fixed right-4 bottom-4 z-50 flex items-center gap-2 rounded-xl border bg-background px-4 py-3 shadow-lg animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="size-5 text-green-600" />
          <p className="text-sm font-medium">{successMessage}</p>
        </div>
      ) : null}

      <form className="space-y-6" onSubmit={handleSubmit}>
        {step === 1 && (
          <>
            {/* Section 1: Client Data */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="border-b bg-slate-50/50 pb-4">
            <CardTitle className="text-lg font-bold text-slate-800">
              1. კლიენტის მონაცემები
            </CardTitle>
            <CardDescription>
              შეიყვანეთ ძირითადი ინფორმაცია კლიენტის შესახებ.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="personal_id">პირადი ნომერი</Label>
                <div className="flex gap-2">
                  <Input
                    id="personal_id"
                    value={form.personal_id}
                    onChange={(e) => updateField("personal_id", e.target.value)}
                    placeholder="11 ნიშნა ნომერი"
                    maxLength={11}
                    className={cn(errors.personal_id && "border-red-500")}
                  />
                  <Button
                    type="button"
                    size="icon"
                    onClick={handleLookup}
                    disabled={lookupLoading}
                  >
                    {lookupLoading ? (
                      <Loading size="sm" />
                    ) : (
                      <Search className="size-4" />
                    )}
                  </Button>
                </div>
                {errors.personal_id && (
                  <p className="text-xs text-red-500">{errors.personal_id}</p>
                )}
                {lookupError && (
                  <p className="text-xs text-red-500">{lookupError}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="first_name">სახელი</Label>
                <Input
                  id="first_name"
                  value={form.first_name}
                  onChange={(e) => updateField("first_name", e.target.value)}
                  className={cn(errors.first_name && "border-red-500")}
                />
                {errors.first_name && (
                  <p className="text-xs text-red-500">{errors.first_name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">გვარი</Label>
                <Input
                  id="last_name"
                  value={form.last_name}
                  onChange={(e) => updateField("last_name", e.target.value)}
                  className={cn(errors.last_name && "border-red-500")}
                />
                {errors.last_name && (
                  <p className="text-xs text-red-500">{errors.last_name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="birth_date">დაბადების თარიღი</Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={form.birth_date}
                  onChange={(e) => updateField("birth_date", e.target.value)}
                  className={cn(errors.birth_date && "border-red-500", "block uppercase font-medium")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">ტელეფონი</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="5XXXXXXXX"
                  className={cn(errors.phone && "border-red-500")}
                />
                {errors.phone && (
                  <p className="text-xs text-red-500">{errors.phone}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">ელ-ფოსტა</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className={cn(errors.email && "border-red-500")}
                />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>ოჯახური მდგომარეობა</Label>
                <Select
                  value={form.marital_status}
                  onValueChange={(v) => updateField("marital_status", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="აირჩიეთ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">დასაოჯახებელი</SelectItem>
                    <SelectItem value="married">დაოჯახებული</SelectItem>
                    <SelectItem value="divorced">განქორწინებული</SelectItem>
                    <SelectItem value="widowed">ქვრივი</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="family_members">
                  ოჯახის წევრების რაოდენობა
                </Label>
                <Input
                  id="family_members"
                  type="number"
                  value={form.family_members}
                  onChange={(e) =>
                    updateField("family_members", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">ფაქტიური მისამართი</Label>
                <Input
                  id="address"
                  value={form.address}
                  onChange={(e) => updateField("address", e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-[1fr_auto]">
              <div className="space-y-2">
                <Label htmlFor="legal_address">იურიდიული მისამართი</Label>
                <Input
                  id="legal_address"
                  value={form.legal_address}
                  onChange={(e) => updateField("legal_address", e.target.value)}
                />
              </div>
              <div className="flex items-end gap-3 pb-0.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={mockLegalAddressCheck}
                >
                  გადამოწმება
                </Button>
                <div className="flex items-center space-x-2 h-10 px-2 border rounded-md bg-slate-50">
                  <Checkbox
                    id="legal_address_verified"
                    checked={form.legal_address_verified}
                    onChange={(e) =>
                      updateField("legal_address_verified", e.target.checked)
                    }
                  />
                  <Label
                    htmlFor="legal_address_verified"
                    className="text-xs cursor-pointer"
                  >
                    დადასტურებულია
                  </Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

          <div className="flex justify-end p-4">
            <Button
              type="button"
              onClick={handleNextStep}
              disabled={submitLoading || lookupLoading}
              className="h-11 min-w-40 font-bold"
            >
              {submitLoading ? <Loading size="sm" className="mr-2" /> : null}
              შემდეგი
            </Button>
          </div>
          </>
        )}

        {step === 2 && (
          <>
        {/* Section 2: Income & Liabilities */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="border-b bg-slate-50/50 pb-4">
            <CardTitle className="text-lg font-bold text-slate-800">
              2. შემოსავლები და ვალდებულებები
            </CardTitle>
            <CardDescription>
              ინფორმაცია ფინანსური მდგომარეობის შესახებ.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>შემოსავლის ტიპი</Label>
                <Select
                  value={form.income_source_type}
                  onValueChange={(v: "employee" | "entrepreneur" | "lease") =>
                    updateField("income_source_type", v)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="აირჩიეთ ტიპი" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">დასაქმებული</SelectItem>
                    <SelectItem value="entrepreneur">მეწარმე</SelectItem>
                    <SelectItem value="lease">იჯარა</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="existing_liabilities">
                  არსებული ვალდებულებები (GEL)
                </Label>
                <Input
                  id="existing_liabilities"
                  value={form.existing_liabilities}
                  onChange={(e) =>
                    updateField("existing_liabilities", e.target.value)
                  }
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Conditional Subpanels */}
            {form.income_source_type === "employee" && (
              <div className="p-4 rounded-lg border border-blue-100 bg-blue-50/30 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-top-2">
                <div className="space-y-2">
                  <Label>დამსაქმებელი</Label>
                  <Input
                    value={form.employer}
                    onChange={(e) => updateField("employer", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>პოზიცია</Label>
                  <Input
                    value={form.position}
                    onChange={(e) => updateField("position", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>გამოცდილება (თვე)</Label>
                  <Input
                    type="number"
                    value={form.work_experience_months}
                    onChange={(e) =>
                      updateField("work_experience_months", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>შემოსავალი</Label>
                  <div className="flex gap-1">
                    <Input
                      className="flex-1"
                      value={form.monthly_income}
                      onChange={(e) =>
                        updateField("monthly_income", e.target.value)
                      }
                    />
                    <Select
                      value={form.monthly_income_currency}
                      onValueChange={(v) =>
                        updateField("monthly_income_currency", v)
                      }
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GEL">GEL</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {form.income_source_type === "entrepreneur" && (
              <div className="p-4 rounded-lg border border-orange-100 bg-orange-50/30 space-y-6 animate-in fade-in slide-in-from-top-2">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <Label>ი/მ ნომერი</Label>
                    <Input
                      value={form.im_number}
                      onChange={(e) => updateField("im_number", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>საქმიანობის სფერო</Label>
                    <Input
                      value={form.work_field}
                      onChange={(e) =>
                        updateField("work_field", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>ბიზნესის მისამართი</Label>
                    <Input
                      value={form.business_address}
                      onChange={(e) =>
                        updateField("business_address", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>ყოველთვიური შემოსავალი</Label>
                    <div className="flex gap-1">
                      <Input
                        className="flex-1"
                        value={form.entrepreneur_income}
                        onChange={(e) =>
                          updateField("entrepreneur_income", e.target.value)
                        }
                      />
                      <Select
                        value={form.entrepreneur_income_currency}
                        onValueChange={(v) =>
                          updateField("entrepreneur_income_currency", v)
                        }
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GEL">GEL</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>მოვალეთა რეესტრი</Label>
                    <div className="flex gap-2">
                      <Input
                        value={form.debtor_registry_status}
                        readOnly
                        className="bg-slate-50"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={mockDebtorRegistryCheck}
                      >
                        შემოწმება
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {form.income_source_type === "lease" && (
              <div className="p-4 rounded-lg border border-emerald-100 bg-emerald-50/30 space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between">
                  <Label className="text-emerald-900 font-semibold">
                    საიჯარო შემოსავლები
                  </Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={addLeaseItem}
                    className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-100"
                  >
                    <Plus className="size-4 mr-1" /> დამატება
                  </Button>
                </div>

                {form.lease_income_items.map((item, index) => (
                  <div
                    key={index}
                    className="grid gap-4 p-4 rounded-md bg-white border border-emerald-100 sm:grid-cols-2 lg:grid-cols-5 items-end relative"
                  >
                    <div className="space-y-2">
                      <Label className="text-xs">მისამართი</Label>
                      <Input
                        value={item.address}
                        onChange={(e) =>
                          updateLeaseItem(index, "address", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">ხანგრძლივობა</Label>
                      <Input
                        value={item.duration}
                        onChange={(e) =>
                          updateLeaseItem(index, "duration", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">თანხა</Label>
                      <div className="flex gap-1">
                        <Input
                          className="flex-1"
                          value={item.amount}
                          onChange={(e) =>
                            updateLeaseItem(index, "amount", e.target.value)
                          }
                        />
                        <Select
                          value={item.currency}
                          onValueChange={(v) =>
                            updateLeaseItem(index, "currency", v)
                          }
                        >
                          <SelectTrigger className="w-16 h-10 px-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="GEL">GEL</SelectItem>
                            <SelectItem value="USD">USD</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">საკადასტრო კოდი</Label>
                      <Input
                        value={item.cadastral}
                        onChange={(e) =>
                          updateLeaseItem(index, "cadastral", e.target.value)
                        }
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeLeaseItem(index)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {form.lease_income_items.length === 0 && (
                  <p className="text-center py-4 text-sm text-emerald-600/60 italic">
                    საიჯარო ობიექტები არ არის დამატებული
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 3: Loan Data */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="border-b bg-slate-50/50 pb-4">
            <CardTitle className="text-lg font-bold text-slate-800">
              3. სესხის მონაცემები
            </CardTitle>
            <CardDescription>მოთხოვნილი კრედიტის პარამეტრები.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="requested_amount">მოთხოვნილი თანხა</Label>
                <div className="flex gap-1">
                  <Input
                    id="requested_amount"
                    value={form.requested_amount}
                    onChange={(e) =>
                      updateField("requested_amount", e.target.value)
                    }
                    placeholder="0.00"
                    className={cn(errors.requested_amount && "border-red-500")}
                  />
                  <div className="flex items-center justify-center w-16 border rounded-md bg-slate-50 text-sm font-medium">
                    GEL
                  </div>
                </div>
                {errors.requested_amount && (
                  <p className="text-xs text-red-500">
                    {errors.requested_amount}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="loan_term_months">ვადა (თვეებში)</Label>
                <Input
                  id="loan_term_months"
                  type="number"
                  value={form.loan_term_months}
                  onChange={(e) =>
                    updateField("loan_term_months", e.target.value)
                  }
                  className={cn(errors.loan_term_months && "border-red-500")}
                />
                {errors.loan_term_months && (
                  <p className="text-xs text-red-500">
                    {errors.loan_term_months}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="annual_interest_rate">წლიური %</Label>
                <Input
                  id="annual_interest_rate"
                  value={form.annual_interest_rate}
                  onChange={(e) =>
                    updateField("annual_interest_rate", e.target.value)
                  }
                  className={cn(
                    errors.annual_interest_rate && "border-red-500",
                  )}
                />
                {errors.annual_interest_rate && (
                  <p className="text-xs text-red-500">
                    {errors.annual_interest_rate}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>საკომისიო</Label>
                <div className="flex gap-1">
                  <Input
                    className="flex-1"
                    value={form.commission_fee}
                    onChange={(e) =>
                      updateField("commission_fee", e.target.value)
                    }
                  />
                  <Select
                    value={form.commission_fee_type}
                    onValueChange={(v: "amount" | "percent") =>
                      updateField("commission_fee_type", v)
                    }
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="amount">GEL</SelectItem>
                      <SelectItem value="percent">%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>გადახდის დღე</Label>
                <Input
                  type="number"
                  min={1}
                  max={31}
                  value={form.payment_day}
                  onChange={(e) => updateField("payment_day", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>თანამონაწილეობა</Label>
                <div className="flex gap-1">
                  <Input
                    className="flex-1"
                    value={form.down_payment}
                    onChange={(e) =>
                      updateField("down_payment", e.target.value)
                    }
                  />
                  <div className="flex items-center justify-center px-2 border rounded-md bg-slate-100 text-[10px] font-bold leading-none text-slate-500 text-center">
                    {downPaymentPercentage.toFixed(1)}%<br />
                    წილი
                  </div>
                </div>
              </div>

              <div className="space-y-2 sm:col-span-2 lg:col-span-3">
                <Label>სესხის მიზნობრიობა</Label>
                <Input
                  value={form.loan_purpose}
                  onChange={(e) => updateField("loan_purpose", e.target.value)}
                  placeholder="მაგ: ავტომობილის შეძენა"
                />
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center space-x-2 mb-4">
                <Checkbox
                  id="additional_income_enabled"
                  checked={form.additional_income_enabled}
                  onChange={(e) =>
                    updateField("additional_income_enabled", e.target.checked)
                  }
                />
                <Label
                  htmlFor="additional_income_enabled"
                  className="text-sm font-medium cursor-pointer"
                >
                  დამატებითი შემოსავალი
                </Label>
              </div>

              {form.additional_income_enabled && (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-2">
                    <Label>შემოსავლის ტიპი</Label>
                    <Input
                      value={form.additional_income_type}
                      onChange={(e) =>
                        updateField("additional_income_type", e.target.value)
                      }
                      placeholder="დივიდენდი, იჯარა და ა.შ."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>თანხა</Label>
                    <div className="flex gap-1">
                      <Input
                        className="flex-1"
                        value={form.additional_income}
                        onChange={(e) =>
                          updateField("additional_income", e.target.value)
                        }
                      />
                      <Select
                        value={form.additional_income_currency}
                        onValueChange={(v) =>
                          updateField("additional_income_currency", v)
                        }
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GEL">GEL</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        {/* Section 4: Co-borrower / Guarantor */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="border-b bg-slate-50/50 pb-4">
            <CardTitle className="text-lg font-bold text-slate-800">
              4. თანამსესხებელი / თავდები
            </CardTitle>
            <CardDescription>დამატებითი პირების მონაცემები.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has_coborrower_guarantor"
                checked={form.has_coborrower_guarantor}
                onChange={(e) =>
                  updateField("has_coborrower_guarantor", e.target.checked)
                }
              />
              <Label
                htmlFor="has_coborrower_guarantor"
                className="text-sm font-medium cursor-pointer"
              >
                თანამსესხებლის/თავდების არსებობა
              </Label>
            </div>

            {form.has_coborrower_guarantor && (
              <div className="grid gap-6 sm:grid-cols-2 animate-in fade-in slide-in-from-top-2">
                <div className="p-4 rounded-lg border bg-slate-50/50 space-y-4">
                  <p className="text-sm font-bold text-slate-700">
                    თანამსესხებელი
                  </p>
                  <div className="space-y-2">
                    <Label className="text-xs">სახელი, გვარი</Label>
                    <Input
                      value={form.co_borrower_name}
                      onChange={(e) =>
                        updateField("co_borrower_name", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">პირადი ნომერი</Label>
                    <Input
                      value={form.co_borrower_personal_id}
                      onChange={(e) =>
                        updateField("co_borrower_personal_id", e.target.value)
                      }
                      maxLength={11}
                    />
                  </div>
                </div>

                <div className="p-4 rounded-lg border bg-slate-50/50 space-y-4">
                  <p className="text-sm font-bold text-slate-700">თავდები</p>
                  <div className="space-y-2">
                    <Label className="text-xs">სახელი, გვარი</Label>
                    <Input
                      value={form.guarantor_name}
                      onChange={(e) =>
                        updateField("guarantor_name", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">პირადი ნომერი</Label>
                    <Input
                      value={form.guarantor_personal_id}
                      onChange={(e) =>
                        updateField("guarantor_personal_id", e.target.value)
                      }
                      maxLength={11}
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 5: Vehicle Details & Valuation */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="border-b bg-slate-50/50 pb-4">
            <CardTitle className="text-lg font-bold text-slate-800">
              5. ავტომობილის მონაცემები და შეფასება
            </CardTitle>
            <CardDescription>ინფორმაცია უზრუნველყოფის შესახებ.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-8">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="car_make">მარკა</Label>
                <Input
                  id="car_make"
                  value={form.car_make}
                  onChange={(e) => updateField("car_make", e.target.value)}
                  onBlur={(e) =>
                    updateField("car_make", titleCase(translit(e.target.value)))
                  }
                  className={cn(errors.car_make && "border-red-500")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="car_model">მოდელი</Label>
                <Input
                  id="car_model"
                  value={form.car_model}
                  onChange={(e) => updateField("car_model", e.target.value)}
                  onBlur={(e) =>
                    updateField(
                      "car_model",
                      titleCase(translit(e.target.value)),
                    )
                  }
                  className={cn(errors.car_model && "border-red-500")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="car_year">წელი</Label>
                <Input
                  id="car_year"
                  type="number"
                  value={form.car_year}
                  onChange={(e) => updateField("car_year", e.target.value)}
                  className={cn(errors.car_year && "border-red-500")}
                />
              </div>

              <div className="space-y-2">
                <Label>ძრავი</Label>
                <Input
                  value={form.engine}
                  onChange={(e) => updateField("engine", e.target.value)}
                  placeholder="მაგ: 1.8"
                />
              </div>

              <div className="space-y-2">
                <Label>საწვავის ტიპი</Label>
                <Select
                  value={form.fuel_type}
                  onValueChange={(v) => updateField("fuel_type", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="აირჩიეთ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="petrol">ბენზინი</SelectItem>
                    <SelectItem value="diesel">დიზელი</SelectItem>
                    <SelectItem value="hybrid">ჰიბრიდი</SelectItem>
                    <SelectItem value="electric">ელექტრო</SelectItem>
                    <SelectItem value="gas">გაზი</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>გადაცემათა კოლოფი</Label>
                <Select
                  value={form.transmission}
                  onValueChange={(v) => updateField("transmission", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="აირჩიეთ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="automatic">ავტომატიკა</SelectItem>
                    <SelectItem value="manual">მექანიკური</SelectItem>
                    <SelectItem value="tiptronic">ტიპტრონიკი</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>გარბენი (კმ)</Label>
                <Input
                  type="number"
                  value={form.mileage_km}
                  onChange={(e) => updateField("mileage_km", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>VIN კოდი</Label>
                <Input
                  value={form.vin}
                  onChange={(e) =>
                    updateField("vin", e.target.value.toUpperCase())
                  }
                  maxLength={17}
                />
              </div>

              <div className="space-y-2">
                <Label>სახელმწიფო ნომერი</Label>
                <Input
                  value={form.plate_number}
                  onChange={(e) =>
                    updateField("plate_number", e.target.value.toUpperCase())
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>გამყიდველის ფასი (GEL)</Label>
                <Input
                  value={form.seller_price}
                  onChange={(e) => updateField("seller_price", e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label>განბაჟება</Label>
                <Select
                  value={form.customs_status}
                  onValueChange={(v) => updateField("customs_status", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cleared">განბაჟებული</SelectItem>
                    <SelectItem value="not_cleared">განუბაჟებელი</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>მდგომარეობა</Label>
                <Select
                  value={form.vehicle_condition}
                  onValueChange={(v) => updateField("vehicle_condition", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">იდეალური</SelectItem>
                    <SelectItem value="good">კარგი</SelectItem>
                    <SelectItem value="average">საშუალო</SelectItem>
                    <SelectItem value="bad">ცუდი</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="p-6 rounded-xl border-2 border-slate-100 bg-slate-50/50 space-y-6">
              <p className="font-bold text-slate-800 flex items-center gap-2">
                <Search className="size-4" /> შეფასების მონაცემები
              </p>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 items-end">
                <div className="space-y-2">
                  <Label>საბაზრო ღირებულება (GEL)</Label>
                  <Input
                    value={form.market_value}
                    onChange={(e) =>
                      updateField("market_value", e.target.value)
                    }
                    placeholder="0.00"
                    className={cn(errors.market_value && "border-red-500")}
                  />
                </div>
                <div className="space-y-2">
                  <Label>ანალოგების რაოდენობა</Label>
                  <Input
                    type="number"
                    value={form.comparable_count}
                    onChange={(e) =>
                      updateField("comparable_count", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>მაქს. LTV %</Label>
                  <Input
                    type="number"
                    value={form.max_ltv}
                    onChange={(e) => updateField("max_ltv", e.target.value)}
                  />
                </div>

                <div className="h-10 px-4 flex items-center justify-between rounded-lg border bg-white shadow-inner">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">
                    Live LTV
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-lg font-black",
                        liveLTV > (Number(form.max_ltv) || 80)
                          ? "text-red-600"
                          : "text-emerald-600",
                      )}
                    >
                      {liveLTV.toFixed(1)}%
                    </span>
                    {liveLTV > (Number(form.max_ltv) || 80) && (
                      <AlertCircle className="size-4 text-red-600 animate-pulse" />
                    )}
                  </div>
                </div>
              </div>

              {liveLTV > (Number(form.max_ltv) || 80) && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-red-50 text-red-700 text-xs font-medium border border-red-100">
                  <AlertCircle className="size-4" />
                  ყურადღება: მოთხოვნილი თანხა აჭარბებს მაქსიმალურ დასაშვებ
                  ლიმიტს (LTV &gt; {form.max_ltv}%)
                </div>
              )}

              <div className="space-y-2">
                <Label>ავტომობილის კომენტარი</Label>
                <textarea
                  value={form.vehicle_comment}
                  onChange={(e) =>
                    updateField("vehicle_comment", e.target.value)
                  }
                  className="min-h-20 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  placeholder="ზოგადი მდგომარეობა, დაზიანებები და ა.შ."
                />
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Section 6: Officer Comment */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="border-b bg-slate-50/50 pb-4">
            <CardTitle className="text-lg font-bold text-slate-800">
              6. ოფიცრის კომენტარი
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <textarea
              value={form.officer_comment}
              onChange={(e) => updateField("officer_comment", e.target.value)}
              className="min-h-32 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              placeholder="შეიყვანეთ ოფიცრის კომენტარი..."
            />
          </CardContent>
        </Card>
        </>
        )}

        {submitError ? (
          <div className="p-4 rounded-lg border border-red-100 bg-red-50 text-red-700 text-sm flex items-center gap-2">
            <AlertCircle className="size-4" />
            {submitError}
          </div>
        ) : null}

        <div className="flex justify-end gap-4 p-4 border-t bg-white sticky bottom-0 z-10 -mx-6 sm:-mx-0 sm:rounded-b-lg">
          {step === 2 && (
            <>
              <Button
                type="button"
                variant="outline"
                className="h-11 px-8 font-bold"
                onClick={() => setStep(1)}
                disabled={submitLoading}
              >
                უკან
              </Button>
              <Button
                type="submit"
                className="h-11 min-w-52 font-bold shadow-lg shadow-primary/20"
                disabled={submitLoading}
              >
                {submitLoading ? <Loading size="sm" className="mr-2" /> : null}
                განაცხადის გაგზავნა
              </Button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
