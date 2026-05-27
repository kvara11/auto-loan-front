import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "მომხმარებლის სახელი სავალდებულოა"),
  password: z.string().min(6, "პაროლი უნდა შეიცავდეს მინიმუმ 6 სიმბოლოს"),
});

export const registerSchema = z.object({
  first_name: z.string().min(1, "სახელი სავალდებულოა"),
  last_name: z.string().min(1, "გვარი სავალდებულოა"),
  username: z.string().min(1, "მომხმარებლის სახელი სავალდებულოა"),
  email: z.string().email("იმეილის ფორმატი არასწორია"),
  password: z.string().min(6, "პაროლი უნდა შეიცავდეს მინიმუმ 6 სიმბოლოს"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
