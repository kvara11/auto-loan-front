# Test scenarios

The repo has no automated tests yet. This file lists the behaviors worth covering for each feature, so it can be used as a manual QA checklist now and turned into automated tests later.

Each scenario states the expected behavior. Where the current code behaves differently, a **Known issue** note describes what happens today. When you fix one, remove the note. When you change behavior, update the scenario.

File paths are relative to the repo root. Backend endpoints are on `NEXT_PUBLIC_API_URL` unless marked as a Next route handler.

## 1. Auth and session

Files: `app/(auth)/login/page.tsx`, `lib/auth-storage.ts`, `lib/validations/auth.ts`, `components/dashboard/dashboard-header.tsx`, `components/dashboard/dashboard-shell.tsx`.

### Login

1. **Valid credentials.** `POST /api/auth/login` with `{ username, password, remember_me }` → the user is cached in `sessionStorage` and the app navigates to `/dashboard`.
2. **Client-side validation.** An empty username, or a password shorter than 6 characters → Georgian field errors, and no request is sent.
3. **Wrong credentials.** The backend rejects the login → the backend's `message` is shown, or the fallback "მომხმარებლის სახელი ან პაროლი არასწორია." The cached user is cleared.
4. **Already logged in.** Opening `/login` with a valid session cookie → `GET /api/auth/me` succeeds and the page redirects to `/dashboard` without showing the form.
5. **`/me` fails.** `/me` returns 401 or a network error → the login form is shown.
6. **`/me` returns 200 with no `user`.** The login form should be shown.
   **Known issue:** the page stays on "Checking session..." forever.
7. **Remember me.** `remember_me: true` is sent to the backend. The client still caches the user only in `sessionStorage`, so a new tab starts with no cached user and calls `/me`.

### Register

8. **No self-registration.** `/register` doesn't exist (Next.js 404), and the backend's `POST /api/auth/register` returns 404. Users are created by an admin (`POST /api/admin/users`).
9. *(Removed.)*
10. *(Removed.)*

### Logout and multiple tabs

11. **Logout.** The avatar menu → Logout → `POST /api/auth/logout` → the cached user is cleared and the app goes to `/login`.
12. **Logout when the backend errors.** A 401 or 500 from logout → the cache is still cleared and the app still goes to `/login`.
13. **Logout in another tab.** Logging out in tab B → tab A should end up on `/login`.
    **Known issue:** tab A only clears its cache. The shell calls `/me` again, gets a 401, and shows an empty sidebar on the same page.
14. **Failed login in another tab.** A failed login in tab B should not affect tab A.
    **Known issue:** any write to the sync key clears every other tab's cached user.

### Route access and session expiry

15. **Logged-out access.** Opening `/dashboard`, `/dashboard/*` or `/settings` without a session should redirect to `/login`.
    **Known issue:** there is no route guard. The page renders with an empty sidebar, and its API calls fail.
16. **Cookie expires while a user is cached.** The next API call should send the user to `/login`.
    **Known issue:** there is no 401 interceptor, and the shell doesn't call `/me` when a user is cached. The sidebar keeps showing stale modules.
17. **Storage keys.** In DevTools, the `sessionStorage` key for the cached user should match `AUTH_USER_KEY`.
    **Known issue:** both keys are `""` in the browser, because `AUTH_USER_KEY` and `AUTH_SYNC_KEY` lack the `NEXT_PUBLIC_` prefix.

## 2. Dashboard shell and navigation

Files: `components/dashboard/*`, `app/not-found.tsx`.

1. **Active modules.** Only modules with `is_active: true` are shown, ordered by `sort_order`, at every level of the tree.
2. **Group modules.** A module with children and no `route` renders as an uppercase group label followed by its children. The label is hidden when the sidebar is collapsed.
3. **Module with a route and children.** It renders as a single link, and its children are not shown. This is current behavior; confirm with the backend whether that's intended.
4. **Unknown icon.** An `icon` value missing from `iconMap` renders the `Circle` icon.
5. **No route.** A module with no route and no children links to `/dashboard`.
6. **Collapse toggle.** The sidebar narrows from `w-64` to `w-18` and the labels hide. The state should persist across navigation.
   **Known issue:** the toggle isn't saved, and each page mounts a new shell, so navigating expands the sidebar again.
7. **Reload while collapsed.** With `localStorage["auto-loan.sidebar-collapsed"] = "true"`, the sidebar should load collapsed with no warnings.
   **Known issue:** the server renders it expanded, so React logs a hydration mismatch and the width snaps.
8. **Collapsed with nested modules.** The icons should be centered.
   **Known issue:** `pl-4` overrides `px-0`, so nested icons sit off-centre.
