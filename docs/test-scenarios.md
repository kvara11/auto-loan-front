# Test scenarios

The repo has no automated tests yet. This file lists the behaviors worth covering for each feature, so it can be used as a manual QA checklist now and turned into automated tests later.

Each scenario states the expected behavior. Where the current code behaves differently, a **Known issue** note describes what happens today. When you fix one, remove the note. When you change behavior, update the scenario.

File paths are relative to the repo root. Backend endpoints are on `NEXT_PUBLIC_API_URL` unless marked as a Next route handler.

## 1. Auth and session

Files: `app/(auth)/login/page.tsx`, `components/auth/login-form.tsx`, `components/auth/login-brand-pane.tsx`, `lib/auth-storage.ts`, `lib/validations/auth.ts`, `components/dashboard/user-menu.tsx`, `components/dashboard/dashboard-shell.tsx`.

### Login

1. **Valid credentials.** `POST /api/auth/login` with `{ username, password, remember_me }` → the user is cached in `sessionStorage` and the app navigates to `/dashboard`.
2. **Client-side validation.** An empty username, or a password shorter than 6 characters → Georgian field errors, and no request is sent.
3. **Wrong credentials.** The backend rejects the login → a red banner with the backend's `message` ("მომხმარებელი ან პაროლი არასწორია."), both inputs get `aria-invalid`, the cached user is cleared.
3a. **Layout.** From `lg`: brand pane on the left (≈46%, gradient, "ავტოსესხების გაცემა და მართვა — ერთ სისტემაში", "© 2026 Qbind · შიდა სისტემა") and the 400px card on the right; below `lg` only the card with the "A Auto Loan" mark above it. Both themes use tokens. "პაროლი დაგავიწყდათ?" is not clickable and carries a "მალე" badge. The submit button shows a spinner and "შესვლა..." while sending.
4. **Already logged in.** Opening `/login` with a valid session cookie → `GET /api/auth/me` succeeds and the page redirects to `/dashboard` without showing the form.
5. **`/me` fails.** `/me` returns 401 or a network error → the login form is shown.
6. **`/me` returns 200 with no `user`.** The login form is shown (the spinner stops).
7. **Remember me.** `remember_me: true` is sent to the backend. The client still caches the user only in `sessionStorage`, so a new tab starts with no cached user and calls `/me`.

### Register

8. **No self-registration.** `/register` doesn't exist (Next.js 404), and the backend's `POST /api/auth/register` returns 404. Users are created by an admin (`POST /api/admin/users`).
9. *(Removed.)*
10. *(Removed.)*

### Logout and multiple tabs

11. **Logout.** The avatar menu → "გასვლა" → `POST /api/auth/logout` → the cached user is cleared and the app goes to `/login`.
12. **Logout when the backend errors.** A 401 or 500 from logout → the cache is still cleared and the app still goes to `/login`.
13. **Logout in another tab.** Logging out in tab B → tab A should end up on `/login`.
    **Known issue:** tab A only clears its cache. The shell calls `/me` again, gets a 401, and shows an empty sidebar on the same page.
14. **Other tabs.** Another tab drops its cached user only on logout (`<ts>:clear`) or when a different user id logs in; a failed login or the same user refreshing `/me` in another tab has no effect (this used to loop: thousands of `/api/auth/me` requests).

### Route access and session expiry

15. **Logged-out access.** Opening `/dashboard`, `/dashboard/*` or `/settings` without a session should redirect to `/login`.
    **Known issue:** there is no route guard. The page renders with an empty sidebar, and its API calls fail.
16. **Cookie expires while a user is cached.** The next API call should send the user to `/login`.
    **Known issue:** there is no 401 interceptor, and the shell doesn't call `/me` when a user is cached. The sidebar keeps showing stale modules.
17. **Storage keys.** DevTools shows `sessionStorage["auto-loan.auth-user"]` and `localStorage["auto-loan.auth-sync"]`.

## 2. Dashboard shell and navigation

Files: `components/dashboard/*`, `app/not-found.tsx`.

