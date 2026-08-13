# UniConnect Client — ပရောဂျက်မှတ်တမ်း (မြန်မာလို)

## မာတိကာ

1. [နည်းပညာပုံစံ](#၁-နည်းပညာပုံစံ)
2. [ဗိသုကာလက်ရာခြုံငုံသုံးသပ်ချက်](#၂-ဗိသုကာလက်ရာခြုံငုံသုံးသပ်ချက်)
3. [ဖိုင်တည်ဆောက်ပုံအပြည့်အစုံ](#၃-ဖိုင်တည်ဆောက်ပုံအပြည့်အစုံ)
4. [အသုံးပြုသူအခန်းကဏ္ဍစနစ် နှင့် လမ်းကြောင်းကာကွယ်ရေး](#၄-အသုံးပြုသူအခန်းကဏ္ဍစနစ်-နှင့်-လမ်းကြောင်းကာကွယ်ရေး)
5. [အကောင့်ဝင်ရောက်ခြင်းလုပ်ငန်းစဉ်](#၅-အကောင့်ဝင်ရောက်ခြင်းလုပ်ငန်းစဉ်)
6. [API ဆက်သွယ်ရေးအလွှာ](#၆-api-ဆက်သွယ်ရေးအလွှာ)
7. [ဒေတာစီးဆင်းမှုပုံစံများ](#၇-ဒေတာစီးဆင်းမှုပုံစံများ)
8. [ကွန်ပိုနင့်အဆင့်ဆင့်](#၈-ကွန်ပိုနင့်အဆင့်ဆင့်)
9. [အခန်းကဏ္ဍအလိုက် စာမျက်နှာစာရင်း](#၉-အခန်းကဏ္ဍအလိုက်-စာမျက်နှာစာရင်း)
10. [Backend API အသေးစိတ်](#၁၀-backend-api-အသေးစိတ်)
11. [သိထားသင့်သော ပြဿနာများ](#၁၁-သိထားသင့်သော-ပြဿနာများ)

---

## ၁. နည်းပညာပုံစံ

| အလွှာ | နည်းပညာ | ဗားရှင်း | ရည်ရွယ်ချက် |
|-------|-----------|---------|-------------|
| Framework | Next.js (App Router) | 16.2.10 | Server-side rendering, file-based routing, API middleware |
| UI Library | React | 19.2.4 | Component model |
| Language | TypeScript | ^5 | Type safety |
| Styling | Tailwind CSS | ^4 | Utility-first CSS |
| Component Library | daisyUI | 5.7.0 | Pre-built Tailwind components |
| Data Fetching | SWR | 2.4.2 | Caching, revalidation |
| HTTP Client | Axios | 1.18.1 | Request/response interceptors |
| Toasts | sonner | 2.0.7 | Toast အကြောင်းကြားချက်များ |
| Excel | xlsx | 0.18.5 | Roll-call import/export |
| Backend | Spring Boot API | — | `https://uniconnectserver-production.up.railway.app` |

---

## ၂. ဗိသုကာလက်ရာခြုံငုံသုံးသပ်ချက်

```
┌──────────────────────────────────────────────────────────────────┐
│                      Browser (Client-Side)                       │
│                                                                  │
│  ┌────────────┐  ┌───────────┐  ┌────────────┐  ┌───────────┐  │
│  │ Middleware │  │ Pages     │  │ Components │  │ SWR Hooks │  │
│  │ (proxy.ts) │  │ (App Dir) │  │ (UI/Feature)│  │ (useAuth) │  │
│  └─────┬──────┘  └─────┬─────┘  └──────┬─────┘  └─────┬─────┘  │
│        │               │               │              │        │
│        │         ┌─────┴───────────────┴──────────────┘        │
│        │         │           Axios (apiClient)                  │
│        │         │  ┌──────────────────────────────────┐       │
│        │         │  │  Request: Bearer token ထည့်ခြင်း  │       │
│        │         │  │  Response: 401 ရရင် refresh     │       │
│        │         │  └──────────────────────────────────┘       │
│        │         └──────────────────┬───────────────────────────│
│        │                            │                           │
│        │                    ┌───────┴────────┐                  │
│        │                    │  fetch()       │                  │
│        │                    │  (login page)  │                  │
│        │                    └───────┬────────┘                  │
│        └────────────────────────────┼───────────────────────────│
└─────────────────────────────────────┼───────────────────────────┘
                                      │
                    HTTPS (CORS → localhost:3000)
                                      │
┌─────────────────────────────────────┼───────────────────────────┐
│              Spring Boot Backend (Railway)                       │
│  ┌──────────────────────────────────┴──────────────────────┐   │
│  │ Controllers: Auth, User, Department, Admin, Academic,  │   │
│  │ Attendance, Health, Setup                              │   │
│  └──────────────────────────────────┬──────────────────────┘   │
│  ┌──────────────────────────────────┴──────────────────────┐   │
│  │ RMI Layer → PostgreSQL (Neon)                          │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### အဓိက ဒီဇိုင်းဆုံးဖြတ်ချက်များ

- **Global state library မသုံးပါ** — Redux သို့မဟုတ် Zustand မရှိပါ။ SWR cache + local React state + in-memory arrays ဖြင့်အလုပ်လုပ်သည်။
- **Token နှစ်နေရာသိမ်းသည်** — `localStorage` (client JS အတွက်) နှင့် cookies (middleware အတွက်) နှစ်နေရာလုံးသိမ်းသည်။
- **Copy-pasted role pages** — အခန်းကဏ္ဍတစ်ခုချင်းစီအတွက် စာမျက်နှာများသည် မိတ္တူတူများဖြစ်သည်။
- **ဒေတာရင်းမြစ်နှစ်မျိုး** — အချို့ feature များက real API သုံးသည် (auth, departments, users)၊ အချို့က in-memory mock data သုံးသည် (staff, students, feed, chat)။

---

## ၃. ဖိုင်တည်ဆောက်ပုံအပြည့်အစုံ

```
src/
├── proxy.ts                          # Edge Middleware — JWT စစ်ဆေးပြီး လမ်းကြောင်းပြောင်းပေးသည်
│
├── app/
│   ├── layout.tsx                    # Root layout — ThemeProvider + AppProviders
│   ├── page.tsx                      # Splash page — ၃ စက္ကန့်ကြာရင် /login သို့ပြောင်းသည်
│   ├── providers.tsx                 # SWRConfig (global fetcher) + Toaster (sonner)
│   ├── globals.css                   # Tailwind v4 + daisyUI themes + animations
│   ├── login/
│   │   └── page.tsx                  # Login form
│   │
│   ├── admin/                        # Admin portal (စာမျက်နှာ ၁၅ ခု)
│   │   ├── layout.tsx                # Navigation role="admin"
│   │   ├── feed/page.tsx             # Social feed
│   │   ├── chat/page.tsx             # Chat
│   │   ├── explore/page.tsx          # Explore
│   │   ├── inbox/page.tsx            # Email inbox
│   │   ├── notifications/page.tsx    # အကြောင်းကြားချက်များ
│   │   ├── profile/page.tsx          # ကိုယ်ရေးအချက်အလက်
│   │   ├── profile/edit/page.tsx     # ကိုယ်ရေးပြင်ဆင်ရန်
│   │   ├── settings/page.tsx         # ဆက်တင်များ
│   │   ├── roll-call/page.tsx        # တက်ရောက်မှုစီမံခန့်ခွဲရေး
│   │   ├── timetable/page.tsx        # သင်တန်းအချိန်ဇယား
│   │   ├── exam-results/page.tsx     # စာမေးပွဲရလဒ်များ
│   │   ├── staff/page.tsx            # ဝန်ထမ်းစီမံခန့်ခွဲရေး
│   │   ├── students/page.tsx         # ကျောင်းသားစီမံခန့်ခွဲရေး
│   │   └── lecturers/page.tsx        # ဆရာစီမံခန့်ခွဲရေး
│   │
│   ├── teachers/                     # ဆရာ/ဆရာမ portal (စာမျက်နှာ ၁၁ ခု)
│   ├── students/                     # ကျောင်းသား portal (စာမျက်နှာ ၉ ခု)
│   ├── manage/                       # စီမံခန့်ခွဲရေး portal (စာမျက်နှာ ၁၁ ခု)
│   ├── student-affire/               # ကျောင်းသားရေးရာ portal (စာမျက်နှာ ၁၁ ခု)
│   └── finance/                      # ဘဏ္ဍာရေး portal (စာမျက်နှာ ၁၀ ခု)
│
├── components/
│   ├── layout/
│   │   └── Navigation.tsx            # Sidebar + top bar + mobile nav
│   ├── ui/
│   │   ├── BackButton.tsx            # နောက်ပြန်ခလုတ်
│   │   ├── ConfirmModal.tsx          # အတည်ပြုမော်ဒယ်
│   │   ├── ModalPortal.tsx           # Modal အကန့်
│   │   ├── ProfileDropdown.tsx       # ကိုယ်ရေးအချက်အလက် dropdown
│   │   ├── ReactionButton.tsx        # Emoji reaction ခလုတ်
│   │   ├── ThemeProvider.tsx         # အလင်း/အမှောင် theme
│   │   └── Toast.tsx                 # အကြောင်းကြားချက် toast
│   └── features/
│       ├── feed/components/ShareModal.tsx
│       └── inbox/
│           ├── types.ts              # Email type များ
│           ├── InboxPage.tsx         # Inbox UI
│           ├── EmailViewer.tsx       # Email အသေးစိတ်
│           └── ComposeModal.tsx      # Email ရေးရန် modal
│
├── hooks/
│   ├── useAuth.ts                    # SWR: me, login, logout
│   ├── useUsers.ts                   # SWR: user စာရင်း, role အလိုက်
│   ├── useDepartments.ts             # SWR: ဌာန CRUD
│   └── useAcademic.ts                # SWR: ဂရိတ်, တက်ရောက်မှု
│
├── lib/
│   ├── axios.ts                      # Axios instance + interceptors
│   └── api/
│       └── staff.ts                  # ဝန်ထမ်းဖန်တီးရန် API + local fallback
│
├── data/
│   ├── courses.ts                    # သင်ရိုးပြဌာန်းချက်များ
│   ├── departments.ts                # ဌာနအမည်များ
│   ├── mock-data.ts                  # Mock ဒေတာ (ကျောင်းသား ၄၀)
│   ├── store.ts                      # In-memory ဒေတာသိုလှောင်ရာ + CRUD
│   └── users.ts                      # ဆရာများဒေတာ
│
├── types/
│   └── index.ts                      # BackendRole, AuthUser, LoginResponse
│
└── utils/
    ├── cn.ts                         # className helper
    ├── moderate.ts                   # Content moderation
    ├── rollcall.ts                   # တက်ရောက်မှုတွက်ချက်ခြင်း
    └── timetable.ts                  # အချိန်ဇယားဆွဲခြင်း
```

---

## ၄. အသုံးပြုသူအခန်းကဏ္ဍစနစ် နှင့် လမ်းကြောင်းကာကွယ်ရေး

### ၄.၁ Backend Role များ (Spring Boot JWT)

| JWT Role | Portal လမ်းကြောင်း | ရှင်းလင်းချက် |
|----------|------------|-------------|
| `STUDENT` | `/students/*` | ကျောင်းသား |
| `TEACHER` | `/teachers/*` | ဆရာ/ဆရာမ |
| `MANAGE` | `/manage/*` | စီမံခန့်ခွဲရေးဝန်ထမ်း |
| `STUDENT_AFFAIRS` | `/student-affire/*` | ကျောင်းသားရေးရာဝန်ထမ်း |
| `FINANCE_ACCOUNTANT` | `/finance/*` | ဘဏ္ဍာရေးဝန်ထမ်း |
| `RECTOR` | `/admin/*` | ပါမောက္ခချုပ် |
| `PRO_RECTOR` | `/admin/*` | ဒုတိယပါမောက္ခချုပ် |
| `SYSTEM_ADMIN` | `/admin/*` | စနစ်စီမံခန့်ခွဲသူ |
| `STUDENT_AFFAIRS_ADMIN` | `/student-affire/*` | ကျောင်းသားရေးရာအကြီးအကဲ |
| `RECTOR_PRO_RECTOR` | `/admin/*` | ပါမောက္ခချုပ်/ဒုတိယ |

### ၄.၂ Middleware (src/proxy.ts) ဘယ်လိုအလုပ်လုပ်သလဲ

ဖိုင် `src/proxy.ts` သည် Next.js Edge Middleware ဖြစ်ပြီး request တိုင်းမှာ အောက်ပါအတိုင်း လုပ်ဆောင်သည်:

၁။ **Public လမ်းကြောင်းများကို ကျော်သည်**: `/login`, `/_next`, `/api`, `/favicon`
၂။ **Cookie ကိုဖတ်သည်**: `access_token` cookie ကိုထုတ်ယူသည်
၃။ **JWT ကိုဖော်သည်**: Base64 decode → `payload.role` ကိုထုတ်သည်
၄။ **Role ကိုလမ်းကြောင်းနှင့်တွဲသည်**: `STUDENT` → `students`
၅။ **လမ်းကြောင်းကိုစစ်ဆေးသည်**: လက်ရှိလမ်းကြောင်းသည် ထို role အတွက်ခွင့်ပြုထားသောလမ်းကြောင်းဟုတ်မဟုတ်စစ်သည်
၆။ **မခွင့်ပြုပါက**: သက်ဆိုင်ရာ feed သို့မဟုတ် `/login` သို့ပြောင်းပေးသည်

**ဥပမာ**:
- `/students/feed` သို့သွားသော user ၏ JWT တွင် `role: "STUDENT"` ရှိလျှင် → ခွင့်ပြုသည်
- `/students/feed` သို့သွားသော user ၏ JWT တွင် `role: "TEACHER"` ရှိလျှင် → `/teachers/feed` သို့ပြောင်းပေးသည်
- Cookie မရှိလျှင် → `/login` သို့ပြောင်းပေးသည်

### ၄.၃ Portal အလိုက် ခွင့်ပြုထားသော Role များ

| Portal | ခွင့်ပြု Role များ |
|--------|---------------|
| `/admin/*` | `RECTOR`, `PRO_RECTOR`, `SYSTEM_ADMIN`, `RECTOR_PRO_RECTOR` |
| `/teachers/*` | `TEACHER` |
| `/students/*` | `STUDENT` |
| `/manage/*` | `MANAGE`, `SYSTEM_ADMIN` |
| `/student-affire/*` | `STUDENT_AFFAIRS`, `STUDENT_AFFAIRS_ADMIN` |
| `/finance/*` | `FINANCE_ACCOUNTANT` |

---

## ၅. အကောင့်ဝင်ရောက်ခြင်းလုပ်ငန်းစဉ်

### ၅.၁ Login ဝင်ခြင်း (အစအဆုံး)

```
အသုံးပြုသူက form ဖြည့်ပြီး Sign In နှိပ်သည်
        │
        ▼
src/app/login/page.tsx
  ┌─────────────────────────────────────────────┐
  │ handleLogin()                                │
  │   → fetch(API_URL + "/api/auth/login",       │
  │       { email, password })                   │
  │                                              │
  │  အောင်မြင်လျှင်:                              │
  │   → access_token ကို localStorage သို့သိမ်း  │
  │   → refresh_token ကို localStorage သို့သိမ်း │
  │   → Cookie များသတ်မှတ်                      │
  │   → JWT ကိုဖော် → role ထုတ်                 │
  │   → roleRoute[role] → target path           │
  │   → toast.success("Login successful")       │
  │   → window.location.href = target           │
  │                                              │
  │  မအောင်မြင်လျှင်:                            │
  │   → toast.error(အမှားစာတမ်း)                   │
  └─────────────────────────────────────────────┘
        │
        ▼  (target သို့ပြောင်းသည်)
Middleware (proxy.ts)
  ┌─────────────────────────────────────────────┐
  │  Cookie ကိုဖတ် → JWT ဖော် → role စစ်       │
  │  ခွင့်ပြုလျှင် → NextResponse.next()          │
  │  မခွင့်ပါကလျှင် → သင့်လျော်ရာသို့ပြောင်း       │
  └─────────────────────────────────────────────┘
        │
        ▼
Role Layout (ဥပမာ - src/app/admin/layout.tsx)
  ┌─────────────────────────────────────────────┐
  │  <Navigation role="admin" />                 │
  │  <main>{children}</main>                     │
  └─────────────────────────────────────────────┘
        │
        ▼
Target Page (ဥပမာ - /admin/feed)
```

### ၅.၂ Token ပြန်လည်ဆန်းသစ်ခြင်း (Automatic)

`src/lib/axios.ts` ရှိ response interceptor က 401 error ရသည့်အခါ:

```
API က 401 ပြန်သည်
        │
        ▼
Axios Response Interceptor
  ┌─────────────────────────────────────────────┐
  │  401 ရပြီး refresh မလုပ်ရသေးလျှင်:           │
  │    → POST /api/auth/refresh ခေါ်သည်        │
  │      Body: { refreshToken }                 │
  │    → အောင်မြင်လျှင်:                         │
  │      → token အသစ်များသိမ်းသည်               │
  │      → မူလ request ကိုပြန်ခေါ်သည်           │
  │    → မအောင်မြင်လျှင်:                       │
  │      → localStorage ရှင်းသည်               │
  │      → /login သို့ပြောင်းသည်               │
  └─────────────────────────────────────────────┘
```

### ၅.၃ Logout ထွက်ခြင်း

ProfileDropdown ရှိ Sign Out ခလုတ်က `localStorage` ကိုရှင်းပြီး `/login` သို့ပြောင်းသည်။ `useAuth` hook ရှိ `logout()` က `POST /api/auth/logout` ကိုခေါ်ပြီး server-side က refresh token များကိုပါဖျက်သည်။

---

## ၆. API ဆက်သွယ်ရေးအလွှာ

### ၆.၁ Axios Client (`src/lib/axios.ts`)

**ဘာကိုထိန်းချုပ်သလဲ**: SWR data fetching အားလုံးနှင့် manual `apiClient` ခေါ်ဆိုမှုများ။

```typescript
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://uniconnectserver-production.up.railway.app',
});
```

**Request Interceptor**:
- `localStorage` မှ `access_token` ကိုဖတ်သည်
- Header တွင် `Authorization: Bearer {token}` ထည့်ပေးသည်

**Response Interceptor**:
- 401 ရလျှင်: request များကို queue လုပ်ပြီး token refresh လုပ်သည်
- Refresh အောင်မြင်လျှင်: queue ထဲက request အားလုံးကိုပြန်ခေါ်သည်
- Refresh မအောင်မြင်လျှင်: storage ရှင်းပြီး `/login` သို့ပြောင်းသည်

### ၆.၂ Frontend မှ Backend သို့ခေါ်ဆိုမှုများ

| Endpoint | Method | မည်သည့်ဖိုင်မှခေါ်သည် | လိုအပ်သော Role | ရှင်းလင်းချက် |
|----------|--------|----------------|----------------|-------------|
| `/api/auth/login` | POST | `login/page.tsx` (fetch) | မလိုပါ | Login, JWT ပြန်သည် |
| `/api/auth/refresh` | POST | `lib/axios.ts` | မလိုပါ | Token အသစ်လဲသည် |
| `/api/auth/logout` | POST | `hooks/useAuth.ts` | ရှိရမည် | Refresh tokens ဖျက်သည် |
| `/api/auth/me` | GET | `hooks/useAuth.ts` | ရှိရမည် | လက်ရှိ user (API တွင်မပါနိုင်) |
| `/api/admin/users/create` | POST | `lib/api/staff.ts` | MANAGE | အကောင့်အသစ်ဖွင့်သည် |
| `/api/users` | GET | `hooks/useUsers.ts` | ရှိရမည် | User အားလုံး |
| `/api/users/role/{role}` | GET | `hooks/useUsers.ts` | ရှိရမည် | Role အလိုက် user များ |
| `/api/departments` | GET/POST | `hooks/useDepartments.ts` | ရှိရမည် | ဌာန CRUD |
| `/api/academic/grades/{studentId}` | GET | `hooks/useAcademic.ts` | ရှိရမည် | ကျောင်းသားဂရိတ် |
| `/api/attendance/{studentId}` | GET | `hooks/useAcademic.ts` | ရှိရမည် | ကျောင်းသားတက်ရောက်မှု |
| `/api/attendance/below75` | GET | `hooks/useAcademic.ts` | ရှိရမည် | ၇၅% အောက်ကျောင်းသားများ |

### ၆.၃ API Response Format များ

**Login အောင်မြင်လျှင် (200)**:
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

**အမှားပြန်လျှင်**:
```json
{
  "success": false,
  "message": "အမှားအကြောင်းအရာ",
  "data": null
}
```

**HTTP Status အဓိပ္ပာယ်**:
| Code | အဓိပ္ပာယ် |
|------|-----------|
| 400 | Validation error |
| 401 | အကောင့်ဝင်ရန်မှားသည်/ JWT မရှိ/သက်တမ်းကုန် |
| 403 | အကောင့်ပိတ်ထားသည်/ role မလုံလောက် |
| 409 | Email ထပ်နေသည် |
| 423 | အကောင့်သော့ခတ်ခံရသည် (၅ကြိမ်ထက်များများမှား) |
| 500 | Server အမှား |

---

## ၇. ဒေတာစီးဆင်းမှုပုံစံများ

### ပုံစံ A: SWR + Axios (Real API)

အသုံးပြုသည့်နေရာများ: auth, users, departments, academic, attendance

```
Page Component → SWR Hook → useSWR(endpoint) → Global Fetcher
    → apiClient.get(url) → Backend API → JSON Response → Page
```

**ဥပမာ**: ဌာနများစာရင်းပြရန်
```
src/app/admin/feed/page.tsx
  → useDepartments() (src/hooks/useDepartments.ts)
    → useSWR('/api/departments')
      → apiClient.get('/api/departments') (src/lib/axios.ts)
        → https://...railway.app/api/departments (Spring Boot)
```

### ပုံစံ B: Raw `fetch()` (Direct API)

အသုံးပြုသည့်နေရာများ: login, content moderation

```
Page → fetch(API_URL + path) → Backend → JSON → Manual parse
```

### ပုံစံ C: Local API Helper + Local Store

အသုံးပြုသည့်နေရာများ: staff creation

```
Page → lib/api/staff.ts → createStaff()
  ├── apiClient.post('/api/admin/users/create')  → Backend ကိုကြိုးစားသည်
  └── addStaff(input)                             → Local store သို့ထည့်သည်
```

### ပုံစံ D: In-Memory Store သာ (No API)

အသုံးပြုသည့်နေရာများ: staff/student/lecturer listing, feed, chat, explore, notifications

```
Page → data/store.ts → getStaff()/getStudents()
    → In-memory JavaScript array (page refresh လုပ်လျှင်ပျောက်သည်)
```

---

## ၈. ကွန်ပိုနင့်အဆင့်ဆင့်

```
RootLayout (src/app/layout.tsx)
  ├── ThemeProvider (အလင်း/အမှောင် theme)
  │   └── AppProviders (SWRConfig + Toaster)
  │       └── {children}
  │
  ├── Login Page (login/page.tsx)
  │   └── Form → fetch() → redirect
  │
  └── Role Layout (ဥပမာ - admin/layout.tsx)
      └── Navigation (role="admin")
          ├── Desktop sidebar (w-64)
          │   ├── Logo
          │   └── Sectioned nav links
          │       ├── Social: Feed, Explore, Chat, Inbox, Notifications
          │       ├── Academic: Roll Call, Timetable
          │       └── People: Students, Lecturers, Staff
          ├── Desktop top bar
          │   ├── Search
          │   ├── Notification bell
          │   └── ProfileDropdown
          └── Mobile bottom nav (4 tabs + More drawer)
      └── <main> → Page content
```

### Navigation Component (`components/layout/Navigation.tsx`)

**ဘာကိုထိန်းချုပ်သလဲ**: Role တိုင်းအတွက် sidebar, top bar, mobile nav တို့ကိုထိန်းချုပ်သည်။

`role` prop ကိုလက်ခံပြီး `sectionsByRole` object မှ သက်ဆိုင်ရာ nav links များကိုပြသည်။

**လက်ရှိပြဿနာ**: Admin nav links များသည် `/admin/student-manage`, `/admin/lecturer-manage`, `/admin/staff-manage` သို့ညွှန်ပြထားသော်လည်း အမှန်တကယ်ဖိုင်များသည် `/admin/students`, `/admin/lecturers`, `/admin/staff` တွင်ရှိသည် → 404 error ဖြစ်နေသည်။

---

## ၉. အခန်းကဏ္ဍအလိုက် စာမျက်နှာစာရင်း

### admin (၁၅ မျက်နှာ)
| လမ်းကြောင်း | API သုံးလား | ရှင်းလင်းချက် |
|-------|-----------|-------------|
| `/admin/feed` | မသုံးပါ (mock) | Social feed |
| `/admin/chat` | မသုံးပါ (mock) | Chat |
| `/admin/explore` | မသုံးပါ (mock) | Explore |
| `/admin/inbox` | မသုံးပါ (mock) | Email inbox |
| `/admin/notifications` | မသုံးပါ (mock) | အကြောင်းကြားချက်များ |
| `/admin/profile` | မသုံးပါ (mock) | ကိုယ်ရေးအချက်အလက် |
| `/admin/roll-call` | မသုံးပါ (mock) | တက်ရောက်မှု |
| `/admin/timetable` | မသုံးပါ (mock) | အချိန်ဇယား |
| `/admin/exam-results` | မသုံးပါ (mock) | စာမေးပွဲရလဒ် |
| `/admin/staff` | **တစ်စိတ်တစ်ပိုင်း** | ဝန်ထမ်းစီမံ |
| `/admin/students` | မသုံးပါ (store) | ကျောင်းသားစီမံ |
| `/admin/lecturers` | မသုံးပါ (store) | ဆရာစီမံ |

### teachers (၁၁ မျက်နှာ — ၂ မျက်နှာ သီးသန့်)
သီးသန့်: `roll-call`, `timetable` (admin နှင့်အတူတူ)
ကျန်များ: feed, chat, explore, inbox, notifications, profile → admin မိတ္တူများ

### students (၉ မျက်နှာ — ၀ မျက်နှာ သီးသန့်)
အားလုံး admin မိတ္တူများဖြစ်သည် (feed, chat, explore, inbox, notifications, profile, settings)

### manage (၁၁ မျက်နှာ — ၂ မျက်နှာ သီးသန့်)
သီးသန့်: `lecture-manage` (admin/lecturers မိတ္တူ), `manage-staff` (admin/staff မိတ္တူ)

### student-affire (၁၁ မျက်နှာ — ၂ မျက်နှာ သီးသန့်)
သီးသန့်: `student-manage` (admin/students မိတ္တူ), `manage-student-affire` (admin/staff မိတ္တူ)

### finance (၁၀ မျက်နှာ — ၁ မျက်နှာ သီးသန့်)
သီးသန့်: `manage-finance-staff` (admin/staff မိတ္တူ)

---

## ၁၀. Backend API အသေးစိတ်

### Public Endpoints (JWT မလိုပါ)

| Method | Path | ရှင်းလင်းချက် |
|--------|------|-------------|
| `GET` | `/api/health` | Server အခြေအနေစစ်ဆေးရန် |
| `POST` | `/api/setup/admin` | ပထမဆုံး admin ဖန်တီးရန် (DB ဗလာဖြစ်မှသာ) |
| `POST` | `/api/auth/login` | Login ဝင်ရန် |
| `POST` | `/api/auth/refresh` | Token သက်တမ်းတိုးရန် |

### Authenticated Endpoints (JWT လိုပါ)

| Method | Path | ရှင်းလင်းချက် |
|--------|------|-------------|
| `POST` | `/api/auth/change-password` | စကားဝှက်ပြောင်းရန် |
| `POST` | `/api/auth/logout` | Logout ထွက်ရန် |

### Admin Endpoints (MANAGE Role)

| Method | Path | ရှင်းလင်းချက် |
|--------|------|-------------|
| `POST` | `/api/admin/users/create` | အကောင့်အသစ်ဖန်တီးရန် |

### Department Endpoints (Any Auth)

| Method | Path | ရှင်းလင်းချက် |
|--------|------|-------------|
| `GET` | `/api/departments` | ဌာနများစာရင်း |
| `POST` | `/api/departments` | ဌာနအသစ်ဖန်တီးရန် |

### User Endpoints (Any Auth)

| Method | Path | ရှင်းလင်းချက် |
|--------|------|-------------|
| `GET` | `/api/users` | User အားလုံး |
| `GET` | `/api/users/role/{role}` | Role အလိုက် user များ |

### Academic & Attendance Endpoints

| Method | Path | ရှင်းလင်းချက် |
|--------|------|-------------|
| `GET` | `/api/academic/grades/{studentId}` | ကျောင်းသားဂရိတ်များ |
| `GET` | `/api/attendance/{studentId}` | ကျောင်းသားတက်ရောက်မှု |
| `GET` | `/api/attendance/below75` | ၇၅% အောက်ကျောင်းသားများ |

---

## ၁၁. သိထားသင့်သော ပြဿနာများ

### ၁၁.၁ Admin Navigation Links များ မှားနေသည်

**ဖိုင်**: `src/components/layout/Navigation.tsx`

Admin nav links များသည်:
- `/admin/student-manage` → အမှန်လမ်းကြောင်း `/admin/students`
- `/admin/lecturer-manage` → အမှန်လမ်းကြောင်း `/admin/lecturers`
- `/admin/staff-manage` → အမှန်လမ်းကြောင်း `/admin/staff`

ဤ links များကိုနှိပ်ပါက 404 error ပြလိမ့်မည်။

### ၁၁.၂ စာမျက်နှာများ မိတ္တူတူနေသည်

Social page များ (feed, chat, explore, notifications, profile, settings) သည် role ၆ ခုလုံးအတွက် မိတ္တူတူဖြစ်နေသည်။ Feed page တစ်ခုတည်းကိုပင် နေရာ ၆ နေရာတွင် ကူးထားသည် (လိုင်း ၁၃၀၀ × ၆)။

### ၁၁.၃ `GET /api/auth/me` သည် API တွင်မရှိနိုင်

`useAuth` hook သည် `GET /api/auth/me` ကိုခေါ်သော်လည်း Spring Boot specification တွင် ဤ endpoint မပါဝင်ပါ။ 404 ပြန်နိုင်သည်။

### ၁၁.၄ In-Memory Store ဒေတာများ Page Refresh လုပ်လျှင်ပျောက်သည်

Staff, student, lecturer CRUD စာမျက်နှာများသည် `src/data/store.ts` ရှိ mutable array များကိုသုံးသည်။ Page refresh လုပ်တိုင်း ဒေတာပျောက်သည်။ `createStaff()` သာ real API ကိုခေါ်သည် (listing ကတော့ memory မှပဲဖတ်သည်)။

### ၁၁.၅ နာမည်ပုံစံမညီညွတ်ခြင်း

- Admin က နာမ်ဗဟုဝုစ်သုံးသည်: `/admin/students`, `/admin/lecturers`, `/admin/staff`
- အခြား role များက `{role}-manage` သုံးသည်: `/manage/manage-staff`, `/student-affire/student-manage`
- Navigation.tsx က admin အတွက်လည်း `{role}-manage` ပုံစံသုံးထားသောကြောင့် link များကျိုးနေသည်

### ၁၁.၆ Staff role နာမည်များကွာခြားသည်

Frontend ဝန်ထမ်း role များ: `admin`, `finance`, `sa`, `itsm` (စာလုံးသေး)
Backend role များ: `MANAGE`, `FINANCE_ACCOUNTANT`, `STUDENT_AFFAIRS`, `SYSTEM_ADMIN` (စာလုံးကြီး)

Mapping ကို `src/lib/api/staff.ts` ရှိ `ROLE_MAP` တွင်သိမ်းထားသည်။

### ၁၁.၇ Logout လုပ်လျှင် Cookies မရှင်းပါ

ProfileDropdown ၏ Sign Out က localStorage ကိုသာရှင်းပြီး `access_token` နှင့် `refresh_token` cookies များကိုမရှင်းပါ။ Middleware က cookie ဟောင်းများကိုပြန်ဖတ်နိုင်သေးသည်။
