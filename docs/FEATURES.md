# Features

## Authentication

- Customer registration.
- User login with JWT access token.
- Password hashing using bcrypt.
- Current user endpoint.
- Protected frontend routes.
- Role-based access for customer and admin.

## Customer Features

- Customer dashboard with ticket statistics.
- Create support ticket.
- View own tickets.
- Filter own tickets by status.
- View ticket details.
- Add comments to own tickets.
- See category, priority, status, created date, and assigned admin.

## Admin Features

- Admin dashboard with reports.
- View all tickets with pagination.
- Search tickets by title or description.
- Filter tickets by status, priority, and category.
- Assign ticket to self or another admin through the API.
- Change ticket status.
- Change ticket priority.
- Add admin comments on any ticket.
- View recent tickets and priority overview.

## Ticket Data

Each ticket stores:
- id
- title
- description
- category
- priority
- status
- created_by
- assigned_to
- created_at
- updated_at

## Comment Data

Each comment stores:
- id
- ticket_id
- author_id
- message
- created_at

Comments show the author's name, role, message, and timestamp.