1. **Active modules.** Only modules with `is_active: true` are shown, ordered by `sort_order`, at every level of the tree.
2. **Group modules.** A module with children and no `route` renders as an uppercase group label ("ოპერაციები", "ადმინისტრაცია") followed by its children; collapsed, the label becomes a thin divider.
2a. **Active link.** The current page's link has the accent background and a teal bar on the left; `/dashboard/applications/123` keeps "განაცხადები" active, "დეშბორდი" is active only on `/dashboard`.
3. **Module with a route and children.** It renders as a single link, and its children are not shown. This is current behavior; confirm with the backend whether that's intended.
4. **Unknown icon.** An `icon` value missing from `iconMap` renders the `Circle` icon.
5. **No route.** A module with no route and no children links to `/dashboard`.
6. **Collapse toggle.** "ჩაკეცვა" at the bottom narrows the sidebar from 252px to 76px; labels hide and each icon gets a tooltip. The state should persist across navigation.
   **Known issue:** the toggle isn't saved, and each page mounts a new shell, so navigating expands the sidebar again.
7. **Reload while collapsed.** With `localStorage["auto-loan.sidebar-collapsed"] = "true"`, the sidebar should load collapsed with no warnings.
   **Known issue:** the server renders it expanded, so React logs a hydration mismatch and the width snaps.
8. **Collapsed with nested modules.** The icons are centered.
9. **Mobile navigation.** Below `lg`, the hamburger opens a left `Sheet` with the full sidebar, and tapping a link closes it.
10. **Top bar.** Shows the page title (and "განაცხადები /" breadcrumb on the detail and new-application pages). The avatar shows the user's initials; its menu shows name, role · branch, "პარამეტრები" (→ `/settings`) and "გასვლა".
10a. **Theme toggle.** ☀/☾ switches the theme at once, saves it (`PUT /api/settings/preferences`) and keeps it after a reload; the settings page shows the same value.
11. **Unknown URL.** The 404 page ("გვერდი ვერ მოიძებნა", link back to the dashboard) renders inside the dashboard shell.

### Dashboard (`components/dashboard-home/*`)

12. **Officer** (`credit.officer`): KPIs — "მიმდინარე სესხები" and "თვის გაცემები" show "—" + "მალე", "დამუშავების პროცესში" shows the number of own Draft/Submitted/Returned applications; status bars count own applications; "ჩემი მონახაზები" lists own Draft/Returned (max 5); "ბოლო განაცხადები" the latest 5.
13. **Risk manager**: the role block is "რიგი — გაგზავნილი განაცხადები" (Submitted to Risks only); counts cover non-Draft applications of every branch.
14. **Branch manager / auditor**: no role block; counts cover their scope.
15. **Administrator**: no application blocks; two cards with user and branch counts that link to the admin pages.
16. **States**: skeleton while loading; the API error in a red banner; with no applications the recent list says "განაცხადები ვერ მოიძებნა".
17. **Mobile (375px)**: KPIs stack as rows, the recent list becomes compact rows (number · client, amount · car, status); no horizontal scroll.

## 3. Settings

Files: `components/settings/settings-page.tsx`, `profile-section.tsx`, `preferences-section.tsx`, `security-section.tsx`, `settings-section.tsx`, `lib/settings.ts`, `lib/ui-preferences.ts`, `components/theme-sync.tsx`.

### Layout

0. **Columns.** Below 1280 px the three sections are one column (max 48 rem). From 1280 px (`xl`): "პირადი ინფორმაცია" on the left, "ინტერფეისის პარამეტრები" and "უსაფრთხოება" stacked on the right. No horizontal scroll at 375.

### Load

1. **Load.** `GET /api/settings` → `data.profile` (`first_name`, `last_name`, `username`, `email`) and `data.preferences` (`theme`, `sidebar_collapsed`, `notifications`, `alert_sound`, already typed with defaults). A spinner shows while loading.
2. **Load fails.** An error banner is shown and no section is rendered, so nothing can be saved over the backend values.
3. **Three sections, top to bottom:** "პირადი ინფორმაცია", "ინტერფეისის პარამეტრები", "უსაფრთხოება". On mobile they stack at full width.

### Personal information (own save button)

