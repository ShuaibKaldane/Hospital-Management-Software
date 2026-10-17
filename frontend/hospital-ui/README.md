# MediCare+ Frontend

Angular 21 standalone-component frontend for the Hospital Management System.

## Tech Stack

- **Angular 21** — standalone components, signals, zoneless change detection, control flow
- **TypeScript 5.9** — strict mode (`noImplicitAny`, `noPropertyAccessFromIndexSignature`, etc.)
- **Reactive Forms** — every form uses `FormBuilder` + `FormGroup` + validators
- **HttpClient + Functional Interceptors** — JWT auto-attached via `authInterceptor`
- **Lazy-loaded routes** — every feature page is a separate chunk
- **Inline templates & styles** — single-file components, no Angular Material dependency
- **Inter + Plus Jakarta Sans** — loaded via Google Fonts for a professional, modern look

## Design System

A custom design system in [src/styles.css](src/styles.css) with CSS variables:

- **Colors** — cyan/teal primary (`#0E7490`), amber accent (`#D97706`), full slate neutrals, semantic success/warning/danger
- **Typography** — `Inter` for UI, `Plus Jakarta Sans` for display/headings
- **Components** — `.btn`, `.card`, `.form-control`, `.badge`, `.alert`, `.data-table`, `.auth-shell`
- **Layout helpers** — `.grid`, `.grid-2/3/4`, `.flex`, `.gap-*`, `.mb-*`, `.mt-*`

## Folder Layout

```
src/
├── main.ts                      # bootstraps the standalone App
├── index.html                   # font preload, splash loader, inline favicon
├── environments/
│   ├── environment.ts           # dev  → http://localhost:5000/api
│   └── environment.prod.ts      # prod → /api
│
└── app/
    ├── app.ts                   # root component (just <router-outlet>)
    ├── app.config.ts            # router + HttpClient + interceptors
    ├── app.routes.ts            # lazy routes with role-based guards
    │
    ├── core/
    │   ├── models/              # typed contracts for every backend entity
    │   ├── services/            # one HttpClient-wrapped service per resource
    │   ├── guards/              # authGuard + roleGuard(...)
    │   └── interceptors/        # attaches Bearer token
    │
    ├── shared/
    │   ├── shell/               # authenticated layout (sidebar + navbar + outlet)
    │   ├── navbar/              # top bar, brand, user chip, sign-out
    │   ├── sidebar/             # role-specific navigation, gradient style
    │   ├── page-header/         # consistent page title block
    │   ├── stat-card/           # dashboard KPI tile with accent bar
    │   ├── loading/             # spinner (block + inline)
    │   └── empty-state/         # empty-data illustration
    │
    └── features/
        ├── home/                # public landing page (hero + features + roles)
        ├── auth/                # login (admin/doctor/patient switcher), patient signup, doctor application
        ├── admin/               # dashboard, doctors, categories, payments, salary, appointments
        ├── doctor/              # dashboard, profile, appointments, prescriptions, reports, earnings
        └── patient/             # dashboard, profile, browse doctors, book, appointments, prescriptions, reports, payments
```

## Routing

Every protected route uses lazy `loadComponent` and is gated by `authGuard` + `roleGuard(...)`:

```ts
{
  path: 'doctor',
  canActivate: [authGuard, roleGuard('DOCTOR')],
  loadComponent: () => import('./shared/shell/shell.component')...,
  children: [
    { path: '',             loadComponent: () => import('./features/doctor/dashboard.component')... },
    { path: 'profile',      loadComponent: () => import('./features/doctor/profile.component')... },
    ...
  ]
}
```

If a logged-in user hits a route for the wrong role, they are silently redirected to their own dashboard.

## Auth Flow

1. User submits the login form
2. `AuthService` hits `/api/auth/{role}/login` (or signup)
3. Backend returns `{ token, user }`
4. `TokenService.setSession` stores both in `localStorage` and updates signals
5. `authInterceptor` reads the token signal and attaches `Authorization: Bearer …` to every subsequent request
6. On 401 from anywhere, components read the error message from the API service

## Running Locally

```bash
# 1. Start the backend (separate terminal)
cd "D:/All Projects/Hospital Management Project/backend/hospital-api"
npm run dev      # → http://localhost:5000

# 2. Start the frontend
cd "D:/All Projects/Hospital Management Project/frontend/hospital-ui"
npm start        # → http://localhost:4200
```

The frontend uses `environment.apiBaseUrl = http://localhost:5000/api` in dev.

## Default Credentials

After running `database/seed.sql` and generating a real bcrypt hash for `admin@hospital.com`:

```
Admin login:    admin@hospital.com / admin
Doctor signup:  /doctor/signup (pending until admin approves)
Patient signup: /register (active immediately)
```

## Style Conventions

- **Standalone components only** — no NgModules
- **One component per file** — selector `app-*`, class name `XxxComponent`
- **Inline styles** for component-scoped CSS, global tokens in `styles.css`
- **Signals** for local state, `computed()` for derived values
- **`inject()`** instead of constructor DI
- **Reactive forms** for every user input
- **Lazy loading** for every route
- **Never** bypass the typed services — go through `ApiService` so the `{ success, message, data }` envelope is unwrapped consistently