# HemoLink — Blood Logistics Platform

## Quick Start

### 1. Start the server

```bash
cd server
cp .env.example .env       # fill in your MongoDB URI
npm install
npm run dev                # runs on http://localhost:8000
```

### 2. Start the frontend (new terminal)

```bash
# From the project root (where package.json is)
npm install
npm run dev                # runs on http://localhost:3000
```

The Vite dev server proxies all `/api` requests to `http://localhost:8000` automatically — no CORS issues.

## Folder structure

```
hemolink/
├── package.json          ← React app (Vite + TypeScript)
├── vite.config.ts        ← dev proxy: /api → localhost:8000
├── tailwind.config.js
├── tsconfig.json
├── index.html
├── src/                  ← React source code
│   ├── main.tsx
│   ├── App.tsx
│   ├── lib/api.ts        ← all API calls (the only file touching the server)
│   └── pages/
│       ├── Index.tsx          ← landing / portal selection
│       ├── AuthPage.tsx       ← login + register (hospital / blood_bank / donor)
│       ├── HospitalDashboard.tsx
│       ├── BloodBankDashboard.tsx
│       └── DonorDashboard.tsx
└── server/               ← Express + MongoDB API
    ├── .env.example
    ├── index.js          ← entry point
    ├── config/db.js
    ├── middleware/auth.js
    ├── models/
    └── routes/
```

## API endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | — | Register (hospital / blood_bank / donor) |
| POST | /api/auth/login | — | Login, returns JWT |
| GET | /api/blood-bank/profile | JWT | Blood bank profile |
| PUT | /api/blood-bank/profile | JWT | Update blood bank profile |
| GET | /api/hospital/profile | JWT | Hospital profile |
| PUT | /api/hospital/profile | JWT | Update hospital profile |
| GET | /api/donor/profile | JWT | Donor profile |
| PUT | /api/donor/profile | JWT | Update donor profile |
| GET | /api/inventory | JWT | Get blood inventory |
| PUT | /api/inventory/:id | JWT | Update inventory units |
| GET | /api/blood-requests | JWT | Get blood requests |
| POST | /api/blood-requests | JWT (hospital) | Create blood request |
| PUT | /api/blood-requests/:id | JWT | Update request status |
| GET | /api/appointments | JWT | Get donor appointments |
| POST | /api/appointments | JWT (donor) | Book appointment |
