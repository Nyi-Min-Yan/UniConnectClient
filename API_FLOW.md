================================================================================
  UNICONNECT CLIENT — COMPLETE API & ROUTING FLOW DOCUMENTATION
================================================================================

This document explains every routing rule, every API call, every data fetch,
and every file that participates in client-server communication.

================================================================================
TABLE OF CONTENTS
================================================================================

  1.  ROUTING SYSTEM
    1.1  Next.js App Router Structure
    1.2  Role-Based Routing
    1.3  Middleware (proxy.ts) — Route Protection Logic
    1.4  Login → Redirect Flow
  
  2.  API COMMUNICATION LAYERS
    2.1  Layer 1: Axios Client (src/lib/axios.ts)
    2.2  Layer 2: SWR Hooks (src/hooks/)
    2.3  Layer 3: Direct fetch()
    2.4  Layer 4: API Helpers (src/lib/api/)
    2.5  Layer 5: In-Memory Store (src/data/store.ts)
  
  3.  COMPLETE API ENDPOINT REGISTRY
    3.1  Auth Endpoints
    3.2  Department Endpoints
    3.3  User Endpoints
    3.4  Academic Endpoints
    3.5  Attendance Endpoints
    3.6  Admin Endpoints
    3.7  Moderation Endpoints
  
  4.  DATA FLOW DIAGRAMS
    4.1  Login Flow (End-to-End)
    4.2  SWR Data Fetch Flow
    4.3  Token Refresh Flow
    4.4  Staff Creation Flow
    4.5  Moderation Flow
  
  5.  FILE-BY-FILE API CALL MAP
    5.1  Files That Make API Calls
    5.2  Files That Receive API Data
    5.3  Files That Define API Interfaces
  
  6.  ERROR HANDLING
    6.1  HTTP Status Code Handling
    6.2  Network Error Handling
    6.3  Token Expiry Handling
  
  7.  ROUTE SERVICE INDEX
    7.1  SWR Hooks (src/hooks/)
    7.2  API Helpers (src/lib/api/)
    7.3  Utility Services (src/utils/)
    7.4  Data Stores (src/data/)


================================================================================
1. ROUTING SYSTEM
================================================================================

1.1  Next.js App Router Structure
──────────────────────────────────

