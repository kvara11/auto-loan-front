import { z } from "zod"

import { BRANCH_REQUIRED_ROLE, type UserFormInput } from "@/components/users/users-types"

// Mirrors the backend rules (StoreUserRequest / UpdateUserRequest); the backend stays the source of truth.
export function buildUserFormSchema(mode: "create" | "edit") {
  return z
    .object({
      first_name: z.string().trim().min(2, "სახელი უნდა შეიცავდეს მინიმუმ 2 სიმბოლოს"),
      last_name: z.string().trim().min(2, "გვარი უნდა შეიცავდეს მინიმუმ 2 სიმბოლოს"),
      username: z
        .string()
        .trim()
        .min(4, "მინიმუმ 4 სიმბოლო")
        .regex(/^[A-Za-z0-9._-]+$/, "მხოლოდ ლათინური ასოები, ციფრები, წერტილი, ტირე და ქვედა ტირე"),
      email: z.string().trim().email("იმეილის ფორმატი არასწორია"),
      password: z.string(),
      password_confirmation: z.string(),
      role: z.string().min(1, "როლი სავალდებულოა"),
      branch_id: z.string(),
    })
    .superRefine((value: UserFormInput, ctx) => {
      if (value.role === BRANCH_REQUIRED_ROLE && !value.branch_id) {
        ctx.addIssue({ code: "custom", path: ["branch_id"], message: "საკრედიტო ოფიცერს ფილიალი აუცილებლად უნდა მიენიჭოს" })
      }

      if (mode === "edit") return

      if (value.password.length < 8) {
        ctx.addIssue({ code: "custom", path: ["password"], message: "პაროლი უნდა შეიცავდეს მინიმუმ 8 სიმბოლოს" })
      }
      if (value.password !== value.password_confirmation) {
        ctx.addIssue({ code: "custom", path: ["password_confirmation"], message: "პაროლები არ ემთხვევა" })
      }
    })
}

export const emptyUserForm: UserFormInput = {
  first_name: "",
  last_name: "",
  username: "",
  email: "",
  password: "",
  password_confirmation: "",
  role: "",
  branch_id: "",
}
