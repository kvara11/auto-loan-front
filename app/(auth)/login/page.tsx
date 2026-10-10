"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { LoginBrandPane } from "@/components/auth/login-brand-pane";
import { LoginForm } from "@/components/auth/login-form";
import { BrandMark } from "@/components/dashboard/dashboard-sidebar";
import { saveAuthUser, type AuthUser } from "@/lib/auth-storage";
import { api } from "@/lib/axios";
import { API_ROUTES } from "@/lib/routes";

export default function LoginPage() {
  const router = useRouter();
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // An existing session skips the form.
  useEffect(() => {
    let active = true;

    api
      .get<{ user?: AuthUser }>(API_ROUTES.auth.me)
      .then((response) => {
        if (!active) return;
        if (!response.data?.user) {
          setIsCheckingSession(false);
          return;
        }
        saveAuthUser(response.data.user);
        router.replace("/dashboard");
      })
      .catch(() => {
        if (active) setIsCheckingSession(false);
      });

    return () => {
      active = false;
    };
  }, [router]);

  return (
    <div className="flex min-h-screen bg-background">
      <LoginBrandPane />

      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-10">
        <div className="flex w-full max-w-[400px] flex-col gap-6">
          <div className="flex items-center gap-2.5 lg:hidden">
            <BrandMark className="bg-primary text-primary-foreground" />
            <span className="text-base font-bold">Auto Loan</span>
          </div>

          <div className="flex flex-col gap-5 rounded-xl border bg-card p-6 shadow-sm sm:p-10">
            <div>
              <h1 className="text-[22px] font-bold">შესვლა</h1>
              <p className="mt-1 text-[13px] text-muted-foreground">შეიყვანეთ თქვენი მონაცემები სისტემაში შესასვლელად</p>
            </div>

            {isCheckingSession ? (
              <div className="flex min-h-48 items-center justify-center" aria-busy="true">
                <Loader2 className="size-5 animate-spin text-muted-foreground" aria-label="სესიის შემოწმება" />
              </div>
            ) : (
              <LoginForm />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
