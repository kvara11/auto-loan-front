"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { registerSchema, RegisterInput } from "@/lib/validations/auth";
import { API_ROUTES } from "@/lib/routes";
import { api, getApiErrorMessage } from "@/lib/axios";

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

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      username: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    try {
      setError(null);

      await api.post(API_ROUTES.auth.register, data);
      router.push("/login");

    } catch (error: unknown) {
      const message = getApiErrorMessage(error);

      setError(message || "რეგისტრაციისას მოხდა შეცდომა.");
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-zinc-950 flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        <div className="space-y-2 text-center">
          <h1 className="text-lg font-semibold tracking-tight sm:text-xl lg:text-2xl">ანგარიშის შექმნა</h1>
          {/* <p className="text-sm text-gray-500 dark:text-zinc-400">
            Enter your details below to create your account
          </p> */}
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400 sm:text-base">
            {error}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">სახელი</FormLabel>
                    <FormControl>
                      <Input className="h-10 text-sm sm:text-base" placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">გვარი</FormLabel>
                    <FormControl>
                      <Input className="h-10 text-sm sm:text-base" placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">მომხმარებლის სახელი</FormLabel>
                  <FormControl>
                    <Input className="h-10 text-sm sm:text-base" placeholder="johndoe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">იმეილი</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      className="h-10 text-sm sm:text-base"
                      placeholder="john@example.com"
                      {...field}
                    />
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
              {form.formState.isSubmitting ? "პროგრესშია..." : "რეგისტრაცია"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