The application uses Next.js 16 App Router with file-system based routing.
Every folder under src/app/ becomes a URL segment.

  src/app/
    page.tsx           →  /                      (splash page → /login)
    layout.tsx         →  (root layout wrapper)
    providers.tsx       →  (SWRConfig + Toaster)
    login/page.tsx      →  /login                (login form)
    admin/              →  /admin/*               (admin portal)
    teachers/           →  /teachers/*             (teacher portal)
    students/           →  /students/*             (student portal)
    manage/             →  /manage/*               (staff admin portal)
    student-affire/     →  /student-affire/*       (student affairs portal)
    finance/            →  /finance/*              (finance portal)

Each role folder contains:
  layout.tsx           →  renders <Navigation role="..." />
  feed/page.tsx        →  social feed
  chat/page.tsx        →  messaging
  explore/page.tsx     →  campus discovery
  inbox/page.tsx       →  email inbox
  notifications/       →  notification list
  profile/             →  user profile
  profile/edit/        →  edit profile
  settings/            →  app settings

Role-specific unique pages:
  admin:     roll-call/, timetable/, exam-results/, staff/, students/, lecturers/
  teachers:  roll-call/, timetable/
  manage:    lecture-manage/, manage-staff/
  student-affire:  student-manage/, manage-student-affire/
  finance:   manage-finance-staff/


1.2  Role-Based Routing
────────────────────────

Login page maps JWT role to URL path:

  Backend Role (JWT)      →  Frontend Path
  ──────────────────────────────────────────
  STUDENT                 →  /students/feed
  TEACHER                 →  /teachers/feed
  MANAGE                  →  /manage/feed
  STUDENT_AFFAIRS         →  /student-affire/feed
  FINANCE_ACCOUNTANT      →  /finance/feed
  RECTOR                  →  /admin/feed
  PRO_RECTOR              →  /admin/feed
  SYSTEM_ADMIN            →  /admin/feed
  STUDENT_AFFAIRS_ADMIN   →  /student-affire/feed
  RECTOR_PRO_RECTOR       →  /admin/feed

Responsible file:  src/app/login/page.tsx  (lines ~60-73)
  const roleRoute = {
    STUDENT: "/students/feed",
    TEACHER: "/teachers/feed",
    MANAGE: "/manage/feed",
    ...
  };


1.3  Middleware (proxy.ts) — Route Protection Logic
────────────────────────────────────────────────────

File:  src/proxy.ts

This is Next.js Edge Middleware that runs on EVERY request.
It is registered via:
  export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
  };

ALGORITHM (simplified):

  1. IF pathname starts with /login, /_next, /api, /favicon
     → ALLOW (NextResponse.next())
  
  2. IF pathname is exactly "/" or ""
     → REDIRECT to /login
  
  3. Extract first path segment (e.g., "admin" from "/admin/feed")
  
  4. IF segment is NOT in PATH_ROLE_MAP
     → ALLOW (unknown paths pass through)
  
  5. READ "access_token" from request cookies
     IF cookie missing → REDIRECT to /login
  
  6. DECODE JWT payload (base64 decode, no signature verification)
     IF decode fails → REDIRECT to /login (after clearing cookies)
  
  7. EXTRACT role from payload.role
     IF role missing → REDIRECT to /login
  
  8. CHECK if role is in allowedRoles for this path segment
     IF allowed → ALLOW (NextResponse.next())
     IF denied → REDIRECT to correct feed path for that role
  
  9. If role not in ROLE_PATH_MAP → REDIRECT to /login

PATH_ROLE_MAP: defines which roles can access which paths:
  admin:           ["RECTOR","PRO_RECTOR","SYSTEM_ADMIN","RECTOR_PRO_RECTOR"]
  teachers:        ["TEACHER"]
  students:        ["STUDENT"]
  manage:          ["MANAGE","SYSTEM_ADMIN"]
  student-affire:  ["STUDENT_AFFAIRS","STUDENT_AFFAIRS_ADMIN"]
  finance:         ["FINANCE_ACCOUNTANT"]

ROLE_PATH_MAP: defines redirect target for each role:
  STUDENT              →  students
  TEACHER              →  teachers
  MANAGE               →  manage
  STUDENT_AFFAIRS      →  student-affire
  RECTOR/PRO_RECTOR    →  admin
  FINANCE_ACCOUNTANT   →  finance
  SYSTEM_ADMIN         →  admin
  STUDENT_AFFAIRS_ADMIN→  student-affire
  RECTOR_PRO_RECTOR    →  admin


1.4  Login → Redirect Flow
──────────────────────────

  STEP 1: User submits email + password on /login
  
  STEP 2: login/page.tsx handleLogin()
    → fetch(POST /api/auth/login) with { email, password }
  
  STEP 3: Backend validates credentials
    → 401 if wrong email/password
    → 423 if account locked
    → 403 if account disabled
    → 200 with AuthResponse if valid
  
  STEP 4: On 200:
    → Save access_token to localStorage
    → Save refresh_token to localStorage
    → Save access_token to cookie (document.cookie)
    → Save refresh_token to cookie
    → Decode JWT: extract role
    → Map role to path via roleRoute
    → toast.success("Login successful")
    → window.location.href = target  (hard redirect)
  
  STEP 5: Browser navigates to /{role}/feed
  
  STEP 6: Middleware (proxy.ts) intercepts the request
    → Reads access_token cookie
    → Decodes JWT → extracts role
    → Checks path segment against PATH_ROLE_MAP
    → If role allowed → NextResponse.next()
    → If role denied → redirect to correct feed
  
  STEP 7: Role layout renders (e.g., admin/layout.tsx)
    → <Navigation role="admin" />
    → <main>{children}</main>
  
  STEP 8: Target page renders (e.g., admin/feed/page.tsx)


================================================================================
2. API COMMUNICATION LAYERS
================================================================================

The application uses 5 distinct layers for communicating with the backend,
ranging from full API integration to pure in-memory mock data.

2.1  Layer 1: Axios Client (src/lib/axios.ts)
──────────────────────────────────────────────

This is the PRIMARY HTTP client. Most real API calls go through this.

WHAT IT DOES:
  - Creates an axios instance with baseURL from NEXT_PUBLIC_API_URL
  - Request interceptor: reads access_token from localStorage and adds
    Authorization: Bearer header to every request
  - Response interceptor: on 401 error, attempts token refresh via
    POST /api/auth/refresh; queues concurrent failed requests;
    on refresh success, retries all queued requests;
    on refresh failure, clears storage and redirects to /login

EXPORTED:
  export const apiClient — the configured axios instance

FILES THAT USE IT:
  - src/hooks/useAuth.ts
  - src/hooks/useUsers.ts
  - src/hooks/useDepartments.ts
  - src/hooks/useAcademic.ts
  - src/lib/api/staff.ts
  - src/app/providers.tsx  (SWR fetcher uses apiClient.get)

INTERCEPTOR DETAILS:

  Request Interceptor (runs before every request):
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

  Response Interceptor (runs on every response error):
    if (error.response?.status === 401 && !originalRequest._retry) {
      → queue concurrent requests
      → fetch POST /api/auth/refresh with refresh_token
      → on success: store new tokens, retry queued + original request
      → on failure: clear localStorage, redirect to /login
    }


2.2  Layer 2: SWR Hooks (src/hooks/)
─────────────────────────────────────

SWR provides caching, revalidation, and stale-while-revalidate pattern.

GLOBAL FETCHER (defined in src/app/providers.tsx):
  const fetcher = (url: string) => apiClient.get(url).then((res) => res.data);

This means every useSWR call automatically:
  → Calls apiClient.get(url)  (with Bearer token)
  → Returns response.data
  → Caches the result
  → Revalidates when needed

SWR CONFIG (in providers.tsx):
  revalidateOnFocus: false   ← don't refetch on tab focus
  shouldRetryOnError: false  ← don't auto-retry on error

ACTIVE SWR HOOKS:

  Hook                    Endpoint                        SWR Key
  ─────────────────────────────────────────────────────────────────
  useAuth()              GET /api/auth/me                "/api/auth/me"
  useUsers()             GET /api/users                  "/api/users"
  useUsersByRole(r)      GET /api/users/role/{role}      "/api/users/role/{role}"
  useDepartments()       GET /api/departments            "/api/departments"
  useStudentGrades(id)   GET /api/academic/grades/{id}   "/api/academic/grades/{id}"
  useAttendance(id)      GET /api/attendance/{id}        "/api/attendance/{id}"
  useLowAttendance()     GET /api/attendance/below75     "/api/attendance/below75"


2.3  Layer 3: Direct fetch()
─────────────────────────────

Some pages bypass 


 and use raw browser fetch().

Used when:
  - No Bearer token needed (login)
  - Independent calls (moderation)

  File                     Endpoint                  Method
  ─────────────────────────────────────────────────────────
  login/page.tsx          /api/auth/login            POST (raw fetch)
  utils/moderate.ts       /api/ai/moderate-*         POST (raw fetch)

Note: login uses raw fetch because at that point no token exists yet.


2.4  Layer 4: API Helpers (src/lib/api/)
─────────────────────────────────────────

Thin wrappers that combine API calls with local store fallback.

  File                   Exports              Purpose
  ────────────────────────────────────────────────────────
  lib/api/staff.ts       createStaff()        POST /api/admin/users/create
                                                  + local addStaff() fallback
                         getStaffList()       returns getStaff() (local store)

createStaff ALGORITHM:
  1. Map frontend role (admin/finance/sa/itsm) to backend role
     (MANAGE/FINANCE_ACCOUNTANT/STUDENT_AFFAIRS/SYSTEM_ADMIN)
  2. Try apiClient.post('/api/admin/users/create', payload)
  3. On success: also call addStaff() for local list, return { success: true }
  4. On failure: call addStaff() anyway, return { success: false, error: msg }


2.5  Layer 5: In-Memory Store (src/data/store.ts)
──────────────────────────────────────────────────

Pure client-side data storage. NO API calls. Data resets on page refresh.

  Function              Returns                   Source
  ───────────────────────────────────────────────────────────
  getStudents()         Student[]                 mock-data.ts (deterministic)
  getLecturers()        User[]                    users.ts (mock teachers)
  getStaff()            Staff[]                   store.ts (4 hardcoded + added)
  addStudent(input)     Student                   prepends to array
  addLecturer(input)    User                      prepends to array
  addStaff(input)       Staff                     prepends to array

These are used by the CRUD management pages (staff, students, lecturers)
which currently have NO real API integration for listing data.


================================================================================
3. COMPLETE API ENDPOINT REGISTRY
================================================================================

Every backend endpoint, what sends the request, what the response looks like.

3.1  Auth Endpoints
────────────────────

POST /api/auth/login
  Called by:    src/app/login/page.tsx (raw fetch)
  Auth:         None (public)
  Request Body: { "email": "string", "password": "string" }
  Success 200:  { "accessToken", "refreshToken", "tokenType", "expiresIn",
                  "userId", "email", "fullName", "role", "mustChangePassword" }
  Error 401:    "Invalid credentials" or "N attempt(s) remaining"
  Error 403:    "Account disabled"
  Error 423:    "Account locked"

POST /api/auth/refresh
  Called by:    src/lib/axios.ts (response interceptor, axios instance)
  Auth:         None (public)
  Request Body: { "refreshToken": "string" }
  Success 200:  { "accessToken": "string", "refreshToken": "string" }
  Error:        Invalid/expired refresh token

POST /api/auth/logout
  Called by:    src/hooks/useAuth.ts (apiClient.post)
  Auth:         Required (any role)
  Request Body: None
  Success 200:  { "success": true, "message": "Logged out" }
  Effect:       Revokes all refresh tokens for the user

POST /api/auth/change-password
  Called by:    NOT YET USED in frontend
  Auth:         Required (any role)
  Request Body: { "currentPassword": "string", "newPassword": "string" }


3.2  Department Endpoints
──────────────────────────

GET /api/departments
  Called by:    src/hooks/useDepartments.ts (useSWR)
  Auth:         Required (any role)
  Response:     Array of { "id": number, "name": string, "code": string,
                           "createdAt": string }

POST /api/departments
  Called by:    src/hooks/useDepartments.ts (createDepartment)
  Auth:         Required (any role)
  Request Body: { "name": "string", "code": "string" }
  Response:     Created department object

PUT /api/departments/{id}
  Called by:    src/hooks/useDepartments.ts (updateDepartment — NOT currently used)
  Auth:         Required (any role)
  Request Body: { "name": "string", "code": "string" }

DELETE /api/departments/{id}
  Called by:    src/hooks/useDepartments.ts (deleteDepartment — NOT currently used)
  Auth:         Required (any role)

GET /api/departments/{id}
  Called by:    NOT currently used in frontend


3.3  User Endpoints
────────────────────

GET /api/users
  Called by:    src/hooks/useUsers.ts (useSWR)
  Auth:         Required (any role)
  Response:     Array of UserResponse objects

GET /api/users/{id}
  Called by:    NOT currently used
  Auth:         Required (any role)
  Response:     Single UserResponse (detailed, includes student profile)

GET /api/users/role/{role}
  Called by:    src/hooks/useUsers.ts (useUsersByRole)
  Auth:         Required (any role)
  Response:     Array of UserResponse (basic, filtered by role)

GET /api/users/role/{role}/details
  Called by:    NOT currently used
  Auth:         Required (any role)
  Response:     Array of UserResponse (detailed, filtered by role)

GET /api/users/department/{id}
  Called by:    NOT currently used
  Auth:         Required (any role)

GET /api/users/department/{id}/details
  Called by:    NOT currently used


3.4  Academic Endpoints
────────────────────────

GET /api/academic/grades/{studentId}
  Called by:    src/hooks/useAcademic.ts (useStudentGrades)
  Auth:         Required (any role)
  Response:     Array of AcademicRecord objects

GET /api/academic/grades/{studentId}/{academicYear}
  Called by:    NOT currently used
  Auth:         Required (any role)


3.5  Attendance Endpoints
──────────────────────────

GET /api/attendance/{studentId}
  Called by:    src/hooks/useAcademic.ts (useAttendance)
  Auth:         Required (any role)
  Response:     Array of AttendanceSummary objects

GET /api/attendance/calculate/{studentId}/{subjectCode}
  Called by:    NOT currently used

GET /api/attendance/below75
  Called by:    src/hooks/useAcademic.ts (useLowAttendanceStudents)
  Auth:         Required (any role)
  Response:     Array of students with attendance below 75%


3.6  Admin Endpoints
─────────────────────

POST /api/admin/users/create
  Called by:    src/lib/api/staff.ts (createStaff)
  Auth:         Required (MANAGE role)
  Request Body: { "email", "password", "fullName", "role", "departmentId",
                  "studentIdNumber", "batchYear", "academicYear", "section" }
  Response:     CreatedAccountResponse
  Note:         studentIdNumber, batchYear, academicYear, section are optional
                (only needed for STUDENT role)

POST /api/setup/admin
  Called by:    NOT currently used
  Auth:         None (public, only works on empty DB)


3.7  Moderation Endpoints
──────────────────────────

The frontend sends to /api/ai/moderate-* endpoints.
(Exact paths depend on the moderation service configuration).

  utils/moderate.ts:
    POST /api/ai/moderate-image   (for images)
    POST /api/ai/moderate-video   (for video frames)
    POST /api/ai/moderate-text    (for text)


================================================================================
4. DATA FLOW DIAGRAMS
================================================================================

4.1  Login Flow
───────────────

  login/page.tsx
    │
    │  fetch(API_URL + "/api/auth/login", { email, password })
    │
    ▼
  Spring Boot AuthController
    │  Validates credentials
    │  Returns AuthResponse
    │
    ▼
  login/page.tsx handleLogin()
    │  res.json() → data
    │  Checks res.ok
    │
    ├── Not OK → toast.error(data.message)
    │
    └── OK →
         localStorage.setItem("access_token", data.accessToken)
         localStorage.setItem("refresh_token", data.refreshToken)
         document.cookie = "access_token=..."
         document.cookie = "refresh_token=..."
         Decode JWT → extract role
         roleRoute[role] → target path
         toast.success("Login successful")
         window.location.href = target
           │
           ▼
         Browser navigates to /{role}/feed
           │
           ▼
         proxy.ts (middleware) intercepts
           │  Reads access_token cookie
           │  Decodes JWT
           │  Checks role vs path
           │
           ├── Role matches → NextResponse.next()
           │
           └── Role doesn't match → redirect to correct path
                                      or /login


4.2  SWR Data Fetch Flow
─────────────────────────

  Page Component
    │  import { useUsers } from "@/hooks/useUsers"
    │  const { data, error, isLoading } = useUsers()
    │
    ▼
  useUsers.ts
    │  return useSWR<User[]>("/api/users")
    │
    ▼
  providers.tsx (global SWRConfig)
    │  fetcher = (url) => apiClient.get(url).then(res => res.data)
    │
    ▼
  lib/axios.ts (apiClient)
    │  Request Interceptor:
    │    config.headers.Authorization = "Bearer " + localStorage.getItem("access_token")
    │
    ▼
  Spring Boot Backend
    │  Validates JWT
    │  Returns JSON response
    │
    ▼
  lib/axios.ts
    │  Response Interceptor:
    │    If 401 → refresh token → retry
    │    If 200 → return response
    │
    ▼
  providers.tsx
    │  .then(res => res.data)
    │
    ▼
  useUsers.ts
    │  Returns { data, error, isLoading }
    │
    ▼
  Page Component
    │  Renders based on isLoading / error / data


4.3  Token Refresh Flow
────────────────────────

  apiClient.get("/api/users")
    │
    ▼
  Backend → 401 Unauthorized (token expired)
    │
    ▼
  Response Interceptor catches error
    │
    ├── Is this a retry? (originalRequest._retry)
    │   └── Yes → return Promise.reject(error)
    │
    ├── Is another refresh already in progress? (isRefreshing)
    │   └── Yes → queue this request:
    │       failedQueue.push({ resolve, reject })
    │       → wait for refresh to complete
    │       → on success: retry with new token
    │       → on failure: reject
    │
    └── No (first failure):
        originalRequest._retry = true
        isRefreshing = true
        │
        ▼
      axios.post("/api/auth/refresh", { refreshToken })
        │
        ├── Success:
        │   localStorage.setItem("access_token", newAccessToken)
        │   localStorage.setItem("refresh_token", newRefreshToken)
        │   setCookie("access_token", newAccessToken)
        │   setCookie("refresh_token", newRefreshToken)
        │   processQueue(null, newAccessToken)
        │   originalRequest.headers.Authorization = "Bearer " + newAccessToken
        │   → retry original request
        │
        └── Failure:
            processQueue(refreshError, null)
            localStorage.removeItem("access_token")
            localStorage.removeItem("refresh_token")
            window.location.href = "/login"


4.4  Staff Creation Flow
─────────────────────────

  admin/staff/page.tsx (or manage/manage-staff/page.tsx, etc.)
    │  handleAdd()
    │
    ▼
  lib/api/staff.ts → createStaff(input)
    │
    ├── STEP 1: Map role
    │   admin → MANAGE
    │   finance → FINANCE_ACCOUNTANT
    │   sa → STUDENT_AFFAIRS
    │   itsm → SYSTEM_ADMIN
    │
    ├── STEP 2: Try API call
    │   apiClient.post("/api/admin/users/create", {
    │     email: input.email,
    │     password: input.password,
    │     fullName: input.name,
    │     role: mappedRole
    │   })
    │   │
    │   ├── Success → { success: true, data: backendResponse }
    │   │
    │   └── Failure → { success: false, error: "message" }
    │
    └── STEP 3: Always add to local store
        addStaff(input)  → prepends to in-memory array
        │
        ▼
    Return result to page
        │
        ├── success → toast.success("Staff created successfully")
        │
        └── failure → toast.warning("...saved locally only")


4.5  Moderation Flow
─────────────────────

  feed/page.tsx
    │  User uploads image/video/text post
    │
    ▼
  utils/moderate.ts
    │
    ├── For images:
    │   imageToBase64(file) → base64 string
    │   fetch(POST /api/ai/moderate-image, { image: base64 })
    │
    ├── For video:
    │   extractVideoFrame(file) → base64 frame
    │   fetch(POST /api/ai/moderate-video, { image: base64, type: "video" })
    │
    └── For text:
        fetch(POST /api/ai/moderate-text, { text, type: "text" })
    │
    ▼
  Moderation Service
    │  Returns { safe: boolean, categories: string[], reason: string }
    │
    ▼
  feed/page.tsx
    │  If safe → allow post
    │  If unsafe → show warning, block post
    │
    On network error → fallback to { safe: true, categories: [], reason: "" }


================================================================================
5. FILE-BY-FILE API CALL MAP
================================================================================

5.1  Files That Make API Calls
───────────────────────────────

  FILE                              API CALL(S)                         METHOD
  ─────────────────────────────────────────────────────────────────────────────────
  src/app/login/page.tsx            /api/auth/login                     POST (fetch)
  
  src/lib/axios.ts                  /api/auth/refresh                   POST (axios)
  
  src/hooks/useAuth.ts              /api/auth/me                        GET  (SWR)
                                    /api/auth/login                     POST (apiClient)
                                    /api/auth/logout                    POST (apiClient)
  
  src/hooks/useUsers.ts             /api/users                          GET  (SWR)
                                    /api/users/role/{role}              GET  (SWR)
  
  src/hooks/useDepartments.ts       /api/departments                    GET  (SWR)
                                    /api/departments                    POST (apiClient)
                                    /api/departments/{id}               PUT  (apiClient)
                                    /api/departments/{id}               DELETE (apiClient)
  
  src/hooks/useAcademic.ts          /api/academic/grades/{studentId}    GET  (SWR)
                                    /api/attendance/{studentId}         GET  (SWR)
                                    /api/attendance/below75             GET  (SWR)
  
  src/lib/api/staff.ts              /api/admin/users/create             POST (apiClient)
  
  src/utils/moderate.ts             /api/ai/moderate-image              POST (fetch)
                                    /api/ai/moderate-video              POST (fetch)
                                    /api/ai/moderate-text               POST (fetch)


5.2  Files That Receive API Data (directly or via hooks)
──────────────────────────────────────────────────────────

  FILE                              DATA FROM                          SOURCE HOOK/API
  ─────────────────────────────────────────────────────────────────────────────────
  (Any page that needs user data)   Current user                       useAuth()
  (Any page that needs users)       User list / filtered users         useUsers(), useUsersByRole()
  (Any page that needs depts)       Department list                    useDepartments()
  (Any page that needs grades)      Student grades                     useStudentGrades()
  (Any page that needs attendance)  Attendance data                    useAttendance()
  (Any page that needs low att.)    Students below 75%                 useLowAttendanceStudents()
  
  admin/staff/page.tsx              Staff list                         getStaffList()
  manage/manage-staff/page.tsx      Staff list                         getStaffList()
  finance/manage-finance-staff/     Staff list                         getStaffList()
  student-affire/manage-student-    Staff list                         getStaffList()
    affire/page.tsx
  
  (All CRUD pages)                  Students list                      getStudents()
  (All CRUD pages)                  Lecturers list                     getLecturers()


5.3  Files That Define API Interfaces
───────────────────────────────────────

  FILE                              DEFINES
  ──────────────────────────────────────────────────────────
  src/types/index.ts                BackendRole, AuthUser, LoginResponse,
                                    ApiResponse<T>, PathRole
  
  src/hooks/useAuth.ts              User interface (id, username, email, role)
  
  src/data/mock-data.ts             Student, Staff, ExamResult, DepartmentStats
                                    (frontend-side types, NOT backend types)
  
  src/data/users.ts                 User, TeacherAssignment (mock teacher types)
  
  src/data/store.ts                 NewStudentInput, NewLecturerInput, NewStaffInput
                                    (input types for local CRUD)


================================================================================
6. ERROR HANDLING
================================================================================

6.1  HTTP Status Code Handling
───────────────────────────────

  Status    Meaning                  Where Handled                       Action
  ────────────────────────────────────────────────────────────────────────────────
  200       Success                  All callers                         Parse JSON, use data
  400       Bad Request              login page                          toast.error(message)
  401       Unauthorized             axios interceptor                    → try token refresh
  401       Unauthorized             login page                          toast.error(message)
  403       Forbidden                axios interceptor                    → reject promise
  403       Forbidden                login page                          toast.error("Account disabled")
  409       Conflict                 Not yet handled                     —
  423       Locked                   login page                          toast.error("Account locked")
  500       Server Error             All callers                         toast.error or fallback


6.2  Network Error Handling
────────────────────────────

  Location                          What happens
  ──────────────────────────────────────────────────────────────
  login/page.tsx                    catch → toast.error(err.message)
  lib/axios.ts                      Interceptor returns Promise.reject(error)
  SWR hooks                         error state → UI shows error/retry
  lib/api/staff.ts                  catch → returns { success: false, error }
  utils/moderate.ts                 catch → returns { safe: true } (fail-open)


6.3  Token Expiry Handling
───────────────────────────

  Step 1:  Request fails with 401
  Step 2:  Response interceptor catches it
  Step 3:  If not already a retry:
             → calls POST /api/auth/refresh with refresh_token
  Step 4a: Refresh succeeds → new tokens stored → request retried
  Step 4b: Refresh fails (no refresh token / expired) →
             → localStorage cleared
             → Cookies cleared
             → Redirect to /login


================================================================================
7. ROUTE SERVICE INDEX
================================================================================

7.1  SWR Hooks (src/hooks/)
────────────────────────────

  useAuth.ts:
    useSWR<User>("/api/auth/me")     — fetch current user
    login(credentials)                — POST /api/auth/login
    logout()                          — POST /api/auth/logout
    Returns: { user, isLoading, isAuthenticated, login, logout, refreshUser }

  useUsers.ts:
    useUsers()                        — useSWR("/api/users")
    useUsersByRole(role)              — useSWR("/api/users/role/{role}")
    Returns: { data, error, isLoading, mutate }

  useDepartments.ts:
    useDepartments()                  — useSWR("/api/departments")
    createDepartment(data)            — apiClient.post("/api/departments", data)
    updateDepartment(id, data)        — apiClient.put("/api/departments/{id}", data)
    deleteDepartment(id)              — apiClient.delete("/api/departments/{id}")
    Returns: { data, error, isLoading, createDepartment, updateDepartment,
               deleteDepartment }

  useAcademic.ts:
    useStudentGrades(studentId)       — useSWR("/api/academic/grades/{studentId}")
    useAttendance(studentId)          — useSWR("/api/attendance/{studentId}")
    useLowAttendanceStudents()        — useSWR("/api/attendance/below75")
    Returns: { data, error, isLoading } per hook


7.2  API Helpers (src/lib/api/)
────────────────────────────────

  staff.ts:
    createStaff(input)                — POST /api/admin/users/create + local fallback
    getStaffList()                    — returns local store staff array
    Returns: { success, data, local } or { success, error, local }


7.3  Utility Services (src/utils/)
───────────────────────────────────

  moderate.ts:
    extractVideoFrame(file)           — extracts base64 JPEG frame from video
    imageToBase64(file)               — converts image file to base64
    moderateMedia(file, type)         — POST /api/ai/moderate-{type}
    moderateText(text)                — POST /api/ai/moderate-text
    Returns: ModerationResult { safe, categories, reason }

  rollcall.ts:
    calcAttendance(present, total)    — percentage calculation
    isHit(percentage)                 — true if < 75
    remainingAbsencesBeforeHit(...)   — days until threshold
    recoveryNeeded(...)               — consecutive attendance needed
    perSubjectHits(records)           — hit status per subject
    overallSummaries(records)         — aggregated stats
    warningList(students, threshold)  — students near threshold

  timetable.ts:
    generateTimetable(params)         — generates schedule
    generateAll(params)              — generates all schedules
    getTeacherTimetable(...)         — get teacher's schedule

  cn.ts:
    cn(...classes)                    — joins classNames, filters falsy


7.4  Data Stores (src/data/)
─────────────────────────────

  store.ts:
    getStudents(), getLecturers(), getStaff()
    addStudent(input), addLecturer(input), addStaff(input)
    Types: NewStudentInput, NewLecturerInput, NewStaffInput

  courses.ts:
    getAllCourses(), getYearLabel(), getYearFromCode()
    COURSES_BY_YEAR, FACULTIES, SECTIONS

  departments.ts:
    STUDENT_MAJORS, LECTURER_DEPARTMENTS, STAFF_DEPARTMENTS, SECTIONS

  mock-data.ts:
    STUDENTS (40), MAJORS, MAJOR_LABELS, STAFF_DEPARTMENTS, DEPARTMENTS
    generateStudents(), getYearBySemester(), getStudentsByYear()
    findStudentByRollNo(), findStudentByName()
    getDepartmentStats()
    ExamResult, generateLibraryRecords(), getLibraryStatus()
    extractRollNoFromFilename(), extractNamesFromFilename()

  users.ts:
    ALL_USERS (14 teachers), getAllFaculties(), getTeachersByFaculty()
    getTeachersByCourse(), getHODByFaculty(), getFacultyIdFromCourse()


================================================================================
END OF DOCUMENT
================================================================================
