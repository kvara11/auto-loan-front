# Design brief — prompt for Claude Design

Paste everything below the line into Claude Design. Written 2026-10-10; update it when screens or roles change.

---

Design a complete visual system and key screens for **Auto Loan** — an internal web platform that a Georgian micro-finance / leasing company uses to originate and review car loans. It replaces an Excel workflow. All UI copy is **Georgian** (examples below); design with real Georgian text, not lorem ipsum.

### Who uses it
Internal staff only, at desks and sometimes on phones in a branch or a car lot:
- **Credit officer** (საკრედიტო ოფიცერი) — registers clients, creates loan applications, sees only their own.
- **Branch manager** (ფილიალის მენეჯერი) — sees every application of their branch.
- **Risk manager** (რისკების მენეჯერი) — reviews submitted applications from all branches; approves, rejects or returns them.
- **Auditor** (აუდიტორი) — read-only access to everything.
- **Administrator** (ადმინისტრატორი) — manages users, roles and branches; never sees loan data.

They spend hours a day in it. It must feel **trustworthy, calm and fast** — a serious financial tool with personality, not a generic black-and-white admin template.

### Visual direction
- Avoid pure black/white and grey-only palettes. Give it a **distinct brand identity**: a confident primary (e.g. a deep teal, ink-blue or emerald family — propose 2–3 options and pick one), warm neutrals instead of cold greys, and a restrained accent for highlights.
- **Light and dark themes** of equal quality. Dark should be a rich, tinted dark (navy/ink), not #000; light should be a soft off-white, not #fff everywhere. Show both for every key screen.
- Subtle depth: layered surfaces (page → panel → card → popover), soft shadows or tinted borders, gentle gradients only where they add meaning (hero numbers, the login screen). No noisy glassmorphism.
- Data-dense but airy: tables and forms must stay readable with many columns and fields.
- **Status colors are part of the language** — define tokens for: Draft (მონახაზი), Submitted to Risks (გაგზავნილია რისკებში), Approved (დამტკიცებული), Rejected (უარყოფილი), Returned (დაბრუნებული), plus success / warning / danger / info. Each needs a badge style that works in both themes and is not color-only (icon or shape too).
- **Typography:** must support the Georgian (Mkhedruli) script well — e.g. Noto Sans Georgian, FiraGO or BPG fonts; pair with a Latin face if needed. Tabular numbers for money, percentages and dates. Define a type scale.
- Accessibility: WCAG AA contrast in both themes, visible focus rings, tap targets ≥ 40px.

### Technical constraints (so the design can be built 1:1)
- Built with **Next.js + Tailwind CSS v4 + shadcn/ui** (Radix primitives). Express the system as **design tokens** compatible with shadcn's CSS variables: `--background`, `--foreground`, `--card`, `--popover`, `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--border`, `--input`, `--ring`, `--sidebar-*`, `--chart-1..5`, and add `--success`, `--warning`, `--info` and the five status tokens. Give values in **OKLCH**, for `:root` (light) and `.dark`.
- Use only shadcn-style components: Button, Input, Select, Card, Dialog, Sheet, Table, Badge, DropdownMenu, Tabs, Avatar, Checkbox. Show their variants and states (default, hover, focus, disabled, error, loading).
- Radius, spacing and shadow scales as tokens.
- **Mobile-first**: every screen at 375px, 768px and 1440px. Sidebar becomes a slide-in sheet on mobile; tables collapse secondary columns or become cards; no horizontal page scroll.

### App shell
- Left **sidebar** (collapsible to icons): product mark "Auto Loan", grouped navigation — "ოპერაციები" → Dashboard, განაცხადები; "ადმინისტრაცია" → მომხმარებლები, ფილიალები. Items shown depend on role. Active-item state is required.
- **Top bar**: page title, user avatar menu (name, role, branch, "პარამეტრები", "გასვლა"), theme toggle.
- Content container max ~1280px.

### Screens to design
1. **Login** (შესვლა) — username + password, "დამიმახსოვრე", error state ("მომხმარებელი ან პაროლი არასწორია."). The one place for a stronger brand moment.
2. **Dashboard** — KPI cards (მიმდინარე სესხები, დამუშავების პროცესში, თვის გაცემები), applications by status (chart), recent applications list, and a role-specific block (officer: "ჩემი მონახაზები"; risk manager: "რიგი — გაგზავნილი განაცხადები").
3. **Applications list** (განაცხადები) — table: number (e.g. DEMO-0002), client + officer + branch, amount with currency (₾ / $), term / interest rate, vehicle (Toyota Camry 2019), LTV with a warning state, status badge, date, actions. Filters (status, date range, branch), search, empty state, loading skeleton, "ახალი განაცხადი" primary button (only for officers).
4. **Application detail** — header with number, status badge and the actions available to the role (e.g. risk manager: დამტკიცება / უარყოფა / დაბრუნება); sections for client, loan terms, vehicle and valuation (market value, LTV vs max LTV gauge), officer comment, and a status timeline / history.
5. **New application wizard** (2 steps) — Step 1 "კლიენტი": search by personal ID (პირადი ნომერი), found-client vs new-client states, client fields. Step 2 "სესხი და ავტომობილი": income, loan terms, co-borrower/guarantor, vehicle (make, model, year, fuel, transmission, mileage, VIN, plate), live LTV indicator. A long form: design a stepper, sticky summary/actions, inline validation messages in Georgian.
6. **Users** (მომხმარებლები) — table (name, username, email, role, branch, active/inactive), filters, create/edit dialog (role select; branch required for officers and branch managers), activate/deactivate toggle.
7. **Branches** (ფილიალები) — table (code e.g. micro-01, name "მიკრო ბანკი", users count, status), create/edit dialog, deactivate (no delete).
8. **Settings** (პარამეტრები) — three stacked sections, each with its own "შენახვა" button that is disabled until something changes: "პირადი ინფორმაცია" (first/last name editable; username and email read-only), "ინტერფეისის პარამეტრები" (theme, notifications, compact sidebar), "უსაფრთხოება" (change-password dialog).

### States to cover
Loading (skeletons), empty, error banner, validation error under a field, success toast/notice, disabled buttons, read-only fields, "no permission / not found" page (404 "განაცხადი ვერ მოიძებნა").

### Deliverables
1. Brand direction: 2–3 palette options with a recommendation and reasoning.
2. Design tokens (light + dark, OKLCH) ready to paste into `globals.css`.
3. Component sheet with variants and states.
4. The 8 screens above in light and dark, desktop and mobile.
5. Short usage notes: when to use which status color, table density rules, form layout rules.
