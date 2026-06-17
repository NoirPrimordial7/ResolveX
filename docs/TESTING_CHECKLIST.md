# Testing Checklist

## Setup

- [ ] Copy `backend/.env.example` to `backend/.env`.
- [ ] Start PostgreSQL locally or run Docker Compose.
- [ ] Run Alembic migrations.
- [ ] Run the seed script.
- [ ] Start backend API.
- [ ] Start frontend.

## Authentication

- [ ] Register a new customer account.
- [ ] Login with the new customer.
- [ ] Login with seeded admin credentials.
- [ ] Confirm invalid login shows an error.
- [ ] Confirm logged out users cannot access dashboards.

## Customer Flow

- [ ] Customer can create a ticket.
- [ ] Customer can see the new ticket on dashboard.
- [ ] Customer can filter tickets by status.
- [ ] Customer can open ticket details.
- [ ] Customer can add a comment.
- [ ] Customer cannot access another customer's ticket by URL.
- [ ] Customer cannot access `/admin/dashboard`.
- [ ] Customer cannot access `/admin/tickets`.

## Admin Flow

- [ ] Admin can view dashboard stats.
- [ ] Admin can view all tickets.
- [ ] Admin can search tickets.
- [ ] Admin can filter by status.
- [ ] Admin can filter by priority.
- [ ] Admin can filter by category.
- [ ] Admin can assign a ticket to self.
- [ ] Admin can change status to In Progress.
- [ ] Admin can change status to Resolved.
- [ ] Admin can change priority to Urgent.
- [ ] Admin can open ticket details.
- [ ] Admin can add a comment.

## API Checks

- [ ] `GET /health` returns status ok.
- [ ] `POST /api/auth/register` creates customer only.
- [ ] `POST /api/auth/login` returns JWT.
- [ ] `GET /api/auth/me` returns current user without password hash.
- [ ] Protected endpoints reject missing token.
- [ ] Admin endpoints reject customer token.
- [ ] Validation errors are readable.

## UI Checks

- [ ] Login page is responsive.
- [ ] Register page is responsive.
- [ ] Customer dashboard works on laptop and mobile.
- [ ] Admin tickets table scrolls horizontally on small screens.
- [ ] Buttons and form fields are visible in dark theme.
- [ ] Orange accent, status colors, and cards are consistent.
