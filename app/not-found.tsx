import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function NotFound() {
  return (
    <DashboardShell>
      <section className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-muted-foreground text-sm font-medium uppercase tracking-[0.2em]">
            404
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Page not found
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>
      </section>
    </DashboardShell>
  );
}