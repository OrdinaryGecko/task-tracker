# Task Tracker

A full-stack task management application with user authentication, role-based access control, categories, and an admin dashboard.

## Features

- **User Authentication**: Register, login, and logout with JWT tokens
- **Role-based Access**: Admin and Normal User roles
- **Category Management**: Admin-only CRUD operations for task categories
- **Task Management**: Create, read, update, and delete tasks with status tracking
- **Due Date Validation**: Status cannot be changed after the due date passes
- **Admin Dashboard**: View all tasks with filtering by user, status, and due date

## Demo

[![Demo Video](https://img.youtube.com/vi/f-bcpoMtEfI/0.jpg)](https://youtu.be/f-bcpoMtEfI)

## Tech Stack

- **Backend**: Node.js, Express.js, Prisma ORM
- **Database**: PostgreSQL
- **Frontend**: React, TypeScript, Tailwind CSS
- **Authentication**: JWT (24-hour expiry)
- **Containerization**: Docker, Docker Compose

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@demo.io | admin123 |
| User | maya@demo.io | user1234 |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Docker & Docker Compose (optional)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/OrdinaryGecko/task-tracker
   cd task-tracker
   ```

2. **Start the backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   npx prisma db push
   node prisma/seed.js
   npm run dev
   ```

3. **Start the frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

### Docker Deployment

1. **Clone and start**
   ```bash
   git clone https://github.com/OrdinaryGecko/task-tracker
   cd task-tracker
   cp .env.example .env
   docker-compose up --build
   ```

2. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and receive JWT
- `POST /api/auth/logout` - Invalidate token
- `GET /api/auth/me` - Get current user

### Categories (Admin-only)
- `GET /api/categories` - List all categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Tasks
- `GET /api/tasks` - List tasks (admin sees all)
- `POST /api/tasks` - Create task
- `GET /api/tasks/:id` - Get single task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PATCH /api/tasks/:id/status` - Update status (with due date validation)

### Admin Dashboard
- `GET /api/admin/dashboard` - All tasks with filtering

## Environment Variables

This project uses two separate `.env` files depending on how you run it:

**Local Development** — use `backend/.env` (copy from `backend/.env.example`):
```bash
cd backend
cp .env.example .env
```

**Docker Deployment** — use root `.env` (copy from `.env.example`):
```bash
cp .env.example .env
```

Docker ignores `backend/.env` (via `.dockerignore`), so both setups work independently without conflicts.

| Variable | Description | Default | Used By |
|----------|-------------|---------|---------|
| `POSTGRES_DB` | PostgreSQL database name | `tasktracker` | PostgreSQL, Backend |
| `POSTGRES_USER` | PostgreSQL username | `postgres` | PostgreSQL, Backend |
| `POSTGRES_PASSWORD` | PostgreSQL password | `postgres` | PostgreSQL, Backend |
| `DB_PORT` | PostgreSQL port on host | `5432` | PostgreSQL |
| `JWT_SECRET` | Secret key for JWT signing | `task-tracker-secret-key` | Backend |
| `JWT_EXPIRES_IN` | JWT token expiration | `24h` | Backend |
| `PORT` | Backend API port | `3000` | Backend |
| `FRONTEND_PORT` | Frontend port on host | `5173` | Frontend |

## License

MIT
