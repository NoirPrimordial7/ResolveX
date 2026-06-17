# ResolveX - Customer Support Ticket Management System

ResolveX is a full-stack customer support ticket management system built as a polished 2-day MVP. Resolve customer issues faster with customer ticket creation, admin assignment, status updates, comments, and dashboard reporting.

## Tech Stack

Backend:
- FastAPI
- Python 3.11+
- SQLAlchemy
- PostgreSQL
- Alembic
- JWT authentication
- bcrypt password hashing
- Pydantic validation

Frontend:
- React
- Vite
- TypeScript
- Tailwind CSS
- React Router
- Axios
- Lucide icons

DevOps:
- Docker Compose
- PostgreSQL container
- `.env.example` configuration

## Features

- Customer registration and login.
- Seeded admin login.
- JWT protected routes.
- Role-based permissions.
- Customer ticket creation and comments.
- Admin ticket search, filters, pagination, assignment, status updates, and priority updates.
- Admin dashboard cards for total, open, in progress, resolved, and high priority tickets.
- Dark premium SaaS interface with orange accent and responsive layout.

## Folder Structure

```text
resolvex/
  backend/
    app/
      core/
      db/
      models/
      schemas/
      routes/
      services/
      utils/
      main.py
      seed.py
    alembic/
    alembic.ini
    requirements.txt
    .env.example
    Dockerfile
  frontend/
    src/
      api/
      components/
      context/
      pages/
      types/
      App.tsx
      main.tsx
      index.css
    package.json
    vite.config.ts
    tailwind.config.js
    .env.example
  docs/
  docker-compose.yml
  README.md
```

## Backend Setup

Requirements:
- Python 3.11+
- PostgreSQL running locally or through Docker Compose

From the project root:

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
python -m app.seed
uvicorn app.main:app --reload
```

On Windows PowerShell, activate the virtual environment with:

```powershell
.\venv\Scripts\Activate.ps1
```

Backend runs at:

```text
http://localhost:8000
```

API docs:

```text
http://localhost:8000/docs
```

## Frontend Setup

Requirements:
- Node.js 22+ recommended

From the project root:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

## Docker Setup

From the project root:

```bash
docker-compose up --build
```

This starts:
- PostgreSQL at `localhost:5432`
- FastAPI at `localhost:8000`
- React frontend at `localhost:5173`

The backend container runs migrations and seed data automatically.

## Demo Credentials

Admin:

```text
email: admin@resolvex.com
password: Admin@123
```

Customer:

```text
email: customer@resolvex.com
password: Customer@123
```

## API Base URL

```text
http://localhost:8000/api
```

## Screens and Pages

- Login
- Register
- Customer Dashboard
- Create Ticket
- Ticket Details
- Admin Dashboard
- Admin Tickets

## Main API Endpoints

Auth:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

Customer tickets:
- `POST /api/tickets`
- `GET /api/tickets/my`
- `GET /api/tickets/{ticket_id}`
- `POST /api/tickets/{ticket_id}/comments`

Admin:
- `GET /api/admin/tickets`
- `GET /api/admin/dashboard`
- `PATCH /api/admin/tickets/{ticket_id}/status`
- `PATCH /api/admin/tickets/{ticket_id}/assign`
- `PATCH /api/admin/tickets/{ticket_id}/priority`

## Production Command

For production-style backend serving:

```bash
gunicorn -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:8000 --workers 4
```

Use a strong `SECRET_KEY`, HTTPS, managed PostgreSQL, backups, and proper logging in production.

## Future Improvements

- Email notifications.
- File attachments.
- SLA timers.
- More analytics charts.
- Admin user management.
- Refresh tokens.
- Automated tests.
- Audit logs for admin actions.
