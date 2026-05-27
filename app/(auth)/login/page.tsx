"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { loginSchema, LoginInput } from "@/lib/validations/auth";
import { API_ROUTES } from "@/lib/routes";
import { api, getApiErrorMessage } from "@/lib/axios";
import { clearAuthUser, saveAuthUser, type AuthUser } from "@/lib/auth-storage";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      setError(null);

      const response = await api.post<{ user?: AuthUser }, LoginInput>(API_ROUTES.auth.login, data);

      if (response.data?.user) {
        saveAuthUser(response.data.user);
      }

      router.push("/dashboard");
    } catch (error: unknown) {
      clearAuthUser();

      const message = getApiErrorMessage(error);

      setError(message || "მომხმარებლის სახელი ან პაროლი არასწორია.");
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-zinc-950 flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        {/* <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Enter your credentials to access your account
          </p>
        </div> */}

        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400 sm:text-base">
            {error}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">მომხმარებლის სახელი</FormLabel>
                  <FormControl>
                    <Input className="h-10 text-sm sm:text-base" placeholder="johndoe" {...field} name="username" autoComplete="On"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">პაროლი</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      className="h-10 text-sm sm:text-base"
                      placeholder="••••••••"
                      {...field}
                      name="password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="h-10 w-full text-sm sm:text-base"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "..." : "შესვლა"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
