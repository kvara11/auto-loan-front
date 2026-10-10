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

User-facing text is in Georgian. Write new labels, messages and zod validation errors in Georgian. Some screens are still partly English: the application detail page, the 404 page, parts of settings, the header title and the delete-user dialog.

## Architecture

### Talking to the backend

- In `lib/axios.ts`, `axiosInstance` points at `NEXT_PUBLIC_API_URL` with `withCredentials: true`, and auth is an HttpOnly cookie holding a Sanctum personal access token (no session, no CSRF). Use the `api.get/post/put/patch/delete` wrappers. They return the backend envelope `{ success, message, data }` rather than the axios response, so read payloads as `response.data?.foo`. `getApiErrorMessage(err)` returns the first field message from a 424 `errors` object, otherwise the backend's `message`.
- There is no axios interceptor, so a 401 is not handled globally. Each call site decides what to do with it.
- `API_ROUTES` in `lib/routes.ts` holds the auth, admin and settings endpoints. The application and client endpoints (`/api/applications`, `/api/clients`, `/api/clients/personal/:personalId`) are still written as inline strings in components.
- **There are two different `/api/*` namespaces.** A path passed to `api.*` goes to the backend, while `fetch("/api/...")` goes to this app's own route handlers under `app/api/`. The only such handler is `app/api/stats/vehicle-options/route.ts`, a server-side proxy that adds the secret `X-API-KEY` header (from `STAT_API_KEY`) and forwards the browser's cookie. Use this pattern for any backend endpoint that needs a secret.
- Data fetching is client-side in `useEffect`, with an `active` flag to ignore late responses. Server components don't fetch data, and there is no React Query or SWR.

### Auth and session

