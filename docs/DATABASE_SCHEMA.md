# Database Schema

ResolveX uses PostgreSQL or SQLite through SQLAlchemy ORM models and Alembic migrations.

## users

Stores customers, support agents, and admins.

Columns:
- `id`: Primary key.
- `name`: Display name. The API still returns `full_name` for existing frontend compatibility.
- `email`: Unique login email.
- `password_hash`: bcrypt password hash.
- `role`: `customer`, `support_agent`, or `admin`.
- `is_active`: Allows disabling an account.
- `created_at`: Account creation timestamp.
- `updated_at`: Last account update timestamp.

Indexes:
- `id`
- unique `email`

## tickets

Stores customer support tickets.

Columns:
- `id`: Primary key.
- `title`: Short ticket title.
- `description`: Full issue description.
- `category`: Technical, Billing, Account, General, or Other.
- `priority`: Low, Medium, High, or Urgent.
- `status`: Open, In Progress, Resolved, or Closed.
- `created_by`: Foreign key to the customer who created the ticket.
- `assigned_to`: Nullable foreign key to the assigned support agent.
- `created_at`: Ticket creation timestamp.
- `updated_at`: Last update timestamp.
- `resolved_at`: Nullable timestamp set when status becomes Resolved.

Indexes:
- `status`
- `priority`
- `category`
- `created_by`
- `assigned_to`
- `created_at`

## ticket_comments

Stores replies on tickets.

Columns:
- `id`: Primary key.
- `ticket_id`: Foreign key to the ticket.
- `user_id`: Foreign key to the comment author.
- `message`: Comment body.
- `created_at`: Comment creation timestamp.

## ticket_assignment_requests

Stores support-agent requests to move an assigned ticket to another agent.

Columns:
- `id`: Primary key.
- `ticket_id`: Foreign key to the ticket.
- `requested_by`: Foreign key to the support agent who requested reassignment.
- `current_assignee_id`: Nullable foreign key to the assignee at request time.
- `reason`: Agent-provided reason.
- `status`: Pending, Approved, or Rejected.
- `admin_response`: Nullable admin response.
- `created_at`: Request creation timestamp.
- `resolved_at`: Nullable timestamp set when approved or rejected.

Indexes:
- `status`
- `ticket_id`

## Relationship Summary

- `users.id -> tickets.created_by`: one customer creates many tickets.
- `users.id -> tickets.assigned_to`: one support agent can be assigned many tickets.
- `tickets.id -> ticket_comments.ticket_id`: one ticket has many comments.
- `users.id -> ticket_comments.user_id`: one user writes many comments.
- `tickets.id -> ticket_assignment_requests.ticket_id`: one ticket has many reassignment requests.
