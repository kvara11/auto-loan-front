"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

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
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      remember_me: false,
    },
  });

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      try {
        const response = await api.get<{ user?: AuthUser }>(API_ROUTES.auth.me);

        if (!active || !response.data?.user) return;

        saveAuthUser(response.data.user);
        router.replace("/dashboard");
      } catch {
        if (active) {
          setIsCheckingSession(false);
        }
      }
    };

    void bootstrap();

    return () => {
      active = false;
    };
  }, [router]);

  if (isCheckingSession) {
    return (
      <div className="bg-gray-50 dark:bg-zinc-950 flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
        <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:text-base">
          Checking session...
        </div>
      </div>
    );
  }

  const onSubmit = async (data: LoginInput) => {
    try {
      setError(null);

      const response = await api.post<{ user?: AuthUser }, LoginInput>(API_ROUTES.auth.login, data);

      if (response.data?.user) {
        saveAuthUser(response.data.user, data.remember_me);
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

            <FormField
              control={form.control}
              name="remember_me"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-3 space-y-0 rounded-lg border p-3">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => field.onChange(event.target.checked)}
                      className="mt-0.5 size-4 shrink-0 rounded-sm border border-input bg-background shadow-sm outline-none transition-shadow focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 accent-foreground"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm sm:text-base">დამიმახსოვრე</FormLabel>
                    <p className="text-muted-foreground text-xs sm:text-sm">
                      ამ კომპიუტერზე უფრო ხანგრძლივად შეინარჩუნებს შესვლას.
                    </p>
                  </div>
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
