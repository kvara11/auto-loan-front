import Link from "next/link";
import { FileQuestion } from "lucide-react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <DashboardShell title="გვერდი ვერ მოიძებნა">
      <section className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
        <FileQuestion className="size-10 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm font-semibold tracking-[0.2em] text-muted-foreground">404</p>
        <h2 className="text-xl font-bold sm:text-2xl">გვერდი ვერ მოიძებნა</h2>
        <p className="max-w-md text-sm text-muted-foreground">მოთხოვნილი გვერდი არ არსებობს, გადატანილია ან მასზე წვდომა არ გაქვთ.</p>
        <Button asChild className="mt-2 h-10">
          <Link href="/dashboard">დეშბორდზე დაბრუნება</Link>
        </Button>
      </section>
    </DashboardShell>
  );
}
