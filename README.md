# ResolveX - Customer Support Ticket Management System

ResolveX is a full-stack helpdesk system for customer support operations. Customers create tickets, admins assign and monitor work, and support agents work only on tickets assigned to them with comments, status updates, and reassignment requests.

## Tech Stack

Backend:
- FastAPI
- Python 3.12.8 recommended for production
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
- Production-safe admin and support-agent creation scripts.
- JWT protected routes.
- Role-based permissions for `customer`, `support_agent`, and `admin`.
- Customer ticket creation and comments.
- Support agent assigned ticket queue, replies, status updates, and reassignment requests.
- Admin ticket search, filters, pagination, assignment, reassignment, status updates, and priority updates.
- Admin dashboard cards, pending reassignment requests, and support agent workload.
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
- Python 3.12.8 recommended
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

Support Agent:

```text
email: agent@resolvex.com
password: Agent@123
```

Seed credentials are for local development only. In production, create privileged users with environment variables:

```bash
cd backend
ADMIN_NAME="ResolveX Admin" ADMIN_EMAIL="admin@example.com" ADMIN_PASSWORD="strong-password" python -m app.create_admin
AGENT_NAME="Support Agent" AGENT_EMAIL="agent@example.com" AGENT_PASSWORD="strong-password" python -m app.create_agent
```

## API Base URL

```text
http://localhost:8000/api
```

## Screens and Pages

- Login
- Register
- Customer Dashboard at `/customer/dashboard`
- Create Ticket
- Ticket Details
- Agent Dashboard
- Agent Tickets
- Agent Ticket Details
- Admin Dashboard
- Admin Tickets
- Admin Agents
- Admin Reassignment Requests

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
- `GET /api/admin/users`
- `GET /api/admin/agents`
- `PATCH /api/admin/tickets/{ticket_id}/status`
- `PATCH /api/admin/tickets/{ticket_id}/assign`
- `PATCH /api/admin/tickets/{ticket_id}/reassign`
- `PATCH /api/admin/tickets/{ticket_id}/priority`
- `GET /api/admin/reassignment-requests`
- `PATCH /api/admin/reassignment-requests/{request_id}`

Support agent:
- `GET /api/agent/dashboard`
- `GET /api/agent/tickets`
- `GET /api/agent/tickets/{ticket_id}`
- `PATCH /api/agent/tickets/{ticket_id}/status`
- `POST /api/agent/tickets/{ticket_id}/comments`
- `POST /api/agent/tickets/{ticket_id}/reassignment-requests`

## Production Command

Render backend:

```bash
pip install -r requirements.txt
```

First deployment start command:

```bash
alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Normal production start command after the migration has run:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Set `PYTHON_VERSION=3.12.8` on Render or use `backend/.python-version`. Do not use Python 3.14 for production because some pinned binary database drivers may not publish compatible wheels yet.

Supabase PostgreSQL:
- Use the Supabase connection string as `DATABASE_URL`.
- `postgresql://...` URLs are supported; SQLAlchemy driver dependencies include `psycopg2-binary==2.9.9` and `psycopg[binary]`.
- Run `alembic upgrade head` before serving the app on the first deployment.

Use a strong `SECRET_KEY`, HTTPS, managed PostgreSQL backups, and proper logging in production.

## Postman

Import `docs/ResolveX.postman_collection.json`. Update the collection variables for your admin, support-agent, and customer credentials, then run the collection in order.

## Future Improvements

- Email notifications.
- File attachments.
- SLA timers.
- More analytics charts.
- Admin user management.
- Refresh tokens.
- Automated tests.
- Audit logs for admin actions.
