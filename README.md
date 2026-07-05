# Luminedge CRM

A full-stack CRM built for Luminedge, a test-prep and study-abroad consultancy (IELTS, GRE, TOEFL, PTE). It runs the sales lead pipeline for the BDM (Business Development Manager) team and a student portal for enrolled students, on a **Next.js + Express/MongoDB** stack.

## Project Structure

```text
CRM/
|-- frontend/                    # Next.js (App Router) frontend
|   |-- app/                     # Routes: admin/, bdm/, student/, login/, register/, ...
|   |-- components/
|   |   |-- admin/                # Admin dashboard & user management
|   |   |-- bdm/                  # BDM dashboard
|   |   |-- leads/                # Lead Center, Lead Detail, lifecycle stages
|   |   |-- student/              # Student portal
|   |   |-- courses/, bookings/, schedules/, results/
|   |   `-- shared/
|   `-- middleware.ts             # Route-level auth redirects (UX layer only)
|-- backend/                     # Express + TypeScript API
|   |-- src/
|   |   |-- controllers/          # leads, dashboard, auth, chat, documents, ...
|   |   |-- models/               # Mongoose schemas (Lead, User, Task, ...)
|   |   |-- routes/
|   |   |-- middleware/           # JWT auth, role authorization
|   |   |-- services/             # Notifications, email, socket bridge
|   |   `-- scripts/               # One-off maintenance scripts (CSV import, backfills)
|   `-- Dockerfile
`-- .github/workflows/           # Keep-alive ping for free-tier hosting
```

## Features

- **Lead Center & BDM Pipeline** — kanban-style lead lifecycle (`New Inquiry` → `Contacted` → `Trial Class` → `Enrolled` / `Lost`), drag-and-drop stage updates, duplicate-phone detection, BDM assignment/filtering, bulk CSV import.
- **Admin & BDM dashboards** — conversion trends, source/course distribution, top-performer rankings, recent activity feed.
- **Student portal** — course/package enrollment, appointment scheduling, document uploads with staff review, milestones, mock test results.
- **Real-time chat & notifications** — Socket.IO messaging and live notifications between staff and students.
- **Role-based auth** — `admin` / `bdm` / `student` roles, JWT sessions plus Google OAuth login.
- **News & announcements**, exam/mock-test scheduling and packages.

## Prerequisites

- Node.js 18+
- MongoDB (local instance or MongoDB Atlas)

## Installation

```bash
cd backend && npm install
cd frontend && npm install
```

There is no root-level install/dev script — `frontend` and `backend` are independent npm projects, installed and run separately.

## Environment Variables

Create `backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/crm_luminedge
JWT_SECRET=your-secret-key-change-this-in-production
ALLOWED_ORIGINS=http://localhost:3000
FRONTEND_URL=http://localhost:3000

# Google OAuth login
GOOGLE_CLIENT_ID=your-google-client-id

# Document uploads (Vercel Blob storage)
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token

# Password-reset / notification emails (optional)
SMTP_HOST=
SMTP_PORT=
SMTP_SECURE=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=

# Only needed if Socket.IO is split onto its own always-on host (see below)
SOCKET_SERVER_URL=
SOCKET_SERVER_SECRET=
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

## Running the Application

**Terminal 1 — Backend:**

```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend:**

```bash
cd frontend
npm run dev
```

- Frontend: <http://localhost:3000>
- Backend API: <http://localhost:5000/api>

## Realtime Notifications

Socket.IO needs an always-on Node process. If the backend is deployed to a serverless/sleeping host, deploy a separate always-on socket host and set `SOCKET_SERVER_URL` / `SOCKET_SERVER_SECRET` (backend) and `NEXT_PUBLIC_SOCKET_URL` (frontend) so notifications are saved to MongoDB and then forwarded to the socket host, which emits `new-notification` to the right user room.

## Tech Stack

**Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Socket.IO client, `@dnd-kit` (drag-and-drop), Google OAuth.

**Backend:** Node.js, Express, TypeScript, MongoDB/Mongoose, JWT auth, Socket.IO, Nodemailer, Vercel Blob (document storage), `csv-parse` (bulk lead import).

## Deployment

- **Backend** — deployed as an always-on Node web service (see `render.yaml` / `backend/Dockerfile`); requires `MONGODB_URI`, `JWT_SECRET`, `ALLOWED_ORIGINS`, `FRONTEND_URL`, `GOOGLE_CLIENT_ID`, `BLOB_READ_WRITE_TOKEN`, and SMTP vars if email is used.
- **Frontend** — deployed on Netlify/Vercel with `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SOCKET_URL` pointed at the backend host.
- A scheduled GitHub Action (`.github/workflows/keep-alive.yml`) pings the backend's health check during business hours to reduce free-tier cold starts.

## License

MIT
