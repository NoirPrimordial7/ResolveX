# Group Division

This project can be divided between 4 to 5 students.

## Member 1: Backend Authentication

Responsibilities:
- FastAPI setup.
- User model.
- Registration and login endpoints.
- JWT token creation and validation.
- Password hashing.
- Current user endpoint.
- Role-based dependencies.

Files:
- `backend/app/core/security.py`
- `backend/app/routes/auth.py`
- `backend/app/services/auth_service.py`
- `backend/app/utils/dependencies.py`
- `backend/app/models/user.py`

## Member 2: Backend Tickets and Admin APIs

Responsibilities:
- Ticket and comment models.
- Customer ticket APIs.
- Admin ticket list, filters, and dashboard.
- Ticket assignment, status update, and priority update.
- Alembic migration.

Files:
- `backend/app/models/ticket.py`
- `backend/app/models/comment.py`
- `backend/app/routes/tickets.py`
- `backend/app/routes/admin.py`
- `backend/app/services/ticket_service.py`
- `backend/alembic/versions/202606170001_initial.py`

## Member 3: Frontend Customer Flow

Responsibilities:
- Login and register UI.
- Customer dashboard.
- Create ticket page.
- Ticket details page.
- Customer comments.

Files:
- `frontend/src/pages/Login.tsx`
- `frontend/src/pages/Register.tsx`
- `frontend/src/pages/CustomerDashboard.tsx`
- `frontend/src/pages/CreateTicket.tsx`
- `frontend/src/pages/TicketDetails.tsx`

## Member 4: Frontend Admin Flow

Responsibilities:
- Admin dashboard.
- Admin tickets table.
- Filters and pagination UI.
- Status, priority, and assignment actions.
- Reusable dashboard components.

Files:
- `frontend/src/pages/AdminDashboard.tsx`
- `frontend/src/pages/AdminTickets.tsx`
- `frontend/src/components/StatCard.tsx`
- `frontend/src/components/TicketCard.tsx`
- `frontend/src/components/TicketStatusBadge.tsx`

## Member 5: Documentation, Testing, and Presentation

Responsibilities:
- README.
- API reference.
- Database schema explanation.
- Manual testing checklist.
- Viva preparation.
- Demo script and screenshots.

Files:
- `README.md`
- `docs/*.md`
- `.env.example`
- `docker-compose.yml`