9. **Mobile navigation.** Below `lg`, the hamburger opens a left `Sheet` with the full sidebar, and tapping a link closes it.
10. **Header menu.** The avatar menu → Settings opens `/settings`.
11. **Unknown URL.** The 404 page renders inside the dashboard shell.

## 3. Settings

Files: `components/settings/settings-form.tsx`, `hooks/use-settings.ts`, `lib/settings.ts`, `lib/ui-preferences.ts`, `components/theme-sync.tsx`.

### Load

1. **Load and normalize.** `GET /api/settings` loads the settings. A flat response and a `{ settings }` response both work. `0/1/"true"/"1"` are read as booleans, and a missing `notifications` defaults to on.
2. **Backend omits names.** First and last name should fall back to the cached auth user.
   **Known issue:** `normalizeSettings` returns `""`, which overwrites the auth user's values.
3. **Read-only email.** The email field can't be edited.
4. **Load fails.** An error is shown, and saving should be blocked.
   **Known issue:** the form stays saveable, so saving would send the defaults (light theme, notifications on) and overwrite the backend.

### Save

5. **Dirty tracking.** Editing a field marks the form dirty, and reverting the change clears it.
6. **Save.** `POST /api/settings` with `{ settings }` → "Settings saved." Then:
   - the cached auth user gets the new names,
   - the theme and sidebar values are written to `localStorage`,
   - other open tabs switch theme through the `storage` event.
7. **Extra reload after save.** A save currently triggers an extra `GET /api/settings`, because the load effect depends on the auth user. Check this doesn't cause a flicker.

### Theme and sidebar

8. **Theme preview.** Changing the theme applies it immediately. An unsaved change should revert when you leave the page.
   **Known issue:** it stays applied until a reload.
9. **Saved dark theme on reload.** The page should load dark.
   **Known issue:** there's a brief light flash, because `ThemeSync` runs in an effect after first paint.
10. **Sidebar toggle out of sync.** If `localStorage` and the backend disagree on `sidebar_collapsed`, every click on the toggle should have a visible effect.
    **Known issue:** the toggle displays the shell's value but flips the settings value, so the first click does nothing visible.

### Change password

11. **Empty or mismatched fields.** Any of the three fields empty, or new password ≠ repeat → a Georgian error is shown and no request is sent.
12. **Backend rules.** Wrong current password, a new password shorter than 8 characters, without mixed case/number/symbol, or equal to the current one → 424, and the dialog shows the specific Georgian field message.
13. **Success.** `POST /api/auth/change-password` with `{ current_password, password, password_confirmation }` → the dialog closes; other browsers/devices of the same user are signed out, this one stays signed in.
    **Known issue:** the success message is rendered inside the dialog that has just closed. Old messages also reappear when the dialog is reopened.
14. **Only one request on submit.** Submitting the password form sends exactly one request and does not save the settings form (the handler calls `stopPropagation()`). Check the Network tab.

## 4. Users admin

Files: `components/users/*`.

### Load

1. **Parallel load.** `GET /api/admin/users` (read from `data.users`) and `GET /api/admin/roles` (read from `data`) load in parallel. Each user's role is shown by its `display_name`.
2. **Users request fails.** An error should be shown.
   **Known issue:** the page shows the "მომხმარებელი ვერ მოიძებნა" empty state with no error.
3. **Roles request fails.** The role filter and the role select are empty.
4. **Bad date.** A user with an unparseable `created_at` should not break the page.
   **Known issue:** `formatDate` throws a `RangeError` and crashes the table.

### Filters and pagination

5. **Default filter.** The status filter starts as "active", so inactive users are hidden. Clear resets the filters to these defaults and is disabled while they're unchanged.
6. **Search.** Matching is case-insensitive on full name, email and username. Role and status are exact matches.
7. **Pagination.** Page sizes are 10, 20 and 50. Changing any filter returns to page 1.

### Activation

8. **Toggle.** `POST /api/admin/users/:id/activation` with `{ active }` → the status badge flips after the request succeeds. A double-click sends only one request.
9. **Toggle fails.** An error message should be shown.
   **Known issue:** the rejection is unhandled and the user sees nothing.

### Create, edit and delete

10. **Create.** Creating a user should send it to the backend and keep it after a reload.
    **Known issue:** no request is sent. The user is only added to local state with id `u-<timestamp>`, and it disappears on reload.
11. **Edit.** Changing a user's role should save it.
    **Known issue:** edit mode only shows the role field, but the schema still requires a 6-character password. Validation fails on that hidden field and Save does nothing. Even if it passed, the change would only be local.
12. **Inactive users.** The edit button is disabled for inactive users.
13. **Delete.** The delete button is commented out in `users-table.tsx`, and `handleDelete` only changes local state. Add scenarios here once delete is wired to the backend.

