# UniConnect Client

A Next.js 16 application for university management — role-based portals for students, lecturers, admin, finance, and student affairs staff.

---

## Tech Stack

| Library | Version | Purpose |
|---|---|---|
| **Next.js** | 16.2.10 | Framework (App Router, Turbopack) |
| **React** | 19.2.4 | UI library |
| **TypeScript** | ^5 | Type checking |
| **Tailwind CSS** | ^4 | Utility-first CSS |
| **daisyUI** | ^5.7.0 | Tailwind component library (themes, modals) |
| **SWR** | ^2.4.2 | Data fetching, caching, revalidation |
| **Axios** | ^1.18.1 | HTTP client with interceptors |
| **xlsx** | ^0.18.5 | Excel file parsing (roll-call imports) |

---

## Folder Structure

```
src/
├── proxy.ts                          # Auth guard / role-based redirect (Next.js proxy)
├── app/
│   ├── layout.tsx                    # Root layout — ThemeProvider + AppProviders
│   ├── page.tsx                      # Splash page → redirects to /login
│   ├── providers.tsx                 # SWRConfig with default fetcher
│   ├── globals.css                   # Tailwind, DaisyUI themes, custom animations
│   ├── login/page.tsx                # Login form (email/password → backend → role-redirect)
│   ├── api/
│   │   └── proxy/[...path]/route.ts  # Catch-all API proxy route
│   ├── teachers/                     # Lecturer portal
│   │   ├── layout.tsx                #  Navigation + sidebar offset
│   │   ├── feed/
│   │   ├── explore/
│   │   ├── chat/
│   │   ├── inbox/
│   │   ├── notifications/
│   │   ├── profile/
│   │   ├── profile/edit/
│   │   ├── settings/
│   │   ├── roll-call/                # Attendance marking (lecturer-only)
│   │   └── timetable/                # Schedule view (lecturer-only)
│   ├── students/                     # Student portal (feed, explore, chat, inbox, ...)
│   ├── admin/                        # Admin portal (+ exam-results, student/lecturer/staff-manage, roll-call, timetable)
│   ├── manage/                       # Staff Admin portal (+ lecture-manage, manage-staff)
│   ├── student-affire/               # Student Affairs portal (+ student-manage, manage-student-affire)
│   └── finance/                      # Finance portal (+ manage-finance-staff)
│
├── components/
│   ├── layout/
│   │   └── Navigation.tsx            # Responsive sidebar + top bar + mobile nav
│   ├── ui/
│   │   ├── BackButton.tsx            # Mobile back navigation
│   │   ├── ConfirmModal.tsx          # Confirmation dialog (native <dialog>)
│   │   ├── ModalPortal.tsx           # Generic modal wrapper
│   │   ├── ProfileDropdown.tsx       # Avatar menu (profile/settings/logout)
│   │   ├── ReactionButton.tsx        # Emoji reactions (like/love/haha/...)
│   │   ├── ThemeProvider.tsx         # Light/dark/system theme context
│   │   └── Toast.tsx                # Auto-dismissing notifications
│   └── features/
│       ├── inbox/
│       │   ├── types.ts              # Email & Folder type definitions
│       │   ├── InboxPage.tsx         # 3-column desktop / single-column mobile inbox
│       │   ├── EmailViewer.tsx       # Email detail view
│       │   └── ComposeModal.tsx      # Compose/reply/forward modal
│       └── feed/
│           └── components/
│               └── ShareModal.tsx    # Share post to user
│
├── data/                             # Static typed data and mock stores
│   ├── courses.ts                    # Course catalog (4 years × 2 semesters)
│   ├── departments.ts                # Majors, departments, sections
│   ├── mock-data.ts                  # Mock students, staff, exam results
│   ├── store.ts                      # In-memory CRUD (students, lecturers, staff)
│   └── users.ts                      # Mock teachers + faculty definitions
│
├── hooks/                            # SWR data-fetching hooks
│   ├── useAuth.ts                    # login/logout/me
│   ├── useUsers.ts                   # list / role-filter
│   ├── useDepartments.ts             # CRUD
│   └── useAcademic.ts                # grades, attendance
│
├── lib/
│   ├── axios.ts                      # Axios client + token interceptors + silent refresh
│   └── proxy.ts                      # Server-side API forwarder → backend
│
├── types/
│   └── index.ts                      # Shared types (UserRole, AuthUser, ApiResponse)
│
└── utils/
    ├── cn.ts                         # className joiner
    ├── moderate.ts                   # Content moderation (image/video/text)
    ├── rollcall.ts                   # Attendance calculation engine
    └── timetable.ts                  # Conflict-aware schedule generation
```

