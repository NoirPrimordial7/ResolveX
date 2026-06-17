# 2-Day Development Plan

## Day 1

### Backend Setup

- Create FastAPI project structure.
- Add configuration using environment variables.
- Connect SQLAlchemy to PostgreSQL.
- Create Docker Compose setup for local database.

### Database Models

- Create User model.
- Create Ticket model.
- Create Comment model.
- Add relationships between users, tickets, and comments.
- Add indexes for ticket status, priority, category, creator, and assignee.
- Add Alembic initial migration.

### JWT Authentication

- Add customer registration.
- Add login endpoint.
- Add JWT token generation and validation.
- Add bcrypt password hashing.
- Add current user dependency.

### Ticket APIs

- Create ticket endpoint.
- Get my tickets endpoint.
- Get ticket details endpoint.
- Add comments endpoint.
- Enforce that customers can only access their own tickets.

### Admin APIs

- Add admin-only dashboard endpoint.
- Add paginated all tickets endpoint.
- Add filters and search.
- Add update status endpoint.
- Add update priority endpoint.
- Add assign ticket endpoint.

## Day 2

### Frontend UI

- Create React Vite TypeScript app.
- Configure Tailwind CSS.
- Build dark theme with orange accent.
- Create reusable UI components.

### Dashboard Pages

- Build login and register pages.
- Build customer dashboard.
- Build create ticket page.
- Build ticket details page with comments.
- Build admin dashboard.
- Build admin tickets management table.

### Testing

- Test registration and login.
- Test customer ticket flow.
- Test admin ticket flow.
- Test unauthorized access.
- Test Docker setup.

### Documentation

- Write project overview.
- Write API reference.
- Write database schema.
- Write security and scalability notes.
- Write testing checklist and viva notes.

### Final Polish

- Improve responsive layout.
- Check API error messages.
- Verify seeded credentials.
- Update README with setup steps.