4. **Button disabled until a change.** "შენახვა" is disabled on load; typing in first or last name enables it; reverting to the original value disables it again.
5. **Read-only fields.** Username and email can't be edited (an admin changes them).
6. **Client-side validation.** A name shorter than 2 characters → a Georgian error under the field, no request.
7. **Save.** `PUT /api/settings/profile` with `{ first_name, last_name }` → "პროფილი განახლდა.", the button disables again, and the header shows the new name (the cached auth user is updated). A reload shows the saved names.
8. **Backend validation.** A 424 is shown under the matching field; any other error appears in the section's banner.
8a. **Avatar upload (T-207).** Without an avatar the circle shows initials and "ავატარის ატვირთვა". Picking a JPG/PNG/WEBP shows a square, center-cropped preview with "ავატარის შენახვა" / "გაუქმება" (cancel restores the old picture, no request). Saving → "ავატარი განახლდა.", the top-bar avatar changes at once and stays after a reload; the button becomes "ავატარის შეცვლა".
8b. **Avatar errors.** A file the browser can't decode (HEIC, PDF renamed) → "სურათის წაკითხვა ვერ მოხერხდა…"; over 20 MB → message before decoding; a backend 424 shows its Georgian message.
8c. **Avatar removal.** "წაშლა" → "ავატარი წაიშალა.", initials return in settings and the top bar.

### Interface preferences (own save button)

9. **Button disabled until a change.** Changing the theme or a toggle enables "შენახვა"; switching back disables it.
10. **Applied on save only.** Theme and compact sidebar take effect after saving (`PUT /api/settings/preferences` with `{ preferences: { theme, sidebar_collapsed, notifications } }`), not while editing. The values are also written to `localStorage`, so other open tabs switch through the `storage` event.
11. **Saved values on reload.** The page loads with the saved theme and toggles.
    **Known issue:** a saved dark theme still flashes light briefly, because `ThemeSync` runs in an effect after first paint.
12. **Independent saves.** Saving one section doesn't send or reset the other section's unsaved changes.

### Security

13. **Empty or mismatched fields.** Any of the three fields empty, or new password ≠ repeat → a Georgian error in the dialog and no request.
14. **Backend rules.** Wrong current password, a new password shorter than 8 characters, without mixed case/number/symbol, or equal to the current one → 424 with the specific Georgian message in the dialog.
15. **Success.** `POST /api/auth/change-password` with `{ current_password, password, password_confirmation }` → the dialog closes and the section shows the success message; other browsers/devices of the same user are signed out, this one stays signed in. Reopening the dialog starts with empty fields and no old message.

## 4. Users admin

Files: `components/users/*`.

### Load

1. **Parallel load.** `GET /api/admin/users` (read from `data.users`), `GET /api/admin/roles` (read from `data`) and `GET /api/admin/branches` (read from `data.branches`) load in parallel. Each user's role is shown by its `display_name` and the branch as `code — name` (or "—").
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

