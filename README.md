# CRM for Luminedge

A full-stack Customer Relationship Management (CRM) system built with **MERN Stack** (MongoDB, Express, React/Next.js, Node.js).

## Project Structure

```text
CRM/
|-- frontend/          # Next.js frontend application
|   |-- app/           # Next.js App Router pages
|   |-- components/    # React components
|   `-- package.json
|-- backend/           # Express.js backend API
|   |-- src/
|   |   |-- config/    # Database configuration
|   |   |-- models/    # Mongoose models
|   |   |-- controllers/ # Route controllers
|   |   |-- routes/    # API routes
|   |   |-- app.ts     # Express app setup
|   |   `-- server.ts  # Server entry point
|   `-- package.json
`-- package.json       # Root package.json for managing both projects
```

## Features

- **Dashboard**: Overview of key metrics and recent activities
- **Contacts**: Manage customer contacts with full CRUD operations
- **Deals**: Track sales pipeline and deal stages
- **Tasks**: Organize tasks with kanban-style board
- **Companies**: Manage company accounts and relationships
- **RESTful API**: Backend API with MongoDB integration

## Prerequisites

- Node.js 18+ installed
- MongoDB installed and running (or MongoDB Atlas account)
- npm or yarn package manager

## Installation

1. **Install all dependencies** (root, frontend, and backend):

   ```bash
   npm run install:all
   ```

   Or install manually:

   ```bash
   npm install
   cd frontend && npm install
   cd ../backend && npm install
   ```

2. **Set up environment variables**:

   Create `backend/.env` file:

   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/crm_luminedge
   JWT_SECRET=your-secret-key-change-this-in-production
   NODE_ENV=development
   # Optional when the API and socket server are split across hosts
   SOCKET_SERVER_URL=https://your-socket-host.example.com
   SOCKET_SERVER_SECRET=your-shared-bridge-secret
   ```

   Create `frontend/.env.local` file:

   ```env
   NEXT_PUBLIC_API_URL=https://crm-eta-blush.vercel.app/api
   NEXT_PUBLIC_SOCKET_URL=https://your-socket-host.example.com
   ```

3. **Start MongoDB** (if running locally):

   ```bash
   # On Windows (if installed as service, it should auto-start)
   # On macOS/Linux:
   mongod
   ```

## Running the Application

### Option 1: Run both frontend and backend together

```bash
npm run dev
```

### Option 2: Run separately

**Terminal 1 - Backend:**

```bash
npm run dev:backend
# or
cd backend && npm run dev
```

**Terminal 2 - Frontend:**

```bash
npm run dev:frontend
# or
cd frontend && npm run dev
```

- Frontend will run on: <http://localhost:3000>
- Backend API will run on: <https://crm-eta-blush.vercel.app>

## Realtime Notifications

Socket.IO works only on an always-on Node server. If you keep the API on Vercel or another serverless host and want live push notifications, deploy a separate socket host and set:

```env
SOCKET_SERVER_URL=https://your-socket-host.example.com
SOCKET_SERVER_SECRET=shared-secret
NEXT_PUBLIC_SOCKET_URL=https://your-socket-host.example.com
```

The backend will save notifications to MongoDB as usual, then forward them to the socket host through an internal bridge endpoint. The socket host will emit the `new-notification` event to the correct user room.

## API Endpoints

### Contacts

- `GET /api/contacts` - Get all contacts
- `GET /api/contacts/:id` - Get a contact
- `POST /api/contacts` - Create a contact
- `PATCH /api/contacts/:id` - Update a contact
- `DELETE /api/contacts/:id` - Delete a contact

### Deals

- `GET /api/deals` - Get all deals
- `GET /api/deals/:id` - Get a deal
- `POST /api/deals` - Create a deal
- `PATCH /api/deals/:id` - Update a deal
- `DELETE /api/deals/:id` - Delete a deal

### Tasks

- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get a task
- `POST /api/tasks` - Create a task
- `PATCH /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

### Companies

- `GET /api/companies` - Get all companies
- `GET /api/companies/:id` - Get a company
- `POST /api/companies` - Create a company
- `PATCH /api/companies/:id` - Update a company
- `DELETE /api/companies/:id` - Delete a company

## Tech Stack

### Frontend

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icon library
- **Axios**: HTTP client for API calls

### Backend

- **Node.js**: JavaScript runtime
- **Express**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **TypeScript**: Type-safe development

## Development

The application uses:

- **Frontend**: Client-side state management with API integration
- **Backend**: RESTful API with MongoDB for data persistence

## Realtime Push Setup

To keep live push notifications working, deploy the backend to an always-on Node host. Vercel and Netlify are fine for the frontend and API calls, but Socket.IO needs a process that stays alive.

The backend now includes a Dockerfile at `backend/Dockerfile`, so you can deploy it as a Docker web service.

Recommended setup:

1. Deploy `backend/` as a web service on your Node host.
2. Set backend env vars:

   - `MONGODB_URI`
   - `JWT_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `ALLOWED_ORIGINS=https://crmluminedge.netlify.app`
   - `FRONTEND_URL=https://crmluminedge.netlify.app`
   - SMTP vars if you use password reset emails

3. Set frontend env vars on Netlify:

   - `NEXT_PUBLIC_API_URL=https://your-backend-host/api`
   - `NEXT_PUBLIC_SOCKET_URL=https://your-backend-host`

4. Redeploy the frontend.

If you keep the API and socket server on the same always-on host, you do not need `SOCKET_SERVER_URL` or `SOCKET_SERVER_SECRET`. Those are only for a split API/socket deployment.

## License

MIT