---

## Architecture

### Routing

The application uses **Next.js App Router** with file-system routing. Six role-based portals share the same page patterns:

| Role (JWT) | Path Prefix | Portal |
|---|---|---|
| `admin` | `/admin/*` | Admin |
| `student` | `/students/*` | Student |
| `lecturer` | `/teachers/*` | Lecturer |
| `staff` + `staffRole: admin` | `/manage/*` | Staff Admin |
| `staff` + `staffRole: sa` | `/student-affire/*` | Student Affairs |
| `staff` + `staffRole: finance` | `/finance/*` | Finance |

Each portal has its own `layout.tsx` that renders `<Navigation role="..." />` and wraps content with sidebar offset padding.

### Authentication Flow

```
Login (/login)
  │  email + password
  ▼
POST /api/proxy/api/auth/login  ──proxy──►  Railway Backend
  │
  ▼
access_token + refresh_token
  ├── stored in localStorage (for client-side axios)
  └── stored in cookies (for middleware/proxy.ts)
  │
  ▼
Decode JWT → extract role → redirect to /{role-path}/feed
```

**Proxy/Middleware** (`src/proxy.ts`):
- Runs on every request via Next.js Proxy configuration
- Skips public paths (`/login`, `/_next`, `/api`, `/favicon`)
- Reads `access_token` cookie, decodes JWT payload
- Extracts `role` and optional `staffRole` claims
- Maps to allowed path prefixes and redirects unauthorized users to their correct role's feed or `/login`

**Axios Interceptor** (`src/lib/axios.ts`):
- **Request:** Attaches `Bearer {access_token}` from localStorage
- **Response:** On 401 errors, queues concurrent failed requests, attempts a token refresh via `/api/proxy/api/auth/refresh`, retries original requests, or clears tokens and redirects to `/login` on failure

### API Proxy Pattern

All API calls go through a two-layer proxy to avoid CORS and hide the backend URL:

```
Client Component
  │  apiClient.get('/api/users')
  ▼
Next.js Route: /api/proxy/api/users
  │
  ▼
src/lib/proxy.ts → fetch(BACKEND_URL + path, { method, headers, body })
  │
  ▼
Railway Backend (https://uniconnectserver-production.up.railway.app)
```

The `BACKEND_URL` defaults to the Railway production URL and can be overridden via the `BACKEND_URL` environment variable.

### Data Fetching (SWR)

- Global `SWRConfig` in `AppProviders` sets a default fetcher: `(url) => apiClient.get(url).then(r => r.data)`
- Hooks follow a uniform pattern:
  ```ts
  const { data, isLoading, error } = useSWR<Type>(endpoint)
  ```
- Revalidation on focus and retry on error are disabled globally
- Conditional fetching: endpoints are `null` when preconditions (like a token) are missing

### Role System

Five base roles from the backend JWT:
- `student`, `lecturer`, `staff`, `admin`

Staff sub-roles (from the `staffRole` JWT claim):
- `admin` → path `/manage/`
- `sa` (Student Affairs) → path `/student-affire/`
- `finance` → path `/finance/`

The middleware's `PATH_ROLE_MAP` also allows `admin` access to all staff paths.

### UI Architecture

- **Navigation:** Desktop sidebar (64rem wide) with sectioned links + top bar; mobile bottom tab bar (4 items) with a "More" drawer for overflow items
- **Theme:** Light/dark/system toggle persisted to localStorage as `unicconnect-theme`; listens to `prefers-color-scheme`
- **Inbox:** 3-column desktop layout (folder list + message list + email viewer), collapses to single-column on mobile
- **Content Moderation:** Feed posts go through a scanning animation that calls the moderation API in parallel; text and media are checked separately
- **Timetable:** Randomized conflict-aware scheduling algorithm that places lectures/labs across Monday–Friday, 8:00–16:00, checking teacher and room availability

---

## Pages Overview

Every role portal includes these pages (where applicable):