## 5. Applications list, details dialog and detail page

Files: `components/applications/applications-management.tsx`, `applications-table.tsx`, `application-details-dialog.tsx`, `application-detail.tsx`, `app/dashboard/applications/**`.

### List

1. **Array response.** `GET /api/applications` where `data` is an array → the rows render.
2. **Wrapped response.** `data` is `{ applications: [...] }` → the rows render.
3. **Other shapes.** Any other `data` → the "applications not found" empty state.
4. **`success: false`.** An error card shows the backend message. Its retry button reloads the page.
5. **Request throws.** The backend message is shown, or the Georgian fallback.
6. **Missing number.** A row with `application_no: null` shows the `id` instead.
7. **Status badges.** "Draft" is outlined, "Approved" green, "Rejected" red, and anything else uses the default badge. The text is the raw backend string.
8. **LTV warning.** A row with `ltv_warning` set shows the LTV in red with a pulsing dot whose tooltip holds the warning.
9. **Responsive columns.** Secondary columns hide at the `md`, `lg` and `xl` breakpoints.
10. **Bad dates.** An unparseable date should not crash the table.
    **Known issue:** the formatter throws a `RangeError`.

### Details dialog

11. **Open.** The eye button → `GET /api/applications/:id`, reading `data.application` → the dialog shows its sections. The header shows the number and status from the list row.
12. **Missing `application` key.** An error message is shown inside the dialog.
13. **Switching rows quickly.** The dialog should show the last application clicked.
    **Known issue:** there is no guard against late responses, so an earlier response can overwrite it.
14. **Co-borrower section.** It is shown when `has_coborrower_guarantor` is `"1"` or `1` and a name is set. Check what the backend returns for applications created by the form, which sends a boolean.

### Detail page `/dashboard/applications/[id]`

15. **Load.** Success → the content renders. `success: false` or a thrown error → the "Application not available" card with the message.
16. **Response shape.** This page reads `data` as a flat record (`client_name`, `personal_id`, `notes`), while the dialog reads `data.application` from the same endpoint. Confirm which shape the backend returns. Also note that nothing links to this page yet and it is English-only.

## 6. New application, step 1: client

File: `components/applications/application-form.tsx`.

### Lookup

1. **Empty personal ID.** Clicking lookup shows "კლიენტი ვერ მოიძებნა" and sends no request.
2. **Client found.** `GET /api/clients/personal/:pid` returns a client with an `id` → the fields are filled where the backend value is non-empty. First name, last name and birth date become read-only, the "existing" badge appears, and the personal ID is locked.
3. **Client not found.** `success: false`, or no client in the response → "client not found", status `new`, and the fields stay editable.
4. **Lookup error.** A 500 or network error should show an error, not "new client".
   **Known issue:** any error is silently treated as `new`, which can lead to a duplicate client being created.
5. **Reset.** The X button clears the client fields, the status, the client id and the errors. It keeps the personal ID, which becomes editable again.

### "Next" button

6. **Required fields.** Blank `personal_id`, `first_name`, `last_name`, `phone` or `birth_date` → "სავალდებულო ველი" under each field, and no API call. There are no format checks yet, for example for the 11-digit personal ID, the phone or the email.
7. **Existing client, unchanged.** The form goes to step 2 without sending any request.
8. **Existing client, edited.** `PUT /api/clients/:id` with the 10 client fields, `family_members` as a number → step 2.
9. **Update fails.** The PUT throws → an error banner, and the form stays on step 1. The PUT's `success` flag is not checked.
10. **New client.** `POST /api/clients` → the form needs `success` and `data.client.id`, otherwise it shows an error banner. On success it stores the client id and goes to step 2.
11. **Back after creating a client.** Going back from step 2 and pressing Next again should not create a second client.
    **Known issue:** a second `POST /api/clients` is sent, because the status isn't changed to `existing` after the client is created.
12. **Mocks.** The legal-address "verify" button and the debtor-registry "check" button currently fill in fixed values. Replace these scenarios when real integrations exist.

## 7. New application, step 2: loan, income and vehicle

File: `components/applications/application-form.tsx`.

### Vehicle options

1. **Load.** `fetch("/api/stats/vehicle-options")` (a Next route handler) fills the make, model, fuel and transmission selects.
2. **Load fails.** The selects stay empty with no message, and the error only goes to `console.error`. Decide whether the user should see an error.
3. **Make → model.** Choosing a make shows only its models. Changing the make resets the model, and the model select stays disabled until a make is chosen.
4. **ID types.** The backend's `make_id` values must have the same type as the selected make ID, because the filter uses strict equality. String IDs would match no models.

### Validation

