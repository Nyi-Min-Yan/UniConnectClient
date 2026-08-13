# UniConnect Client — Project Documentation

## Table of Contents

1. [Technology Stack](#1-technology-stack)
2. [Architecture Overview](#2-architecture-overview)
3. [Complete File Tree](#3-complete-file-tree)
4. [Role System & Route Protection](#4-role-system--route-protection)
5. [Authentication Flow](#5-authentication-flow)
6. [API Communication Layer](#6-api-communication-layer)
7. [Data Flow Patterns](#7-data-flow-patterns)
8. [Component Hierarchy](#8-component-hierarchy)
9. [Page Inventory by Role](#9-page-inventory-by-role)
10. [Backend Endpoint Reference](#10-backend-endpoint-reference)
11. [Known Issues & Technical Debt](#11-known-issues--technical-debt)

---

## 1. Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Framework | Next.js (App Router) | 16.2.10 | Server-side rendering, file-based routing, API middleware |
| UI Library | React | 19.2.4 | Component model |
| Language | TypeScript | ^5 | Type safety |
| Styling | Tailwind CSS | ^4 | Utility-first CSS |
| Component Library | daisyUI | 5.7.0 | Pre-built Tailwind components (modals, themes, dialogs) |
| Data Fetching | SWR | 2.4.2 | Caching, revalidation, stale-while-revalidate |
| HTTP Client | Axios | 1.18.1 | Request/response interceptors, token management |
| Toasts | sonner | 2.0.7 | Toast notifications |
| Excel | xlsx | 0.18.5 | Roll-call import/export |
| Backend | Spring Boot API | — | REST API at `https://uniconnectserver-production.up.railway.app` |

---

## 2. Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                      Browser (Client-Side)                       │
│                                                                  │
│  ┌────────────┐  ┌───────────┐  ┌────────────┐  ┌───────────┐  │
│  │ Next.js    │  │ Pages     │  │ Components │  │ SWR Hooks │  │
│  │ Middleware │  │ (App Dir) │  │ (UI/Feature)│  │ (useAuth) │  │
│  │ (proxy.ts) │  │           │  │            │  │           │  │
│  └─────┬──────┘  └─────┬─────┘  └──────┬─────┘  └─────┬─────┘  │
│        │               │               │              │        │
│        │         ┌─────┴───────────────┴──────────────┘        │
│        │         │           Axios (apiClient)                  │
│        │         │  ┌──────────────────────────────────┐       │
│        │         │  │  Request Interceptor: add Bearer │       │
│        │         │  │  Response Interceptor: refresh   │       │
│        │         │  │  on 401, queue failed requests   │       │
│        │         │  └──────────────────────────────────┘       │
│        │         │                                              │
│        │         └──────────────────┬───────────────────────────│
│        │                            │                           │
│        │                    ┌───────┴────────┐                  │
│        │                    │  Raw fetch()   │                  │
│        │                    │  (login page)  │                  │
│        │                    └───────┬────────┘                  │
│        │                            │                           │
│        └────────────────────────────┼───────────────────────────│
│                                     │                           │
└─────────────────────────────────────┼───────────────────────────┘
                                      │
                    HTTPS (CORS allowed: localhost:3000)
                                      │
┌─────────────────────────────────────┼───────────────────────────┐
│                      Spring Boot Backend (Railway)              │
│                                     │                           │
│  ┌──────────────────────────────────┴──────────────────────┐   │
│  │  Controllers: Auth, User, Department, Admin, Academic,  │   │
│  │  Attendance, Health, Setup                              │   │
│  └──────────────────────────────────┬──────────────────────┘   │
│                                     │                           │
│  ┌──────────────────────────────────┴──────────────────────┐   │
│  │  RMI Layer → PostgreSQL (Neon)                         │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

- **No global state library** — No Redux or Zustand. SWR cache + local React state + in-memory arrays cover all needs.
- **Two auth token stores** — Tokens saved in both `localStorage` (for client JS) and cookies (for middleware access without JS).
- **Copy-pasted role pages** — Each role's pages are identical duplicates of each other, not shared components.
- **Mixed data sources** — Some features use real API calls (auth, departments, users), others use in-memory mock data (staff, students, lecturers CRUD, feed, chat, notifications).

---

## 3. Complete File Tree

```
src/
├── proxy.ts                          # Next.js Edge Middleware — auth guard, role-based redirect
│
├── app/
│   ├── layout.tsx                    # Root layout — ThemeProvider + AppProviders (SWR + Toaster)
│   ├── page.tsx                      # Splash page — animated logo, redirects to /login after 3s
│   ├── providers.tsx                 # SWRConfig (global fetcher) + Toaster (sonner)
│   ├── globals.css                   # Tailwind v4 + daisyUI themes + custom animations
│   ├── login/
│   │   └── page.tsx                  # Login form — raw fetch to POST /api/auth/login
│   │
│   ├── admin/                        # Admin portal (15 pages)
│   │   ├── layout.tsx                # Navigation role="admin"
│   │   ├── feed/page.tsx
│   │   ├── chat/page.tsx
│   │   ├── explore/page.tsx
│   │   ├── inbox/page.tsx
│   │   ├── notifications/page.tsx
│   │   ├── profile/page.tsx
│   │   ├── profile/edit/page.tsx
│   │   ├── settings/page.tsx
│   │   ├── roll-call/page.tsx
│   │   ├── timetable/page.tsx
│   │   ├── exam-results/page.tsx
│   │   ├── staff/page.tsx
│   │   ├── students/page.tsx
│   │   └── lecturers/page.tsx
│   │
│   ├── teachers/                     # Teacher portal (11 pages)
│   │   ├── layout.tsx
│   │   ├── feed/chat/explore/inbox/notifications/profile/profile~edit/settings/
│   │   ├── roll-call/page.tsx
│   │   └── timetable/page.tsx
│   │
│   ├── students/                     # Student portal (9 pages — no unique pages)
│   │   └── (feed/chat/explore/inbox/notifications/profile/profile~edit/settings)
│   │
│   ├── manage/                       # Staff Admin portal (11 pages)
│   │   ├── (feed/chat/explore/inbox/notifications/profile/profile~edit/settings)
│   │   ├── lecture-manage/page.tsx
│   │   └── manage-staff/page.tsx
│   │
│   ├── student-affire/               # Student Affairs portal (11 pages)
│   │   ├── (feed/chat/explore/inbox/notifications/profile/profile~edit/settings)
│   │   ├── student-manage/page.tsx
│   │   └── manage-student-affire/page.tsx
│   │
│   └── finance/                      # Finance portal (10 pages)
│       ├── (feed/chat/explore/inbox/notifications/profile/profile~edit/settings)
│       └── manage-finance-staff/page.tsx
│
├── components/
│   ├── layout/
│   │   └── Navigation.tsx            # Responsive sidebar + top bar + mobile nav (role-aware)
│   ├── ui/
│   │   ├── BackButton.tsx            # Mobile back navigation button
│   │   ├── ConfirmModal.tsx          # Confirmation dialog (native <dialog>)
│   │   ├── ModalPortal.tsx           # Generic modal overlay using <dialog>
│   │   ├── ProfileDropdown.tsx       # Avatar dropdown (profile/settings/logout)
│   │   ├── ReactionButton.tsx        # Emoji reaction picker (7 types)
│   │   ├── ThemeProvider.tsx         # Light/dark/system theme context + hook
│   │   └── Toast.tsx                 # Auto-dismissing toast notification
│   └── features/
│       ├── feed/components/
│       │   └── ShareModal.tsx        # Share-post-to-user modal
│       └── inbox/
│           ├── types.ts              # Email + Folder type definitions
│           ├── InboxPage.tsx         # Full 3-column inbox UI
│           ├── EmailViewer.tsx       # Email detail view
│           └── ComposeModal.tsx      # Email compose/reply/forward modal
│
├── hooks/
│   ├── useAuth.ts                    # SWR: me, login, logout
│   ├── useUsers.ts                   # SWR: list, role-filter
│   ├── useDepartments.ts             # SWR: CRUD departments
│   └── useAcademic.ts                # SWR: grades, attendance
│
├── lib/
│   ├── axios.ts                      # Axios instance + interceptors (token, refresh)
│   └── api/
│       └── staff.ts                  # createStaff() — API call + local fallback
│
├── data/
│   ├── courses.ts                    # Static curriculum (4 years × 2 semesters)
│   ├── departments.ts                # Static constants: majors, depts, sections
│   ├── mock-data.ts                  # Mock Student/Staff types, generateStudents()
│   ├── store.ts                      # Mutable in-memory arrays + CRUD functions
│   └── users.ts                      # Mock teacher data + helpers
│
├── types/
│   └── index.ts                      # BackendRole, AuthUser, LoginResponse, ApiResponse
│
└── utils/
    ├── cn.ts                         # className helper
    ├── moderate.ts                   # AI content moderation helpers
    ├── rollcall.ts                   # Attendance calculation engine
    └── timetable.ts                  # Timetable generation algorithm
```

---

## 4. Role System & Route Protection

### 4.1 Backend Roles (Spring Boot)

The backend uses **uppercase** role values in JWTs:

| JWT Role | Portal Path | Description |
|----------|------------|-------------|
| `STUDENT` | `/students/*` | Students |
| `TEACHER` | `/teachers/*` | Lecturers / Teachers |
| `MANAGE` | `/manage/*` | Admin / Management staff |
| `STUDENT_AFFAIRS` | `/student-affire/*` | Student Affairs staff |
| `FINANCE_ACCOUNTANT` | `/finance/*` | Finance staff |
| `RECTOR` | `/admin/*` | Rector |
| `PRO_RECTOR` | `/admin/*` | Pro-Rector |
| `SYSTEM_ADMIN` | `/admin/*` | System Admin |
| `STUDENT_AFFAIRS_ADMIN` | `/student-affire/*` | SA Admin |
| `RECTOR_PRO_RECTOR` | `/admin/*` | Rector/Pro-Rector |

### 4.2 Route Protection (`src/proxy.ts`)

The file `src/proxy.ts` is Next.js Edge Middleware that runs on every request. It:

1. **Skips public paths**: `/login`, `/_next`, `/api`, `/favicon`
2. **Reads cookie**: Extracts `access_token` from request cookies
3. **Decodes JWT**: Base64-decode the payload (no signature verification — reads claims only)
4. **Extracts role**: Reads `payload.role`
5. **Maps role to path**: `ROLE_PATH_MAP[role]` → e.g., `STUDENT` → `students`
6. **Validates access**: `PATH_ROLE_MAP[pathSegment]` must include the user's role
7. **Redirects unauthorized**: If role doesn't match the current path, redirects to the correct feed page or `/login`

```typescript
// /login → PUBLIC_PATHS → allow (NextResponse.next())
// /students/feed → PATH_ROLE_MAP["students"] = ["STUDENT"]
//   → JWT has role "STUDENT" → allowed
//   → JWT has role "TEACHER" → redirect to ROLE_PATH_MAP["TEACHER"] = "/teachers/feed"
```

### 4.3 Role Permissions by Portal

| Portal | Roles Allowed |
|--------|---------------|
| `/admin/*` | `RECTOR`, `PRO_RECTOR`, `SYSTEM_ADMIN`, `RECTOR_PRO_RECTOR` |
| `/teachers/*` | `TEACHER` |
| `/students/*` | `STUDENT` |
| `/manage/*` | `MANAGE`, `SYSTEM_ADMIN` |
| `/student-affire/*` | `STUDENT_AFFAIRS`, `STUDENT_AFFAIRS_ADMIN` |
| `/finance/*` | `FINANCE_ACCOUNTANT` |

---

## 5. Authentication Flow

### 5.1 Login (End-to-End)

```
User submits form
        │
        ▼
src/app/login/page.tsx
  ┌─────────────────────────────────────────────┐
  │ handleLogin()                                │
  │   → fetch(`${API_URL}/api/auth/login`, {     │
  │       method: "POST",                        │
  │       body: { email, password }              │
  │     })                                       │
  │                                              │
  │  On success:                                 │
  │   → localStorage.setItem("access_token")     │
  │   → localStorage.setItem("refresh_token")    │
  │   → document.cookie = "access_token=..."     │
  │   → document.cookie = "refresh_token=..."    │
  │   → Decode JWT payload → extract role        │
  │   → roleRoute[role] → target path            │
  │   → toast.success("Login successful")        │
  │   → window.location.href = target            │
  │                                              │
  │  On error:                                    │
  │   → toast.error(errorMessage)                │
  └─────────────────────────────────────────────┘
        │
        ▼  (hard redirect to /{role}/feed)
Next.js Middleware (proxy.ts)
  ┌─────────────────────────────────────────────┐
  │  Reads access_token cookie                   │
  │  Decodes JWT payload                         │
  │  Checks role vs path                         │
  │  If allowed → NextResponse.next()            │
  │  If denied → redirect to correct feed        │
  │  If no token → redirect to /login            │
  └─────────────────────────────────────────────┘
        │
        ▼
Role Layout (e.g., src/app/admin/layout.tsx)
  ┌─────────────────────────────────────────────┐
  │  <Navigation role="admin" />                 │
  │  <main>{children}</main>                     │
  └─────────────────────────────────────────────┘
        │
        ▼
Target Page (e.g., /admin/feed)
```

### 5.2 Token Refresh (Automatic)

The Axios response interceptor in `src/lib/axios.ts` handles 401 errors:

```
API returns 401
        │
        ▼
Axios Response Interceptor
  ┌─────────────────────────────────────────────┐
  │  Check: is this a refresh attempt?           │
  │  If no:                                      │
  │    → Set _retry = true                       │
  │    → Queue concurrent failed requests        │
  │    → POST /api/auth/refresh                  │
  │      With: { refreshToken }                  │
  │    → If success:                             │
  │      → Store new access_token + refresh_token │
  │      → Retry all queued requests              │
  │      → Retry original request                 │
  │    → If failure:                             │
  │      → Clear localStorage                    │
  │      → Redirect to /login                    │
  └─────────────────────────────────────────────┘
```

### 5.3 Logout

ProfileDropdown's Sign Out button clears `localStorage` and redirects to `/login`. The `useAuth` hook's `logout()` additionally calls `POST /api/auth/logout` to revoke refresh tokens server-side.

---

## 6. API Communication Layer

### 6.1 Axios Client (`src/lib/axios.ts`)

**What it controls**: All SWR data fetching and any manual `apiClient` calls.

```typescript
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://uniconnectserver-production.up.railway.app',
  headers: { 'Content-Type': 'application/json' },
});
```

**Request Interceptor** (lines 16-24):
- Reads `access_token` from `localStorage`
- Attaches `Authorization: Bearer {token}` header to every request

**Response Interceptor** (lines 40-97):
- On 401: queues concurrent failed requests, attempts token refresh
- On refresh success: retries original + queued requests with new token
- On refresh failure: clears storage, redirects to `/login`

### 6.2 Direct `fetch()` Calls

Some pages bypass Axios and use raw `fetch()`:

| File | Endpoint | Reason |
|------|----------|--------|
| `login/page.tsx` | `POST /api/auth/login` | Must work before Axios is configured |
| `utils/moderate.ts` | `POST /api/ai/moderate-*` | Independent moderation calls |

### 6.3 Backend Endpoints Called by Frontend

| Endpoint | Method | Called From | Auth | Description |
|----------|--------|------------|------|-------------|
| `/api/auth/login` | POST | `login/page.tsx` (fetch) | No | Login, returns JWT |
| `/api/auth/refresh` | POST | `lib/axios.ts` interceptor | No | Rotate refresh token |
| `/api/auth/logout` | POST | `hooks/useAuth.ts` | Yes | Revoke refresh tokens |
| `/api/auth/change-password` | POST | Not yet used | Yes | Change password |
| `/api/auth/me` | GET | `hooks/useAuth.ts` | Yes | Get current user (may 404 — no such endpoint in spec) |
| `/api/admin/users/create` | POST | `lib/api/staff.ts` | Yes (MANAGE) | Create user account |
| `/api/users` | GET | `hooks/useUsers.ts` | Yes | List all users |
| `/api/users/role/{role}` | GET | `hooks/useUsers.ts` | Yes | Users by role |
| `/api/users/{id}` | GET | Not yet used | Yes | Single user detail |
| `/api/departments` | GET/POST | `hooks/useDepartments.ts` | Yes | Department CRUD |
| `/api/departments/{id}` | GET/PUT/DELETE | `hooks/useDepartments.ts` | Yes | Single department CRUD |
| `/api/academic/grades/{studentId}` | GET | `hooks/useAcademic.ts` | Yes | Student grades |
| `/api/attendance/{studentId}` | GET | `hooks/useAcademic.ts` | Yes | Student attendance |
| `/api/attendance/below75` | GET | `hooks/useAcademic.ts` | Yes | Students below threshold |
| `/api/setup/admin` | POST | Not yet used | No | Bootstrap first admin |

### 6.4 SWR Hooks (`src/hooks/`)

Each hook follows the pattern:

```
hook function → useSWR(endpoint, fetcher) → { data, error, isLoading, mutate }
                    │
                    ▼
            providers.tsx: fetcher = (url) => apiClient.get(url).then(r => r.data)
                    │
                    ▼
            lib/axios.ts: apiClient.get(url) → Request Interceptor → Backend → Response Interceptor
```

| Hook | Endpoints | Returns |
|------|-----------|---------|
| `useAuth()` | `GET /api/auth/me` | `{ user, isLoading, isAuthenticated, login, logout }` |
| `useUsers()` | `GET /api/users` | `{ data, error, isLoading }` |
| `useUsersByRole(role)` | `GET /api/users/role/{role}` | `{ data, error, isLoading }` |
| `useDepartments()` | `GET /api/departments` | `{ data, error, isLoading, create, update, delete }` |
| `useStudentGrades(studentId)` | `GET /api/academic/grades/{studentId}` | `{ data, error, isLoading }` |
| `useAttendance(studentId)` | `GET /api/attendance/{studentId}` | `{ data, error, isLoading }` |
| `useLowAttendanceStudents()` | `GET /api/attendance/below75` | `{ data, error, isLoading }` |

---

## 7. Data Flow Patterns

### 7.1 Pattern A: SWR + Axios (Real API)

Used for: auth, users, departments, academic, attendance

```
Page Component
  ↓ imports
SWR Hook (src/hooks/)
  ↓ calls
useSWR(endpoint)
  ↓ uses
Global Fetcher (providers.tsx)
  ↓ calls
apiClient.get(url) (lib/axios.ts)
  ↓ attaches Bearer token + handles 401
Backend API (Railway)
  ↓ returns
JSON Response → Hook returns { data, error, isLoading }
```

### 7.2 Pattern B: Raw `fetch()` (Direct API)

Used for: login, content moderation

```
Page/Util Component
  ↓
fetch(`${API_URL}/path`, { method, headers, body })
  ↓
Backend API (Railway)
  ↓ returns
Manual JSON parse → Handle response directly
```

### 7.3 Pattern C: Local API Helper + Local Store

Used for: staff creation

```
Page Component
  ↓
lib/api/staff.ts → createStaff()
  ├── apiClient.post('/api/admin/users/create', payload)  → tries backend
  ├── addStaff(input)                                      → always adds to local store
  └── returns { success, data/error, local }
```

### 7.4 Pattern D: In-Memory Store Only (No API)

Used for: staff/student/lecturer listing, courses, timetables, roll-call, feed, chat, explore, notifications, profile, settings

```
Page Component
  ↓ imports
data/store.ts or data/*.ts
  ↓
getStaff() / getStudents() / getLecturers()
  ↓ returns
In-memory JavaScript array (resets on page refresh)
```

---

## 8. Component Hierarchy

```
RootLayout (src/app/layout.tsx)
  ├── ThemeProvider (components/ui/ThemeProvider.tsx)
  │   └── AppProviders (src/app/providers.tsx)
  │       ├── SWRConfig (global fetcher)
  │       ├── Toaster (sonner toast container)
  │       └── {children}
  │
  ├── Login Page (login/page.tsx)
  │   └── Form → fetch() → redirect
  │
  ├── Admin Layout (admin/layout.tsx)
  │   └── Navigation (role="admin")
  │   └── <main> → Page content
  │
  ├── Teachers Layout (teachers/layout.tsx)
  │   └── Navigation (role="teachers")
  │   └── <main> → Page content
  │
  ├── Students Layout (students/layout.tsx)
  │   └── ...
  │
  ├── Manage Layout (manage/layout.tsx)
  │   └── ...
  │
  ├── Student Affairs Layout (student-affire/layout.tsx)
  │   └── ...
  │
  └── Finance Layout (finance/layout.tsx)
      └── ...
```

### Navigation Component (`components/layout/Navigation.tsx`)

**Controls**: The sidebar, top bar, and mobile navigation for all roles.

```
Navigation (role prop)
  ├── Desktop sidebar (w-64, fixed left)
  │   ├── Logo + branding
  │   └── Sectioned nav links (varies by role)
  │       ├── Social section: Feed, Explore, Chat, Inbox, Notifications
  │       ├── Academic section: Roll Call, Timetable (teachers/admin only)
  │       └── People section: Students, Lecturers, Staff (admin/manage/... only)
  ├── Desktop top bar
  │   ├── Search input
  │   ├── Notification bell
  │   └── ProfileDropdown
  └── Mobile bottom nav (4 fixed tabs + "More" drawer)
```

The `sectionsByRole` object in Navigation.tsx defines which links appear for each role. Currently **broken**: admin links point to `/admin/student-manage`, `/admin/lecturer-manage`, `/admin/staff-manage` but actual files are at `/admin/students`, `/admin/lecturers`, `/admin/staff`.

---

## 9. Page Inventory by Role

### admin (15 pages)
| Route | File | Uses API? | Description |
|-------|------|-----------|-------------|
| `/admin/feed` | `feed/page.tsx` | No (mock) | Social feed with moderation scanner |
| `/admin/chat` | `chat/page.tsx` | No (mock) | Contact list + message UI |
| `/admin/explore` | `explore/page.tsx` | No (mock) | Campus discovery tabs |
| `/admin/inbox` | `inbox/page.tsx` | No (mock) | Email inbox (reuses InboxPage) |
| `/admin/notifications` | `notifications/page.tsx` | No (mock) | Notification list |
| `/admin/profile` | `profile/page.tsx` | No (mock) | Profile with cover, tabs |
| `/admin/profile/edit` | `profile/edit/page.tsx` | No (mock) | Edit profile form |
| `/admin/settings` | `settings/page.tsx` | No (mock) | Privacy, notifications, theme |
| `/admin/roll-call` | `roll-call/page.tsx` | No (mock) | Attendance management |
| `/admin/timetable` | `timetable/page.tsx` | No (mock) | Schedule generator |
| `/admin/exam-results` | `exam-results/page.tsx` | No (mock) | PDF upload + matching |
| `/admin/staff` | `staff/page.tsx` | **Partial** (createStaff → API + local) | Staff CRUD |
| `/admin/students` | `students/page.tsx` | No (store.ts) | Student management |
| `/admin/lecturers` | `lecturers/page.tsx` | No (store.ts) | Lecturer management |

### teachers (11 pages — 2 unique)
| Route | Unique? | Description |
|-------|---------|-------------|
| `/teachers/feed` | No | Same as admin/feed |
| `/teachers/chat` | No | Same as admin/chat |
| `/teachers/explore` | No | Same as admin/explore |
| `/teachers/inbox` | No | Reuses InboxPage |
| `/teachers/notifications` | No | Same as admin/notifications |
| `/teachers/profile` | No | Same as admin/profile |
| `/teachers/profile/edit` | No | Same as admin/profile/edit |
| `/teachers/settings` | No | Same as admin/settings |
| `/teachers/roll-call` | **Yes** | Same as admin/roll-call |
| `/teachers/timetable` | **Yes** | Same as admin/timetable |

### students (9 pages — 0 unique)
All pages are duplicates of the admin versions (feed, chat, explore, inbox, notifications, profile, profile/edit, settings).

### manage (11 pages — 2 unique)
| Route | Unique? | Description |
|-------|---------|-------------|
| `/manage/lecture-manage` | **Yes** | Same as admin/lecturers |
| `/manage/manage-staff` | **Yes** | Same as admin/staff |
| Others | No | Same as admin versions |

### student-affire (11 pages — 2 unique)
| Route | Unique? | Description |
|-------|---------|-------------|
| `/student-affire/student-manage` | **Yes** | Same as admin/students |
| `/student-affire/manage-student-affire` | **Yes** | Same as admin/staff |
| Others | No | Same as admin versions |

### finance (10 pages — 1 unique)
| Route | Unique? | Description |
|-------|---------|-------------|
| `/finance/manage-finance-staff` | **Yes** | Same as admin/staff |
| Others | No | Same as admin versions |

---

## 10. Backend Endpoint Reference

### 10.1 Public Endpoints

| Method | Path | Frontend Caller | Request Body | Response |
|--------|------|----------------|-------------|----------|
| `GET` | `/api/health` | Not used | — | Health status |
| `POST` | `/api/setup/admin` | Not used | `SetupAdminRequest` | Created admin |
| `POST` | `/api/auth/login` | `login/page.tsx` | `{ email, password }` | `AuthResponse` (see below) |
| `POST` | `/api/auth/refresh` | `lib/axios.ts` interceptor | `{ refreshToken }` | `{ accessToken, refreshToken }` |

### 10.2 Authenticated Endpoints (Any Role)

| Method | Path | Frontend Caller | Notes |
|--------|------|----------------|-------|
| `POST` | `/api/auth/change-password` | Not yet used | |
| `POST` | `/api/auth/logout` | `hooks/useAuth.ts` | Revokes all refresh tokens |

### 10.3 Admin Endpoints (MANAGE Role)

| Method | Path | Frontend Caller | Body |
|--------|------|----------------|------|
| `POST` | `/api/admin/users/create` | `lib/api/staff.ts` | `CreateAccountRequest` |

### 10.4 Department Endpoints (Any Auth)

| Method | Path | Frontend Caller |
|--------|------|----------------|
| `GET` | `/api/departments` | `hooks/useDepartments.ts` |
| `GET` | `/api/departments/{id}` | Not used |
| `POST` | `/api/departments` | `hooks/useDepartments.ts` |
| `PUT` | `/api/departments/{id}` | Not used |
| `DELETE` | `/api/departments/{id}` | Not used |

### 10.5 User Endpoints (Any Auth)

| Method | Path | Frontend Caller |
|--------|------|----------------|
| `GET` | `/api/users` | `hooks/useUsers.ts` |
| `GET` | `/api/users/{id}` | Not used |
| `GET` | `/api/users/role/{role}` | `hooks/useUsers.ts` |
| `GET` | `/api/users/role/{role}/details` | Not used |
| `GET` | `/api/users/department/{id}` | Not used |
| `GET` | `/api/users/department/{id}/details` | Not used |

### 10.6 RMI-Based Endpoints (Academic & Attendance)

| Method | Path | Frontend Caller |
|--------|------|----------------|
| `GET` | `/api/academic/grades/{studentId}` | `hooks/useAcademic.ts` |
| `GET` | `/api/academic/grades/{studentId}/{academicYear}` | Not used |
| `GET` | `/api/attendance/{studentId}` | `hooks/useAcademic.ts` |
| `GET` | `/api/attendance/calculate/{studentId}/{subjectCode}` | Not used |
| `GET` | `/api/attendance/below75` | `hooks/useAcademic.ts` |

### 10.7 Response Formats

**LoginResponse (200)**:
```json
{
  "accessToken": "eyJhbGciOi...",
  "tokenType": "Bearer",
  "expiresIn": 900,
  "userId": 1,
  "email": "admin@university.edu",
  "fullName": "Super Admin",
  "role": "MANAGE",
  "mustChangePassword": true
}
```

**ApiResponse (Generic)**:
```json
{
  "success": true,
  "message": "Operation completed",
  "data": null
}
```

**Error Response**:
```json
{
  "success": false,
  "message": "Error description",
  "data": null
}
```

**HTTP Status Codes**:
| Code | Meaning |
|------|---------|
| 400 | Validation error, bad request |
| 401 | Invalid credentials, expired/missing JWT |
| 403 | Account disabled, insufficient role |
| 409 | Duplicate email |
| 423 | Account locked (5+ failed attempts) |
| 500 | Internal server error |

---

## 11. Known Issues & Technical Debt

### 11.1 Navigation Links Broken for Admin

**File**: `src/components/layout/Navigation.tsx`

Admin nav links point to:
- `/admin/student-manage` → should be `/admin/students`
- `/admin/lecturer-manage` → should be `/admin/lecturers`
- `/admin/staff-manage` → should be `/admin/staff`

These will produce 404 errors when clicked.

### 11.2 Massive Duplicated Page Copies

Social pages (feed, chat, explore, notifications, profile, settings) are exact copy-paste duplicates across all 6 roles. The feed page alone is ~1341 lines × 6 copies. Changes to one must be manually replicated to all others.

### 11.3 `GET /api/auth/me` May Not Exist

The `useAuth` SWR hook (`src/hooks/useAuth.ts`) calls `GET /api/auth/me`, but the Spring Boot specification does not include this endpoint. This call will likely return a 404, causing `user` to remain `undefined`.

### 11.4 In-Memory Store Loses Data on Refresh

Staff, student, and lecturer CRUD pages store data in `src/data/store.ts` mutable arrays. These reset on page refresh. Only `createStaff()` attempts a real API call (with local fallback), but listing still reads from memory.

### 11.5 Inconsistent Naming Convention

- Admin uses plural: `/admin/students`, `/admin/lecturers`, `/admin/staff`
- Other roles use `{role}-manage`: `/manage/manage-staff`, `/student-affire/student-manage`
- Navigation.tsx uses `{role}-manage` pattern for admin too, causing the broken links

### 11.6 Login Page Uses Raw `fetch()` Instead of Axios

The login page uses `window.fetch()` directly instead of the `apiClient`. This means it doesn't get the automatic token refresh interceptor — though for login this is intentional (no token yet).

### 11.7 Staff `role` Field Mismatch

Frontend staff pages use lowercase abbreviated roles:
- `admin`, `finance`, `sa`, `itsm`

Backend uses uppercase full roles:
- `MANAGE`, `FINANCE_ACCOUNTANT`, `STUDENT_AFFAIRS`, `SYSTEM_ADMIN`

The mapping is handled in `src/lib/api/staff.ts` `ROLE_MAP` constant.

### 11.8 Logout Doesn't Clear Cookies

`ProfileDropdown.tsx` clears `localStorage` on logout but doesn't clear the `access_token` and `refresh_token` cookies. The middleware may still read stale cookies.
