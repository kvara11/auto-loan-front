import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "მომხმარებლის სახელი სავალდებულოა"),
  password: z.string().min(6, "პაროლი უნდა შეიცავდეს მინიმუმ 6 სიმბოლოს"),
  remember_me: z.boolean(),
});

export type LoginInput = z.infer<typeof loginSchema>;
