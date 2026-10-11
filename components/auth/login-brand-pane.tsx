// Left half of the login screen (lg and up): the one place with a stronger brand moment.
export function LoginBrandPane() {
  return (
    <div
      className="hidden w-[46%] flex-col justify-between p-12 text-sidebar-foreground lg:flex xl:p-[72px]"
      style={{
        background: [
          "radial-gradient(900px 500px at 20% 10%, color-mix(in oklch, var(--primary) 55%, transparent), transparent 60%)",
          "radial-gradient(700px 500px at 90% 90%, color-mix(in oklch, var(--accent) 35%, transparent), transparent 60%)",
          "linear-gradient(160deg, var(--sidebar), color-mix(in oklch, var(--sidebar) 70%, var(--primary)))",
        ].join(", "),
      }}
    >
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-[10px] bg-white/20 text-lg font-extrabold" aria-hidden="true">
          A
        </div>
        <span className="text-lg font-bold tracking-[0.02em]">Auto Loan</span>
      </div>

      <div className="flex max-w-[420px] flex-col gap-[18px]">
        <p className="text-4xl leading-tight font-bold">ავტოსესხების გაცემა და მართვა — ერთ სისტემაში</p>
      </div>

      <p className="text-xs opacity-70">© 2026 Qbind · შიდა სისტემა</p>
    </div>
  )
}
