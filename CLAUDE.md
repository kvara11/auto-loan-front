# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

npm is the package manager (`package-lock.json`).

- `npm run dev`: dev server at http://localhost:3000
- `npm run build` / `npm start`: production build / serve
- `npm run lint`: ESLint (flat config, `eslint-config-next` core-web-vitals + typescript)
- `npx tsc --noEmit`: type check (there is no script for it)

There is no test runner or test suite. `docs/test-scenarios.md` lists behavior-level test scenarios for every feature and marks where the current code falls short. Read the relevant section before changing a feature, and update it when behavior changes.

## What this is

A frontend-only admin dashboard for an auto-loan business, built with Next.js 16 App Router, React 19, Tailwind v4 and shadcn/ui. All data and auth live in a separate backend at `NEXT_PUBLIC_API_URL`, so this repo has almost no server logic.

User-facing text is in Georgian. Write new labels, messages and zod validation errors in Georgian. Some screens may still have English leftovers: parts of settings and the delete-user dialog.

## Architecture

### Talking to the backend

- In `lib/axios.ts`, `axiosInstance` points at `NEXT_PUBLIC_API_URL` with `withCredentials: true`, and auth is an HttpOnly cookie holding a Sanctum personal access token (no session, no CSRF). Use the `api.get/post/put/patch/delete` wrappers. They return the backend envelope `{ success, message, data }` rather than the axios response, so read payloads as `response.data?.foo`. `getApiErrorMessage(err)` returns the first field message from a 424 `errors` object, otherwise the backend's `message`.
- There is no axios interceptor, so a 401 is not handled globally. Each call site decides what to do with it.
- `API_ROUTES` in `lib/routes.ts` holds the auth, admin and settings endpoints. The application and client endpoints (`/api/applications`, `/api/clients`, `/api/clients/personal/:personalId`) are still written as inline strings in components.
- **There are two different `/api/*` namespaces.** A path passed to `api.*` goes to the backend, while `fetch("/api/...")` goes to this app's own route handlers under `app/api/`. The only such handler is `app/api/stats/vehicle-options/route.ts`, a server-side proxy that adds the secret `X-API-KEY` header (from `STAT_API_KEY`) and forwards the browser's cookie. Use this pattern for any backend endpoint that needs a secret.
- Data fetching is client-side in `useEffect`, with an `active` flag to ignore late responses. Server components don't fetch data, and there is no React Query or SWR.

### Auth and session