5. **Required fields.** `requested_amount`, `loan_term_months`, `annual_interest_rate`, `payment_day`, `car_year` and `market_value` must be filled, and a make and a model must be chosen. Every error should be visible.
   **Known issue:** `payment_day` shows no error, and `car_year` and `market_value` only get a red border.
6. **Payment day range.** A value outside 1–31 is blocked by the browser's own validation, because the form has no `noValidate`.

### Conditional sections

7. **Income type.** Switching the type shows the employee, entrepreneur or lease panel.
8. **Lease items.** Items can be added, edited and removed. With none, the empty-state text is shown.
9. **Toggles.** The "additional income" checkbox reveals its fields, and so does the co-borrower/guarantor checkbox.
10. **Hidden fields.** Values from a panel that's no longer shown, such as an earlier income type or an unchecked co-borrower, should not be sent.
    **Known issue:** the whole form object is sent, including those values.

### Calculated values

11. **Live LTV.** With a requested amount of 9000 and a market value of 10000, the LTV shows 90.0% in red with a warning, because it's above `max_ltv`. An empty `max_ltv` counts as 80. The LTV is not sent to the backend.
12. **Down-payment share.** `down_payment / seller_price`, or `down_payment / (requested + down_payment)` when there's no seller price.

### Payload

13. **Number conversion.** `"1,000"` → `1000`. `"abc"` and empty values are left out of the payload. `work_experience_months` and the lease `duration` are sent as strings.
    **Known issue:** `"12,5"` becomes `125`, because commas are stripped instead of read as a decimal separator.
14. **VIN and plate.** Both are uppercased while typing, and the VIN is limited to 17 characters.

### Submit

15. **Missing client id.** Submitting without a client id shows the "client identifier not found" banner.
16. **Success.** `POST /api/applications` with the form, `client_id` and the converted numbers → a success toast, then a redirect to `/dashboard/applications` after 900 ms. The submit button should stay disabled until the redirect.
    **Known issue:** the button is enabled again during those 900 ms, so the application can be submitted twice.
17. **Failure.** `success: false` or a thrown error → a banner with the backend message or the Georgian fallback.
18. **Back from step 2.** The values entered in step 2 are kept.

## 8. Vehicle-options route handler

File: `app/api/stats/vehicle-options/route.ts`.

1. **Proxying.** The handler forwards `X-API-KEY` from `STAT_API_KEY` and the browser's `Cookie` header, and returns the backend's status and JSON unchanged.
2. **Non-JSON reply.** If the backend returns an HTML error page, the handler should return a clean error.
   **Known issue:** `res.json()` throws and the handler responds with an unhandled 500.
3. **Missing key.** Without `STAT_API_KEY`, an empty header is sent, and the backend should reject the request.

## 9. Visual, responsive, dark mode and language

### Fonts and language

1. **Font.** The computed `font-family` on `<html>` should be Geist.
   **Known issue:** `globals.css` sets `--font-sans: var(--font-sans)`, which refers to itself, so the browser's default font is used.
2. **Georgian text.** Check how it renders on Windows, macOS and Linux. Geist has no Georgian glyphs, so an OS font draws them. `<html lang>` should be `ka`.
3. **Uppercase labels.** Labels styled with `uppercase` show Georgian characters correctly, without unexpected Mtavruli capitals or missing glyphs.

### Dark mode

4. **Dark-mode coverage.** Every screen should be readable in dark mode.
   **Known issue:** the applications table, form and dialog, and the users table row buttons, use light-only colors such as `bg-white`, `text-slate-800` and `bg-*-100`.
5. **Native controls.** Date pickers and checkboxes follow the theme.
   **Known issue:** `color-scheme` is never set, so they stay light.

### Responsive layout

6. **320–375 px.** No page scrolls sideways.
   **Known issue:** the new-application form's sticky footer uses `-mx-6` against the shell's `px-4` and causes horizontal scroll.
7. **375 px.** The users table, which has 7 columns that don't wrap, scrolls inside its own container, not the whole page. The details dialog's fixed `grid-cols-2` is still readable.
8. **1024 px with the sidebar expanded.** The users filter row (fixed `220px` columns) and the 5-column lease grid fit without overflow.
9. **Long Georgian text.** Long module names fit in the `w-64` sidebar, and long card titles aren't clipped by `leading-none`.
10. **Tap targets.** Interactive elements are at least `h-10`.
    **Known issue:** users row actions are `h-7`, pagination controls are `h-9`, and some icon buttons are `h-8`.
11. **Toast on mobile.** The success toast doesn't cover the form's sticky footer buttons.
12. **Delete-user dialog.** The confirm button text uses `text-destructive-foreground`, which isn't defined. This only matters once delete is enabled.
