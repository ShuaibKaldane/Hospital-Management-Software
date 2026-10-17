# Hospital Management API

Express + MySQL backend for the Hospital Management System.

## Tech Stack

- Node.js + Express 5
- MySQL 8 (via `mysql2/promise` connection pool)
- JWT authentication (`jsonwebtoken`)
- Password hashing (`bcrypt`)
- File uploads (`multer`, disk storage under `uploads/`)
- Role-based authorization middleware

## Folder Structure

```
hospital-api/
├── server.js               # Entry point, route mounting
├── .env                    # Environment variables
├── package.json
│
├── config/
│   └── database.js         # mysql2 connection pool
│
├── middleware/
│   ├── auth.middleware.js      # JWT verification
│   ├── role.middleware.js      # Role-based access control
│   ├── upload.middleware.js    # Multer setup for file uploads
│   └── error.middleware.js     # Centralized error handler
│
├── utils/
│   ├── response.util.js    # success() / failure() helpers
│   ├── error.util.js       # ApiError class
│   └── validators.util.js  # Input validators
│
├── models/                 # Raw SQL queries (one file per table group)
│   ├── auth.model.js
│   ├── user.model.js
│   ├── doctorCategory.model.js
│   ├── doctorProfile.model.js
│   ├── patientProfile.model.js
│   ├── appointment.model.js
│   ├── prescription.model.js
│   ├── patientReport.model.js
│   ├── payment.model.js
│   └── salary.model.js
│
├── services/               # Business logic
│   ├── auth.service.js
│   ├── admin.service.js
│   ├── doctorCategory.service.js
│   ├── doctorProfile.service.js
│   ├── patientProfile.service.js
│   ├── appointment.service.js
│   ├── prescription.service.js
│   ├── patientReport.service.js
│   ├── payment.service.js
│   └── salary.service.js
│
├── controllers/            # Express handlers (thin layer)
│   ├── auth.controller.js
│   ├── admin.controller.js
│   ├── doctorCategory.controller.js
│   ├── doctorProfile.controller.js
│   ├── patientProfile.controller.js
│   ├── appointment.controller.js
│   ├── prescription.controller.js
│   ├── patientReport.controller.js
│   ├── payment.controller.js
│   └── salary.controller.js
│
├── routes/                 # URL → controller mappings
│   ├── auth.routes.js
│   ├── admin.routes.js
│   ├── doctor.routes.js
│   ├── patient.routes.js
│   └── doctorCategory.routes.js
│
└── uploads/                # Multer destination for patient reports
```

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
# Edit .env with your MySQL credentials and JWT secret

# 3. Create database (run schema.sql + seed.sql from ../database/)

# 4. Start dev server
npm run dev

# Or production
npm start
```

Server defaults to `http://localhost:5000`.

## API Endpoints

All endpoints return JSON in the shape:
```json
{ "success": true, "message": "...", "data": { ... } }
```
or
```json
{ "success": false, "message": "error description" }
```

### Auth (public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/api/auth/admin/login`   | Admin login (status must be ACTIVE) |
| POST   | `/api/auth/doctor/login`  | Doctor login (status must be ACTIVE) |
| POST   | `/api/auth/patient/login` | Patient login |
| POST   | `/api/auth/doctor/signup` | Doctor registration (status: PENDING, awaits admin approval) |
| POST   | `/api/auth/patient/signup`| Patient registration (status: ACTIVE) |

### Admin (`/api/admin`) — JWT + ADMIN role

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/dashboard`             | Aggregated stats |
| GET    | `/doctors`               | List doctors (filters: `status`, `category_id`, `search`, `limit`, `offset`) |
| PUT    | `/doctors/:id/approve`   | Approve doctor (PENDING → ACTIVE) |
| PUT    | `/doctors/:id/block`     | Block doctor |
| GET    | `/categories`            | List doctor categories |
| POST   | `/categories`            | Create category |
| PUT    | `/categories/:id`        | Update category |
| DELETE | `/categories/:id`        | Delete category |
| GET    | `/appointments`          | List all appointments (filters: `status`, `date`) |
| PUT    | `/appointments/:id/status` | Update appointment status |
| POST   | `/salary`                | Add salary/bonus/deduction |
| GET    | `/salary`                | List all salary transactions |
| GET    | `/salary/doctor/:id`     | Transactions for one doctor |
| GET    | `/payments`              | List all payments |
| PUT    | `/payments/:id/status`   | Update payment status |

### Doctor (`/api/doctor`) — JWT + DOCTOR role

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET / PUT | `/profile`        | Get / update own profile |
| GET    | `/categories`        | List categories |
| GET    | `/doctors`           | List active doctors |
| GET    | `/doctors/:id`       | Get a doctor |
| GET    | `/appointments`      | My appointments (filter: `status`) |
| PUT    | `/appointments/:id/status` | Approve / complete / cancel |
| POST   | `/prescriptions`     | Write prescription for one of my appointments |
| GET    | `/prescriptions`     | My prescriptions |
| GET    | `/reports`           | Reports patients uploaded |
| GET    | `/payments`          | Payments received |
| GET    | `/earnings`          | Net salary credits − debits |
| GET    | `/salary`            | My salary transactions |

### Patient (`/api/patient`) — JWT + PATIENT role

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET / PUT | `/profile`        | Get / update own profile |
| GET    | `/categories`        | List categories |
| GET    | `/doctors`           | List active doctors |
| GET    | `/doctors/:id`       | Get a doctor |
| POST   | `/appointments`      | Book an appointment |
| GET    | `/appointments`      | My appointments |
| GET    | `/prescriptions`     | My prescriptions |
| POST   | `/reports`           | Upload medical report (`multipart/form-data`, field: `file`) |
| GET    | `/reports`           | My reports |
| POST   | `/payments`          | Pay consultation fee |
| GET    | `/payments`          | My payments |

### Doctor Categories (`/api/doctor-categories`)

Read endpoints are open to any authenticated user. Mutations require `ADMIN`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/`        | List categories |
| GET    | `/:id`     | Get a category |
| POST   | `/`        | Create (ADMIN) |
| PUT    | `/:id`     | Update (ADMIN) |
| DELETE | `/:id`     | Delete (ADMIN) |

## Standard Response

Success:
```json
{ "success": true, "message": "...", "data": { ... } }
```

Failure:
```json
{ "success": false, "message": "..." }
```

## Auth Header

Send JWT in the Authorization header for every protected route:
```
Authorization: Bearer <token>
```