- There is no route protection: no `proxy.ts` (Next 16's replacement for `middleware.ts`) and no server-side guard. Pages render for anyone, and the backend rejects unauthenticated API calls.
- `AuthUser.role` is not read anywhere, and `AuthUser.permissions` only hides the "ახალი განაცხადი" button without `applications.create` (`applications-management.tsx`); the detail page's workflow buttons come from the backend's `data.actions`, not from cached permissions. Permissions are cached at login, so a user must log in again to see role changes. Otherwise the only access control in the UI is which modules the backend sends for the sidebar; every page is still reachable by URL, and the backend answers 401/404.
- `/` redirects to `/login`. The login page calls `/api/auth/me` first and goes straight to `/dashboard` if a session already exists. There is no `/register` page and no self-registration: the backend creates users only through the admin endpoint `POST /api/admin/users` (`users.manage`), which the users screen doesn't call yet.
- `lib/auth-storage.ts` caches the backend's `AuthUser` (including `permissions` and `modules`) in `sessionStorage`, and `useAuthUser()` reads it through `useSyncExternalStore`.
  - `remember_me` is only sent to the backend. The user is always cached in `sessionStorage`, so every new tab fetches `/api/auth/me` again.
  - The storage keys are plain constants (`auto-loan.auth-user` in `sessionStorage`, `auto-loan.auth-sync` in `localStorage`), not env vars. The old `AUTH_USER_KEY`/`AUTH_SYNC_KEY` entries in `.env` are unused.
  - Cross-tab sync: `saveAuthUser()` writes `<timestamp>:<userId>` and `clearAuthUser()` writes `<timestamp>:clear` to the sync key. Another tab drops its cached user (and the shell refetches `/api/auth/me`) only on `clear` or when the user id differs from its own. **Don't clear on every write:** the shell's `/me` refetch calls `saveAuthUser()`, so two open tabs then refetched each other's user forever (thousands of `/api/auth/me` requests). A name change in one tab shows in other tabs only after a reload.

### Dashboard shell and navigation

- Authenticated pages have no shared `layout.tsx`. Each page (`app/dashboard/**`, `app/settings`, `app/not-found.tsx`) wraps its own content in `<DashboardShell>`. Dashboard pages are thin server components, and the feature UI lives in `components/<feature>/` as client components.
- Because every page mounts its own shell, shell state resets on each navigation. That includes the sidebar's collapsed state.
- `DashboardShell` provides the mobile sidebar `Sheet`, the content padding and the content container (`w-full`, 1440px; wider than the rules' `max-w-7xl` so tables fit), so pages don't add them. It takes a required `title` (shown in the top bar) and an optional `breadcrumb` (`{ label, href }`, e.g. "განაცხადები / ახალი განაცხადი"); pages don't render their own page heading.
- Top bar (`dashboard-header.tsx`): hamburger (mobile), breadcrumb + title, `ThemeToggle` (☀/☾; applies at once, writes `localStorage` and saves `PUT /api/settings/preferences`), `UserMenu` (avatar initials; name, `role.display_name` · branch; "პარამეტრები", "გასვლა").
- If no user is cached, `DashboardShell` fetches `/api/auth/me`.
- The sidebar is built from `user.modules`, a backend-provided tree with `route`, `icon`, `sort_order`, `is_active` and `children` fields.
  - A module with children and no route renders as a group label.
  - A module with a route renders as a link, and any children it has are dropped.
  - A new page only shows up in the nav once the backend returns a module for it.
  - The module's `icon` string must also have an entry in `iconMap` in `components/dashboard/sidebar-nav.tsx`, or it falls back to `Circle`.
  - The active link (`usePathname`; `/dashboard` exact, other routes also match their sub-pages) gets `bg-sidebar-accent` and a `sidebar-primary` bar. The sidebar uses the ink `--sidebar` tokens in both themes; collapsed it shows icons only (with `title`/`aria-label`).
- **Dashboard** (`components/dashboard-home/*`): reads `GET /api/applications` (already scoped by the backend). KPI "დამუშავების პროცესში" is real (Draft + Submitted + Returned); "მიმდინარე სესხები" and "თვის გაცემები" show "—" + "მალე" until loans/disbursements exist. Status bars, a role block ("ჩემი მონახაზები" for `applications.create`, "რიგი — გაგზავნილი განაცხადები" for `applications.view.submitted`), "ბოლო განაცხადები" (table from `md`, rows on mobile). Users without any `applications.view.*` (administrator) get `AdminOverview` (user and branch counts) instead.

### Settings and preferences

- The settings page (`components/settings/settings-page.tsx`) loads `GET /api/settings` once (`{ profile, preferences }`, see `lib/settings.ts`) and renders three independent sections, each in `SettingsSection` (a `Card` with title, description and a footer button):
  - **პირადი ინფორმაცია** (`profile-section.tsx`): on top `AvatarField` (`avatar-field.tsx`, T-207): pick → `resizeAvatar()` (`lib/avatar.ts`) crops a centered square and scales to 256 px in the browser (WEBP, JPEG fallback; the server has no image library) → preview with "ავატარის შენახვა" / "გაუქმება" → `POST /api/settings/avatar` (multipart); "წაშლა" → `DELETE`. Saved at once (independent of the name form) and written into the cached auth user, so the top bar updates. Then react-hook-form + zod; only first/last name are editable, username and email are read-only. Its own "შენახვა" is disabled until `formState.isDirty`; it calls `PUT /api/settings/profile`, resets the form to the saved values and updates the cached auth user's names.
  - **ინტერფეისის პარამეტრები** (`preferences-section.tsx`): theme, notifications, compact sidebar; its own "შენახვა", disabled until something differs from the last saved values. `PUT /api/settings/preferences` with `{ preferences }`; theme and sidebar are applied only after the save.
  - **უსაფრთხოება** (`security-section.tsx`): the change-password dialog (its own `<form>`).
- Preferences arrive typed (`theme`, booleans) with defaults, so the frontend doesn't normalize them. Never send profile fields to the preferences endpoint: the backend rejects unknown keys with 424.
- After a preferences save, the theme and sidebar values are also written to `localStorage` (`lib/ui-preferences.ts`). The rest of the app reads only `localStorage`.
  - `ThemeSync` in the root layout reads the theme and toggles the `dark` class on `<html>` in an effect. There is no script that runs before first paint, so dark-mode users see a light flash on load.
  - The shell reads the sidebar value through its own copy of `getStoredSidebarCollapsed` in `dashboard-shell-state.tsx`.
- The change-password dialog posts `{ current_password, password, password_confirmation }` to `/api/auth/change-password`. On success the backend signs out every other session of the user, and the section shows the success message.

### Users admin (`components/users/`)

- The page loads `GET /api/admin/users`, `GET /api/admin/roles` and `GET /api/admin/branches` with `Promise.allSettled`; failures are silent.
- Create → `POST /api/admin/users`, edit → `PUT /api/admin/users/:id` (payload from `toUserPayload` in `users-types.ts`; passwords only on create). The list is updated from the server's response. The toggle calls `POST /api/admin/users/:id/activation`. The delete button is commented out.
- `user-form-schema.ts` mirrors the backend rules (username `[A-Za-z0-9._-]`, password ≥8 + confirmation on create). A branch is required for `credit-officer` and `branch-manager` (`BRANCH_REQUIRED_ROLES`); other roles get a "ფილიალის გარეშე" option. Only active branches are offered, plus the user's current one.
- Dialog forms show backend 424 errors on their fields with `getApiFieldErrors()` + `form.setError`, and other errors in a banner (pattern used by `user-form-dialog.tsx` and `branch-form-dialog.tsx`).
- Filtering and pagination are client-side. The default status filter is `"active"`, so inactive users start hidden.
- **Avatars (T-207):** `UserAvatar` (`components/dashboard/user-avatar.tsx`; image from `avatarSrc(avatar_url)`, initials as fallback) is used in the first table column ("მომხმარებელი": avatar, full name and email below it; it replaced the first-name, last-name and email columns so the table fits at 1440), in the top-bar `UserMenu` and in settings. The edit dialog shows `AvatarModeration` ("ავატარის წაშლა" with confirmation → `DELETE /api/admin/users/:id/avatar`); its removed state is local so the form being edited isn't reset. Avatar images are direct API links, so like attachments they load only from `127.0.0.1:3000` (cookie).

### Branches admin (`components/branches/`, `/dashboard/branches`)

- `GET/POST/PUT /api/admin/branches`. There is no delete: the power button toggles `is_active`. The table shows code, name, user count and status.
- The sidebar shows the page through the backend's `branches` module (icon `building-2` → `Building2` in `iconMap`).

### Loan applications (`components/applications/`)

- **List:** `GET /api/applications`, where `data` is either an array or `{ applications }`. The backend returns only the user's scope (officer: own; branch manager: branch; risk manager: non-Draft; auditor: all; administrator: 401). The officer line in the table also shows the application's branch. Filters (`applications-filters.tsx`), two rows: personal-ID search (`applications-search.tsx`, applied 350 ms after typing stops) with the page action on the right; then status (200 px), created-date from/to (176 px each) and "გასუფთავება". Every personal-ID input (this search, the wizard lookup, co-borrower/guarantor) uses `PERSONAL_ID_WIDTH` from `lib/utils.ts` (`w-full max-w-sm`). The list page loads one page at a time with `fetchApplicationsPage(filters, page, perPage)` (`lib/applications.ts`; `?page=&per_page=`, `meta` from the envelope); `applications-pagination.tsx` shows "ნაჩვენებია X–Y / N", page size 10/20/50 (default 20) and previous/next. A filter or page-size change goes back to page 1. The dashboard still uses `fetchApplications()` without paging (whole scope, for its counts). The table fits at 1440: the creation date is a narrow column right of the status (`w-px`, `px-2`, from `xl`), the officer is shown short (`shortName`, "ე. გელაშვილი") and from `xl` the client cell wraps at 15 rem. The "ახალი განაცხადი" button is passed in as the bar's `action` (right end on desktop, first on mobile). The eye button (and the dashboard rows) link to the detail page.
- **Detail page** `/dashboard/applications/[id]` (`components/application-detail/*`, the design's ApplicationDetail): `fetchApplication(id)` (`GET /api/applications/:id` → `data.application` + `data.actions`) and `fetchHistory(id)` (`GET …/history` → `data.history`). Layout `lg:grid-cols-[2fr_1fr]`: header (number, `StatusBadge`, action buttons), the return/reject reason banner (`DecisionBanner`), info cards კლიენტი / სესხის პირობები / ავტომობილი და შეფასება (`InfoCard`; "შემოსავალი" and "ყოველთვიური გადასახადი" are "—" + "მალე"), and on the right `LtvCard` (requested amount / market value, display only, limit = stored `max_ltv`), officer comment, `HistoryTimeline` (plus a "გადაწყვეტილების მოლოდინში" step while submitted). Not-found / out-of-scope shows the backend message with a link back to the list.
- **Workflow actions:** the buttons are exactly the backend's `data.actions` (`submit` → "რისკებში გაგზავნა"; `return` / `reject` / `approve` → "დაბრუნება" / "უარყოფა" / "დამტკიცება"; config in `action-config.ts`). `ActionDialog` confirms, requires a comment for return/reject (shadcn `Textarea`), calls `performAction()` (`POST …/{action}` with `{ comment }`), then replaces the application and actions from the response, shows the backend message and reloads the history. 409/403/424 messages appear in the dialog banner. "რედაქტირება" is disabled with "მალე" until application editing (T-402).
- **Status:** the list, dashboard and detail page use `StatusBadge`; history labels come from `getHistoryLabel()` in `lib/application-status.ts`; dates from `formatDate`/`formatDateTime`. The list's LTV shows "—" while the stored value is 0.
- **New application / edit** (`components/application-wizard/*`, design NewApplicationWizard): `/dashboard/applications/new` and `/dashboard/applications/[id]/edit` render `<ApplicationWizard applicationId?>`. Layout `lg:grid-cols-[2fr_1fr]`: cards on the left, sticky `WizardSummary` ("შეჯამება": client, amount, market value, display LTV + the buttons) on the right (below on mobile).
  1. **Step "კლიენტი"** (`client-lookup-card`, `client-details-card`): typing the 11th digit (or "ძებნა") calls `GET /api/clients/personal/:pid`; found → green "— მოიძებნა" banner with "სხვა კლიენტი", fields prefilled; 404 → "new client" notice. "შემდეგი →" validates (`clientErrors`) and saves the client through `useClientStep().save()`: unchanged existing client → no call, edited → `PUT /api/clients/:id`, new → `POST /api/clients`. Client fields include marital status, family members and the manual "იურიდიული მისამართი გადამოწმებულია" mark (the backend records who/when); the automatic check is "მალე".
  2. **Step "სესხი და ავტომობილი"**: `IncomeCard` (type → employee / entrepreneur / lease panels, liabilities, additional income; debtor-registry check is "მალე"), `LoanCard` (monthly payment "მალე", down-payment share), `GuarantorCard`, `VehicleCard` (car_db selects; a new make clears the model), `AppraisalCard` (market value, comparables, max LTV, display LTV + over-limit warning, vehicle and officer comments).
  - **Buttons:** "მონახაზად შენახვა" saves (POST, or PUT once the application exists) — partial data is fine — and opens the detail page. "გაგზავნა რისკებში" checks `clientErrors` + `submitErrors` (mirrors the backend's `REQUIRED_FOR_SUBMIT`), saves, then `performAction(id, "submit")`. Backend 424 errors land on their fields through `mapServerErrors` (`income.x` → `x`, lease items → the lease list) plus a banner.
  - **Edit mode:** loads `GET /api/applications/:id`; `can_edit: false` → an explanation card instead of the form. The client is fixed (lookup locked, no "სხვა კლიენტი"); its details can still be edited.
  - **Form model** (`wizard-form.ts`): flat strings/booleans/ids for every field; `wizard-payload.ts` builds the client body, the application body (empty → `null` so an edit can clear a field; incomes → the `income` snapshot) and `fromApplication()` for edit (0 amounts show as empty). Options with Georgian labels: `wizard-options.ts`. Field helpers: `form-field.tsx` (`Field`, `FormInput`, `FormSelect`, `FormCheckbox`; errors via `aria-invalid`).
- **Attachments** (`attachments-card.tsx`, `attachment-upload.tsx`, `attachment-item.tsx`, `lib/attachments.ts`; T-406): below the vehicle card. `GET …/attachments` gives the list, `can_upload` and the categories. Upload: pick a type, then one or more files (`accept` JPG/PNG/WEBP/HEIC/PDF, 20 MB checked before sending), uploaded one by one with a progress percentage (`multipart/form-data` must be set explicitly — the axios instance defaults to JSON and would serialize the FormData). Thumbnails and "გახსნა" use `attachmentUrl(…, inline)`, a direct link to the API: the auth cookie goes along because app and API are the same site (`127.0.0.1`), so it fails from `localhost:3000`. Delete (own files, `can_delete`) asks for confirmation; adding/removing reloads the history ("ფაილი დაემატა" / "ფაილი წაიშალა"). The Credit Info PDF is uploaded here as type "Credit Info რეპორტი" until T-407.
- **Comments** (`comments-card.tsx`, `comment-form.tsx`, `comment-item.tsx`, `lib/comments.ts`; T-408): below the attachments. `GET …/comments` → `{comments[], types}` where `types` is what the current user may write now (empty → read only, no form). `POST …/comments` with `{ body, type }`. The type select shows only when there is more than one type; conclusions are tinted with an `info` badge. Append-only: no edit or delete, and comments are not in the history.
- **Detail page extras:** "რედაქტირება" links to `/edit` when `can_edit`; "შემოსავლები და ვალდებულებები" card from `income`; client card shows marital status, family members, both addresses (✓ when verified); history label `updated` → "რედაქტირებულია".

## Styling

- **Design system:** "Auto Loan — Design System" (Claude Design canvas; brief in `docs/design-brief.md`). Deep-teal primary, warm neutrals, ink sidebar, `--radius: 0.65rem`. Being applied screen by screen: done — tokens, font, shell, login, dashboard, applications list/detail, the new-application wizard; next — users/branches/settings.
- **Tokens** (`app/globals.css`, OKLCH, `:root` light and `.dark`): the shadcn set plus `--success`, `--warning`, `--info` (+ `-foreground`), the five status tokens `--status-{draft,submitted,approved,rejected,returned}` (+ `-foreground`, and `--status-returned-text` for readable amber text) and shadows `--elevation-sm/md/lg` (exposed as `shadow-sm/md/lg`). All are registered in `@theme inline`, so `bg-success`, `text-status-approved`, `bg-status-draft` work. Use tokens, not `emerald-*`/`red-*`/`slate-*` palette classes.
- **Font:** Noto Sans Georgian (variable, `next/font/google`, subsets `georgian` + `latin`) → `--font-noto-georgian` → `--font-sans`. `<html lang="ka">`. Put `tabular-nums` on money, dates and percentages.
- **Status language:** `lib/application-status.ts` maps the backend strings (`Draft`, `Submitted to Risks`, `Approved`, `Rejected`, `Returned`) to a token key and Georgian label; render with `<StatusBadge status={…} short? />` (`components/applications/status-badge.tsx`: tinted pill + dot, never color alone). `Badge` has variants `draft|submitted|approved|rejected|returned|success|warning|info|destructive|inactive|outline`.
- **Formatters:** `lib/format.ts` (`formatMoney` → `24,500 ₾` / `$1,200`, `formatDate` → `08.10.2026`, never throws). `lib/applications.ts`: `fetchApplications()`, `shortName()` (`ე. გელაშვილი`), `vehicleLabel()`, `canViewApplications()`.
- **Not available yet:** features without a backend are shown disabled with a "მალე" badge (e.g. "პაროლი დაგავიწყდათ?", two dashboard KPIs) — never with invented numbers.
- **Dark mode:** the `.dark` class on `<html>` with `@custom-variant dark (&:is(.dark *))`.
  - Login, dashboard, shell and settings use tokens only, so both themes work.
  - The applications list and the users/branches tables use tokens too (container `overflow-hidden rounded-xl border bg-card shadow-sm`). The application wizard and detail page use tokens only.
- **shadcn components** (style `radix-nova`; add one with `npx shadcn add <name>`):
  - `dialog`, `alert-dialog` and `select` import `@radix-ui/react-*`; the rest import the `radix-ui` monopackage, which new adds use.
  - `Button` and `Input` default to `h-8`, so add `h-10` to meet the tap-target rule. `SelectTrigger` is already `h-10`.
  - `Checkbox` wraps a native `<input type="checkbox">`, so it takes `onChange`, not `onCheckedChange`.
  - `Badge`: see Status language above. `Skeleton` (`components/ui/skeleton.tsx`) for loading states; `components/ui/loading.tsx` is a custom spinner.
  - The shadcn CLI once added an unrelated npm package `cn` and imported `cn` from it; after `npx shadcn add`, check `package.json` and keep `import { cn } from "@/lib/utils"`.
  - `Table` is restyled to the design: uppercase 12px muted headers, 14px cell padding, `hover:bg-muted` rows.
  - `Textarea` (`components/ui/textarea.tsx`) is used by the workflow dialog and the wizard. Not installed: Tabs (even though the rules name it), Switch, Tooltip and Toast.
- **Patterns to copy:**
  - Page title: pass `title` to `DashboardShell` (top bar). Section card: `rounded-xl border bg-card p-5 shadow-sm sm:p-[22px]` with an `h2.text-[17px] font-semibold`.
  - Field: `div.space-y-2` with a `Label` and an `Input className="h-10"`. Use react-hook-form's `Form*` components where possible, and rely on `aria-invalid` for error styling.
  - Error banner: `rounded-lg border border-destructive/30 bg-destructive/10 text-destructive` (as in `FormNotice` in `components/settings/settings-section.tsx`).
  - Empty or loading block: `flex min-h-65 items-center justify-center rounded-xl border border-dashed` (as in `users-table.tsx`).
  - Tables: wrap them in `rounded-xl border`, and hide secondary columns with `hidden md:table-cell` and its `lg:`/`xl:` variants (as in `applications-table.tsx`).
  - Links styled as buttons: `<Button asChild><Link …/></Button>`.
  - Merge classes with `cn()` from `@/lib/utils`.
- **Oversized files:** several feature components are far past the 150-line guideline, such as `users-management.tsx` (~330). Don't treat their size or their hardcoded colors as the norm.

## UI and coding rules

The team's rules for UI, components and responsive layout live in `.github/copilot-instructions.md`. They are imported here so there is only one copy to maintain:

@.github/copilot-instructions.md