10. **Create.** `POST /api/admin/users` with names, username, email, password + confirmation, role and `branch_id` → the dialog closes and the user appears at the top of the list; it is still there after a reload.
11. **Branch rule.** Role `საკრედიტო ოფიცერი` or `ფილიალის მენეჯერი` without a branch → client-side error on the branch field, no request. Other roles offer "ფილიალის გარეშე". Deactivated branches are not offered (except the user's current one when editing).
12. **Backend validation.** A taken username/email, or a weak password → the dialog stays open and the Georgian message appears under the field.
13. **Edit.** `PUT /api/admin/users/:id` with names, username, email, role and branch (no password fields) → the row updates in place. Editing a super-admin, or changing your own role, shows the backend message in the dialog banner.
14. **Inactive users.** The edit button is disabled for inactive users (the backend would allow it).
14a. **Avatars in the table.** The first column "მომხმარებელი" shows the avatar (or initials), the full name and the email below it (no separate email column); users with an avatar show the picture, others their initials; both themes; the images load only when the app is opened on `127.0.0.1`.
14b. **Avatar moderation.** The edit dialog shows the user's avatar; with one, "ავატარის წაშლა" → confirmation → removed, the dialog shows "ავატარი არ არის ატვირთული", the row shows initials, and unsaved edits in the form are kept.
15. **Delete.** The delete button is commented out in `users-table.tsx`, and `handleDelete` only changes local state. Add scenarios here once delete is wired to the backend.

## 4b. Branches admin

Files: `app/dashboard/branches/page.tsx`, `components/branches/*`.

1. **Menu.** Administrator and super-admin see "ფილიალები" under "ადმინისტრაცია"; officers and risk managers don't (and get 401 from the API if they open the URL).
2. **Load.** `GET /api/admin/branches` → table with code, name, user count (hidden on mobile) and status. No branches → the empty state "ფილიალები ჯერ არ არის დამატებული". A failed load shows an error banner.
3. **Create.** Code (`A-Z a-z 0-9 _ -`, ≤20) and name are required → `POST`; the new branch appears in code order.
4. **Duplicate.** An existing code or name → the 424 message appears under the field and the dialog stays open.
5. **Edit.** `PUT` with code and name keeps the current status.
6. **Deactivate / activate.** The power button sends `PUT` with `is_active` flipped; the badge switches between "აქტიური" and "გათიშული". There is no delete.

## 4c. Change log (T-206)

Files: `app/dashboard/audit/page.tsx`, `components/audit/*`, `lib/audit.ts`, `components/shared/*`.

1. **Menu.** Super-admin, administrator and auditor see "ცვლილებების ჟურნალი" under "ადმინისტრაცია" (the auditor sees only this item there). Officers, risk and branch managers don't; opening `/dashboard/audit` shows "ცვლილებების ჟურნალის ნახვის უფლება არ გაქვთ." (API 401).
2. **Load.** `GET /api/admin/audit-events?page=1&per_page=50` → newest first: time, who (avatar + name; "სისტემაში შეუსვლელი" for a failed sign-in), action badge (red: failed sign-in, blocking, deletions; amber: password, settings; green: created/activated; blue: clients), subject (name + type), IP (from `lg`). No entries → "ჩანაწერები ვერ მოიძებნა".
3. **Details.** Clicking a row (also with the keyboard: it's a button, `aria-expanded`) opens ველი | იყო | გახდა with Georgian field names; empty → "—", booleans → "კი/არა"; a permission change shows "+ name" / "− name" badges; password change and the reference-data update show "დამატებითი მონაცემები არ არის.". On mobile the rows stack and the details wrap (no horizontal scroll); the IP is shown under the details below `lg`.
4. **What appears.** An admin edits a user → "მომხმარებელი შეიცვალა" with only the changed fields (role and branch by name); saving without changes adds nothing. An officer edits a client's phone → "კლიენტის მონაცემები შეიცვალა" with the old and new phone. A wrong password → "წარუმატებელი შესვლა" with the typed username and the reason. A successful sign-in, logout and own profile/avatar/preferences changes do **not** appear. A password never appears.
5. **Filters.** Search (subject name or the actor's username, 350 ms debounce), action, subject type, date from/to; every change reloads from page 1; "გასუფთავება" resets all, including the search box. Invalid values → the backend's Georgian message.
6. **Pagination.** `TablePagination` with 25 / 50 / 100 per page.

## 5. Applications list, detail page and workflow

Files: `components/applications/applications-management.tsx`, `applications-table.tsx`, `components/application-detail/*`, `lib/applications.ts`, `app/dashboard/applications/**`.

### List

1. **Array response.** `GET /api/applications` where `data` is an array → the rows render.
2. **Wrapped response.** `data` is `{ applications: [...] }` → the rows render.
3. **Other shapes.** Any other `data` → the "applications not found" empty state.
4. **`success: false`.** An error card shows the backend message. Its retry button reloads the page.
5. **Request throws.** The backend message is shown, or the Georgian fallback.
6. **Missing number.** A row with `application_no: null` shows the `id` instead.
7. **Status badges.** Each status shows the Georgian short label in its status color with a dot (`StatusBadge`); an unknown string shows raw in the draft style.
8. **LTV warning.** A row with `ltv_warning` set shows the LTV in red with a pulsing dot whose tooltip holds the warning.
9. **Responsive columns.** Secondary columns hide at the `md` and `lg` breakpoints.
10. **Bad dates.** An unparseable date shows "—" (shared `formatDate`).
10h. **Filters.** "სტატუსი" (ყველა სტატუსი + the five statuses) and "შექმნის თარიღი — დან / მდე" reload the list from the backend (`GET /api/applications?status=&start_date=&end_date=`, dates inclusive). The "to" date can't be set before the "from" date (`min`/`max`); the backend also rejects it with 424. "გასუფთავება" is disabled until a filter is set and resets all three. No match → "განაცხადები ვერ მოიძებნა". The date format follows the browser's locale.
10i. **Personal ID search.** Typing in "პირადი ნომერი" reloads the list 350 ms after the last keystroke with `search=` (part of the client's personal ID, trimmed); it combines with the other filters and resets to page 1. "გასუფთავება" also empties the search box. `%` or `_` match literally (nothing, not everything).
10j. **Pagination.** The list asks for `page=1&per_page=20`; below the table "ნაჩვენებია 1–20 / N", a page-size select (10 / 20 / 50) and ‹ / › buttons with "გვერდი / სულ". Previous is disabled on page 1, next on the last page; both are disabled while loading. Changing a filter or the page size returns to page 1. If the current page no longer exists after a reload, the last page loads. No results → no pagination bar.
10k. **Layout.** Filters in two rows: search (max 24 rem, like every personal-ID input) + "ახალი განაცხადი" on the right (first on mobile); status, date from/to (narrow) and "გასუფთავება" below. The creation date is its own narrow column right of the status (from `xl`); the officer line uses the short name. At 1440 the table fits without clipping the "ოპერირება" column; long officer/branch lines wrap. ⚠ At 375 the table still clips the columns after "კლიენტი" (the container hides overflow); a card layout for mobile is not done yet.
10g. **Eye button.** Links to `/dashboard/applications/:id` (middle-click opens a new tab).

### Who sees what (data scope, enforced by the backend)

10a. **Credit officer.** Only their own applications. Opening another officer's application by URL or id → 404 "განაცხადი ვერ მოიძებნა".
10b. **Branch manager.** Every application of their branch, Drafts included; nothing from other branches. Without a branch → an empty list.
10c. **Risk manager.** Every non-Draft application of every branch; no Drafts.
10d. **Auditor / super-admin.** Everything. **Administrator:** no "განაცხადები" in the menu, and `/dashboard/applications` by URL → 401 error card.
10e. **New-application button.** In the filters bar (right end on desktop, full-width first row on mobile). Shown only when the cached user has `applications.create` (credit officer, super-admin). After a role change the user must log in again for the button to update.
10f. **Branch in the list.** The officer line shows ` · <branch name>` when the application has a branch.

### Detail page `/dashboard/applications/[id]`

11. **Load.** Skeleton, then `GET /api/applications/:id` (`data.application`, `data.actions`) and `GET …/history` → header "განაცხადი <number>" + status badge, three info cards, LTV, officer comment and history.
12. **Not found / out of scope.** Another officer's application, or a Draft opened by a risk manager → the "განაცხადი ვერ მოიძებნა" card with a link back to the list; no data leaks.
13. **"მალე" fields.** "ყოველთვიური გადასახადი" shows "—" + "მალე". Monthly income comes from the "შემოსავლები და ვალდებულებები" card (income snapshot); unfilled amounts show "—", not "0 ₾". "რედაქტირება" appears only with `can_edit` (see §7). No invented numbers.
14. **LTV card.** requested amount / market value (rounded). Over the stored `max_ltv` → red gauge and the "აჭარბებს ლიმიტს" text; no market value → "—"; no `max_ltv` → "მაქსიმალური LTV არ არის მითითებული."
15. **History.** Entries oldest first with label, `ე. გვარი · DD.MM.YYYY, HH:MM` and the comment of return/reject; while "გაგზავნილია რისკებში" a dashed "გადაწყვეტილების მოლოდინში · რისკების განყოფილება" step ends the list.
15a. **Back button.** The "← უკან" button at the right end of the header (after the action buttons) returns to the previous page (list or dashboard); a page opened directly (new tab, pasted URL) goes to `/dashboard/applications`.
16. **Layout.** 1440: two columns (2fr/1fr); 375: one column, buttons wrap, no sideways scroll; both themes readable.

### Attachments (T-406)

16a. **Who uploads.** The officer on their own Draft/Returned application and a risk manager on a submitted one see the upload bar ("ფაილის ტიპი" + "ფაილის ატვირთვა"); the auditor, the branch manager and everyone after a decision see only the list.
16b. **Upload.** One or more JPG/PNG/WEBP/HEIC/PDF files → the button shows `1/2 · 45%`, then the list and the history ("ფაილი დაემატა" + file name) update. Photos get a thumbnail, other files an icon.
16c. **Rejected files.** Over 20 MB → message before sending; a wrong type or a server rejection → "„name“: <Georgian backend message>" in the card; the 31st file → "მაქსიმუმ 30 ფაილი".
16d. **Open / download.** Clicking the name or thumbnail opens it in a new tab (inline); the download button downloads with the original name. Works only when the app is opened on `127.0.0.1` (cookie).
16e. **Delete.** Only on files you uploaded while you can still upload; confirmation dialog; the file disappears from the list, the history shows "ფაილი წაიშალა", the file stays on the server.
16f. **After submit.** The officer's upload bar and delete buttons disappear once the application is sent to risks.

### Comments (T-408)

16g. **Thread.** "კომენტარები (N)" below the attachments: oldest first, each with `ე. გვარი`, the author's role, date/time and the text (line breaks kept). Conclusions/recommendations are tinted with a blue type badge ("ოფიცრის დასკვნა", "ფილიალის რეკომენდაცია", "რისკის დასკვნა"). Empty → "კომენტარები ჯერ არ არის".
16h. **Who writes.** Officer (own application), branch manager (branch), risk manager (submitted and decided) see the textarea in every status; the auditor sees only the list. The type select lists "კომენტარი" plus the user's own conclusion type (officer: only on their own application); super-admin sees all types.
16i. **Sending.** "დამატება" (or Ctrl+Enter on desktop) is disabled while empty; after sending the text clears, the type returns to "კომენტარი" and the list reloads. Over 4500 characters a `N / 5000` counter shows; the textarea stops at 5000. Comments can't be edited or deleted and don't appear in the history.

### Workflow actions (buttons come from `data.actions`)

17. **Officer, own Draft or Returned.** "რედაქტირება" and "რისკებში გაგზავნა". Submitting an incomplete draft → the dialog shows the backend's 424 message (the missing fields). Confirm → "განაცხადი გაიგზავნა რისკებში." banner, badge "გაგზავნილია რისკებში", the button disappears, history gains "გაგზავნილია რისკებში".
18. **Officer, Submitted / Approved / Rejected.** No action buttons.
19. **Risk manager, Submitted.** "დაბრუნება", "უარყოფა", "დამტკიცება". Return or reject with an empty comment → the dialog shows "მიუთითეთ: …" and sends nothing; a backend 424 would show the same way.
20. **Return.** With remarks → status "დაბრუნებული", the "დაბრუნების მიზეზი" banner under the header (the officer sees it too), history entry with the remarks. The officer can resubmit; the banner then disappears.
21. **Approve / reject.** Status changes, no buttons remain; reject shows "უარის მიზეზი".
22. **Branch manager, auditor.** The page opens read-only (no buttons).
23. **Stale page.** Two risk managers act on the same application: the second gets 409 "ეს ქმედება განაცხადის მიმდინარე სტატუსზე დაუშვებელია." in the dialog; reload shows the real state.
24. **Super-admin on their own application.** The decision buttons are absent (backend SoD); a direct POST → 403.

## 6. New application wizard, step 1: client

Files: `components/application-wizard/*` (`client-lookup-card.tsx`, `client-details-card.tsx`, `use-client-step.ts`, `use-application-wizard.ts`), `app/dashboard/applications/new/page.tsx`.

### Lookup

1. **Digits only.** The personal ID field accepts digits only, at most 11; "ძებნა" is disabled until 11 digits.
2. **Automatic lookup.** Typing the 11th digit sends `GET /api/clients/personal/:pid` once; the field is read-only while it runs.
3. **Client found.** Green "<name> — მოიძებნა" banner; all client fields, marital status, family members and the address-verified mark are filled; the summary shows the name. "სხვა კლიენტი" clears the client fields and unlocks the personal ID.
4. **Not found (404).** "კლიენტი ვერ მოიძებნა — შეავსეთ…" notice; the fields stay empty and editable; "სხვა ნომერი" resets.
5. **Automatic address check.** "ავტომატური გადამოწმება" is disabled with "მალე"; the manual checkbox is saved and the backend records who/when.

### "შემდეგი →"

6. **Validation.** Missing first/last name, birth date, phone, a personal ID that isn't 11 digits, or a malformed email → "სავალდებულო ველი" / message under the field; no request.
7. **Existing client, unchanged.** Goes to step 2 without a request.
8. **Existing client, edited.** `PUT /api/clients/:id` (marital status, family members included), then step 2. A 424 shows under the field and in the banner.
9. **New client.** `POST /api/clients`, then step 2; going back and forward again doesn't create a second client.

## 7. New application wizard, step 2, saving and editing

Files: `income-card.tsx`, `income-panels.tsx`, `lease-items.tsx`, `loan-card.tsx`, `guarantor-card.tsx`, `vehicle-card.tsx`, `appraisal-card.tsx`, `wizard-summary.tsx`, `wizard-payload.ts`, `wizard-validation.ts`, `app/dashboard/applications/[id]/edit/page.tsx`.

### Fields

10. **Income type.** დასაქმებული / მეწარმე / იჯარა switch their panels; lease rows can be added (max 20) and removed; "დამატებითი შემოსავალი" shows its fields; the debtor-registry check is "მალე".
11. **Vehicle.** Makes, models, fuels and transmissions load from the vehicle-options proxy; the model select is disabled until a make is chosen and lists only that make's models; changing the make clears the model.
12. **Display values.** Down-payment share "x.x% წილი"; LTV in the appraisal card and the summary (requested / market value); over the max LTV → red value and warning, saving is not blocked. Monthly payment is "— მალე".
13. **Stepper.** Step 1 shows ✓ on step 2; "← წინა ნაბიჯი" returns to step 1 with the values kept.

### Saving

14. **"მონახაზად შენახვა".** Works with any subset of step 2 (only the client is required) → detail page, status "მონახაზი", the income card shows what was typed.
15. **"გაგზავნა რისკებში", incomplete.** Banner "შეავსეთ მონიშნული ველები…" and "სავალდებულო ველი" on amount, term, rate, payment day, make, model, year, fuel, transmission and market value; no request.
16. **"გაგზავნა რისკებში", complete.** Saves, submits → detail page with "გაგზავნილია რისკებში".
17. **Backend errors.** A 424 (e.g. engine 13.5, payment day 32) appears under the field (`income.*` keys under the income fields, lease errors under the list) with the backend's Georgian message.
18. **Numbers.** "24,500" is accepted (commas and spaces stripped); empty fields are sent as `null`.

### Editing `/dashboard/applications/:id/edit`

19. **Entry.** "რედაქტირება" on the detail page appears only for the officer's own Draft or Returned application.
20. **Prefill.** Every field, the income snapshot and the client are filled; amounts that are 0 show empty; the personal ID is locked and there's no "სხვა კლიენტი".
21. **Not editable.** A submitted/decided application, another officer's (404) or a non-officer → an explanation card with "უკან", no form.
22. **Save.** Changes → PUT → detail page; history gains "რედაქტირებულია" (not when nothing changed). A Returned application can be fixed and sent to risks again.
23. **Layout.** 1440: cards + sticky summary; 375: one column, summary and buttons at the end, no sideways scroll; both themes readable (tokens only).

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
   **Known issue:** the new-application form still uses light-only colors such as `bg-white`, `text-slate-800` and `bg-*-100`.
5. **Native controls.** Date pickers and checkboxes follow the theme (`color-scheme: dark` on `.dark`).

### Responsive layout

6. **320–375 px.** No page scrolls sideways.
   **Known issue:** the new-application form's sticky footer uses `-mx-6` against the shell's `px-4` and causes horizontal scroll.
7. **375 px.** The users table, which has 7 columns that don't wrap, scrolls inside its own container, not the whole page. The application detail page is a single column.
8. **1024 px with the sidebar expanded.** The users filter row (fixed `220px` columns) and the 5-column lease grid fit without overflow.
9. **Long Georgian text.** Long module names fit in the `w-64` sidebar, and long card titles aren't clipped by `leading-none`.
10. **Tap targets.** Interactive elements are at least `h-10`.
    **Known issue:** users row actions are `h-7`, pagination controls are `h-9`, and some icon buttons are `h-8`.
11. **Toast on mobile.** The success toast doesn't cover the form's sticky footer buttons.
12. **Delete-user dialog.** The confirm button text uses `text-destructive-foreground`, which isn't defined. This only matters once delete is enabled.
