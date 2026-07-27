# Task Tracker Lite

A full-stack task management application with user authentication, role-based access control, categories, and an admin dashboard.

## Features

- **User Authentication**: Register, login, and logout with JWT tokens
- **Role-based Access**: Admin and Normal User roles
- **Category Management**: Admin-only CRUD operations for task categories
- **Task Management**: Create, read, update, and delete tasks with status tracking
- **Due Date Validation**: Status cannot be changed after the due date passes
- **Admin Dashboard**: View all tasks with filtering by user, status, and due date

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
   git clone <repository-url>
   cd task-tracker-lite
   ```

2. **Start the backend**
   ```bash
   cd backend
   npm install
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
   git clone <repository-url>
   cd task-tracker-lite
   cp .env.example .env
   docker-compose up --build
   ```

2. **Access the application**
   - Frontend: http://localhost
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

See `.env.example` for all configurable variables.

## License

MIT