- There is no route protection: no `proxy.ts` (Next 16's replacement for `middleware.ts`) and no server-side guard. Pages render for anyone, and the backend rejects unauthenticated API calls.
- `AuthUser.role` is not read anywhere, and `AuthUser.permissions` only hides the "ახალი განაცხადი" button without `applications.create` (`applications-management.tsx`). Permissions are cached at login, so a user must log in again to see role changes. Otherwise the only access control in the UI is which modules the backend sends for the sidebar; every page is still reachable by URL, and the backend answers 401/404.
- `/` redirects to `/login`. The login page calls `/api/auth/me` first and goes straight to `/dashboard` if a session already exists. There is no `/register` page and no self-registration: the backend creates users only through the admin endpoint `POST /api/admin/users` (`users.manage`), which the users screen doesn't call yet.
- `lib/auth-storage.ts` caches the backend's `AuthUser` (including `permissions` and `modules`) in `sessionStorage`, and `useAuthUser()` reads it through `useSyncExternalStore`.
  - `remember_me` is only sent to the backend. The user is always cached in `sessionStorage`, so every new tab fetches `/api/auth/me` again.
  - Cross-tab sync works through `localStorage[AUTH_SYNC_KEY]`. Any write to it fires a `storage` event, and other tabs clear their cached user when they see it. That includes writes from logins, failed logins, logouts and settings saves.
- Gotcha: `lib/auth-storage.ts` is a client module, but it reads `AUTH_USER_KEY` and `AUTH_SYNC_KEY`, which lack the `NEXT_PUBLIC_` prefix. They are therefore undefined in the browser, and both storage keys end up as `""`.

### Dashboard shell and navigation

- Authenticated pages have no shared `layout.tsx`. Each page (`app/dashboard/**`, `app/settings`, `app/not-found.tsx`) wraps its own content in `<DashboardShell>`. Dashboard pages are thin server components, and the feature UI lives in `components/<feature>/` as client components.
- Because every page mounts its own shell, shell state resets on each navigation. That includes the sidebar's collapsed state.
- `DashboardShell` provides the mobile sidebar `Sheet`, the content padding and the `max-w-7xl` container, so pages don't add them.
- If no user is cached, `DashboardShell` fetches `/api/auth/me`.
- The sidebar is built from `user.modules`, a backend-provided tree with `route`, `icon`, `sort_order`, `is_active` and `children` fields.
  - A module with children and no route renders as a group label.
  - A module with a route renders as a link, and any children it has are dropped.
  - A new page only shows up in the nav once the backend returns a module for it.
  - The module's `icon` string must also have an entry in `iconMap` in `components/dashboard/dashboard-sidebar.tsx`, or it falls back to `Circle`.
  - There is no active-link highlighting.

### Settings and preferences

- `/api/settings` stores only preferences: theme, notifications and sidebar_collapsed (`lib/settings.ts`, `hooks/use-settings.ts`). `normalizeSettings` accepts either a flat object or a `{ settings }` wrapper, and turns `0/1/"true"/"1"` into booleans. Names are profile data: the form shows them from the auth user and, when they change, `saveProfile()` calls `PUT /api/auth/me` and caches the returned user. Email is read-only. Don't send names through `/api/settings` again: empty strings used to arrive as `null` and broke the save.
- After a save, `settings-form.tsx` also writes the theme and sidebar values to `localStorage` (`lib/ui-preferences.ts`). The rest of the app reads only `localStorage`.
  - `ThemeSync` in the root layout reads the theme and toggles the `dark` class on `<html>` in an effect. There is no script that runs before first paint, so dark-mode users see a light flash on load.
  - The shell reads the sidebar value through its own copy of `getStoredSidebarCollapsed` in `dashboard-shell-state.tsx`.
- The change-password dialog posts `{ current_password, password, password_confirmation }` to `/api/auth/change-password`. On success the backend signs out every other session of the user. The dialog's `<form>` is portaled, but in the React tree it sits inside the settings `<form>`, so its submit handler calls `stopPropagation()`; keep that if you move it.

### Users admin (`components/users/`)

- The page loads `GET /api/admin/users`, `GET /api/admin/roles` and `GET /api/admin/branches` with `Promise.allSettled`; failures are silent.
- Create → `POST /api/admin/users`, edit → `PUT /api/admin/users/:id` (payload from `toUserPayload` in `users-types.ts`; passwords only on create). The list is updated from the server's response. The toggle calls `POST /api/admin/users/:id/activation`. The delete button is commented out.
- `user-form-schema.ts` mirrors the backend rules (username `[A-Za-z0-9._-]`, password ≥8 + confirmation on create). A branch is required for `credit-officer` and `branch-manager` (`BRANCH_REQUIRED_ROLES`); other roles get a "ფილიალის გარეშე" option. Only active branches are offered, plus the user's current one.
- Dialog forms show backend 424 errors on their fields with `getApiFieldErrors()` + `form.setError`, and other errors in a banner (pattern used by `user-form-dialog.tsx` and `branch-form-dialog.tsx`).
- Filtering and pagination are client-side. The default status filter is `"active"`, so inactive users start hidden.

### Branches admin (`components/branches/`, `/dashboard/branches`)

- `GET/POST/PUT /api/admin/branches`. There is no delete: the power button toggles `is_active`. The table shows code, name, user count and status.
- The sidebar shows the page through the backend's `branches` module (icon `building-2` → `Building2` in `iconMap`).

### Loan applications (`components/applications/`)

- **List:** `GET /api/applications`, where `data` is either an array or `{ applications }`. The backend returns only the user's scope (officer: own; branch manager: branch; risk manager: non-Draft; auditor: all; administrator: 401). The officer line in the table also shows the application's branch. The eye button opens `application-details-dialog.tsx`, which fetches `GET /api/applications/:id` and reads `data.application`.
- **Detail page:** `/dashboard/applications/[id]` (`application-detail.tsx`) calls the same endpoint but treats `data` as a flat `ApplicationDetailRecord` (`client_name`, `personal_id`, ...). Nothing links to this page and it is English-only. Check the real backend response before building on either shape.
- **Status:** the raw backend string, shown untranslated. The table colors "Draft", "Approved" and "Rejected". The date and money formatters are copied separately into the table, the dialog and the detail page.
- **New application** (`application-form.tsx`, ~1900 lines) has two steps:
  1. **Client.** Look up the client by personal ID. The lookup status becomes `existing` or `new`, and any lookup error is treated as `new`. "Next" then:
     - skips the API when an existing client is unchanged,
     - calls `PUT /api/clients/:id` when an existing client was edited (the backend rejects a changed `personal_id` with 424),
     - otherwise calls `POST /api/clients` and stores the returned `clientId`.
  2. **Application.** Collect income (employee, entrepreneur or lease items), the loan, the co-borrower or guarantor and the vehicle, then call `POST /api/applications`.
- **Form internals:**
  - It doesn't use react-hook-form. State is a single `useState` object with a hand-written `FormErrors` map. `validateStep1` and `validateStep2` only check that required fields are non-blank.
  - The payload is the whole form object plus `client_id`. `toPayloadNumber` converts number fields: it strips commas and whitespace and turns empty or NaN values into `undefined`.
  - LTV and the down-payment share are computed only for display. The backend returns its own `ltv` and `ltv_warning`.
  - Makes, models, fuel types and transmissions come from the vehicle-options proxy. Models are filtered by `make_id` with strict equality.
  - The legal-address "verify" and debtor-registry "check" buttons are client-side mocks that fill in fixed values.
  - `translit`, `titleCase` and `validate()` are unused.

## Styling

- **Tokens** (`app/globals.css`): a neutral oklch palette in `:root` and `.dark`, mapped through `@theme inline`. Tailwind v4 has no `tailwind.config`. The only colored token is `--destructive`. There are no success, warning or info tokens, which is why feature code uses `emerald-*`, `red-*` and `amber-*` palette classes. When a status color is needed, prefer adding a token.
- **Fonts are broken:** `globals.css` sets `--font-sans: var(--font-sans)`, which refers to itself, while `layout.tsx` defines `--font-geist-sans`. Geist is therefore never applied, and pages render in the browser's default font. Geist also has no Georgian glyphs (`subsets: ["latin"]`), so Georgian text always comes from an OS fallback font. `<html lang="en">` should be `ka`.
- **Dark mode:** the `.dark` class on `<html>` with `@custom-variant dark (&:is(.dark *))`.
  - Login and settings have `dark:` variants.
  - The applications feature (form, table, dialog) and the users table row buttons hardcode light colors such as `bg-white`, `text-slate-800` and `bg-*-100`, with no dark variants.
- **shadcn components** (style `radix-nova`; add one with `npx shadcn add <name>`):
  - `dialog`, `alert-dialog` and `select` import `@radix-ui/react-*`; the rest import the `radix-ui` monopackage, which new adds use.
  - `Button` and `Input` default to `h-8`, so add `h-10` to meet the tap-target rule. `SelectTrigger` is already `h-10`.
  - `Checkbox` wraps a native `<input type="checkbox">`, so it takes `onChange`, not `onCheckedChange`.
  - `Badge` adds `success` and `inactive` variants. `components/ui/loading.tsx` is a custom spinner.
  - Not installed: Tabs (even though the rules name it), Textarea, Switch, Tooltip and Toast. The application form uses raw `<textarea>`s and a hand-made toast.
- **Patterns to copy:**
  - Page header: `div.space-y-1` + `h3.text-xl font-semibold tracking-tight sm:text-2xl`. With an action button, wrap both in `flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between`.
  - Field: `div.space-y-2` with a `Label` and an `Input className="h-10"`. Use react-hook-form's `Form*` components where possible, and rely on `aria-invalid` for error styling.
  - Error banner: `rounded-lg border border-destructive/30 bg-destructive/10 text-destructive` (as in `settings-form.tsx`).
  - Empty or loading block: `flex min-h-65 items-center justify-center rounded-xl border border-dashed` (as in `users-table.tsx`).
  - Tables: wrap them in `rounded-xl border`, and hide secondary columns with `hidden md:table-cell` and its `lg:`/`xl:` variants (as in `applications-table.tsx`).
  - Links styled as buttons: `<Button asChild><Link …/></Button>`.
  - Merge classes with `cn()` from `@/lib/utils`.
- **Oversized files:** several feature components are far past the 150-line guideline, such as `application-form.tsx` (~1900 lines), `application-details-dialog.tsx` (~490), `settings-form.tsx` (~370) and `users-management.tsx` (~330). Don't treat their size or their hardcoded colors as the norm.

## UI and coding rules

The team's rules for UI, components and responsive layout live in `.github/copilot-instructions.md`. They are imported here so there is only one copy to maintain:

@.github/copilot-instructions.md