| Page | File | Description |
|---|---|---|
| Feed | `feed/page.tsx` | Social feed — create posts with text/images, comment, react, share, moderate content |
| Explore | `explore/page.tsx` | Campus discovery / browse |
| Chat | `chat/page.tsx` | Messaging (placeholder) |
| Inbox | `inbox/page.tsx` | Email system — compose, reply, forward, star, delete, search |
| Notifications | `notifications/page.tsx` | Notification list |
| Profile | `profile/page.tsx` | User profile view |
| Profile Edit | `profile/edit/page.tsx` | Edit profile form |
| Settings | `settings/page.tsx` | App settings |

Role-specific pages:

| Role | Page | Description |
|---|---|---|
| Teachers | `roll-call/page.tsx` | Attendance marking with Excel upload + live mode |
| Teachers | `timetable/page.tsx` | Schedule viewer |
| Admin | `student-manage/page.tsx` | Student CRUD management |
| Admin | `lecturer-manage/page.tsx` | Lecturer CRUD management |
| Admin | `staff-manage/page.tsx` | Staff CRUD management |
| Admin | `exam-results/page.tsx` | Exam results overview |
| Admin | `roll-call/page.tsx` | Attendance overview |
| Admin | `timetable/page.tsx` | Schedule management |
| Manage | `manage-staff/page.tsx` | Staff management |
| Manage | `lecture-manage/page.tsx` | Lecture management |
| Student Affairs | `student-manage/page.tsx` | Student management |
| Student Affairs | `manage-student-affire/page.tsx` | SA staff management |
| Finance | `manage-finance-staff/page.tsx` | Finance staff management |

---

## Utilities and Algorithms

### `src/utils/rollcall.ts`
Attendance calculation engine:
- **`calcAttendance(present, total)`** — percentage
- **`isHit(pct)`** — true if below 75%
- **`remainingAbsencesBeforeHit(present, total)`** — how many more absences until threshold
- **`recoveryNeeded(present, total)`** — how many consecutive attendances needed to recover
- **`perSubjectHits(records)`** — hit status per subject
- **`warningList(students, threshold = 80)`** — students approaching the threshold

### `src/utils/timetable.ts`
Conflict-aware schedule generation:
- Randomizes course order each generation
- Monday–Friday, 8:00–16:00, 1-hour lecture slots and 2-hour lab slots
- Checks teacher availability (no double-booking)
- Checks room availability (separate pools for lecture rooms and labs)
- Reports teacher overload when a teacher exceeds available slots

### `src/utils/moderate.ts`
Content moderation utilities:
- **`extractVideoFrame(file)`** — extracts a JPEG frame from a video at 30% duration
- **`moderateMedia(base64, type)`** — sends image/video frame for AI moderation
- **`moderateText(text)`** — sends text for AI moderation
- Falls back to `"safe"` on network errors

---

## TypeScript Path Aliases

Defined in `tsconfig.json`:

```json
"@/*": ["./src/*"],
"@ui/*": ["./src/components/ui/*"],
"@features/*": ["./src/components/features/*"],
"@lib/*": ["./src/lib/*"],
"@types/*": ["./src/types/*"]
```

---

## Environment Variables

Required in `.env.local`:

| Variable | Purpose |
|---|---|
| `OPENROUTER_API_KEY` | Base OpenRouter key |
| `VIDEO_MODEL_{1-3}_KEY` | Video model API keys (content moderation) |
| `IMAGE_MODEL_{1-4}_KEY` | Image model API keys (content moderation) |
| `TEXT_MODEL_{1-2}_KEY` | Text model API keys (content moderation) |

---

## Build & Development

```bash
# Install
pnpm install

# Development
pnpm dev

# Build
pnpm build

# Lint
pnpm lint
```

The production build compiles 66 routes with zero TypeScript errors.

---

## Key Design Decisions

1. **No global state library** — SWR cache + local React state + in-memory data store cover all needs
2. **Two-layer proxy** — avoids CORS, keeps backend URL server-side only
3. **JWT in both localStorage and cookies** — localStorage for client-side JS, cookies for middleware access without JS
4. **Role-based route protection** — middleware decodes JWT on every request to enforce access control
5. **Silent token refresh** — axios response interceptor queues failed requests during refresh, retries them after success
6. **Client components** — most pages are `"use client"` due to browser API dependencies (localStorage, effects, event listeners)
