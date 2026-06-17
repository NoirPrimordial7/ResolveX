# Database Schema

ResolveX uses PostgreSQL with SQLAlchemy ORM models and Alembic migrations.

## users

Stores application users.

Columns:
- `id`: Primary key.
- `full_name`: User display name.
- `email`: Unique login email.
- `hashed_password`: bcrypt password hash.
- `role`: Either `customer` or `admin`.
- `is_active`: Allows disabling an account.
- `created_at`: Timestamp when the account was created.

Relationships:
- One user can create many tickets.
- One admin user can be assigned many tickets.
- One user can write many comments.

Indexes:
- `id`
- unique `email`

## tickets

Stores support tickets.

Columns:
- `id`: Primary key.
- `title`: Short ticket title.
- `description`: Full issue description.
- `category`: Technical, Billing, Account, General, or Other.
- `priority`: Low, Medium, High, or Urgent.
- `status`: Open, In Progress, Resolved, or Closed.
- `created_by_id`: Foreign key to the customer who created the ticket.
- `assigned_to_id`: Nullable foreign key to the admin assigned to the ticket.
- `created_at`: Timestamp when the ticket was created.
- `updated_at`: Timestamp when the ticket was last updated.

Relationships:
- A ticket belongs to one creator.
- A ticket can optionally be assigned to one admin.
- A ticket has many comments.

Indexes:
- `status`
- `priority`
- `category`
- `created_by_id`
- `assigned_to_id`

These indexes help list and filter tickets efficiently.

## comments

Stores replies on tickets.

Columns:
- `id`: Primary key.
- `message`: Comment body.
- `ticket_id`: Foreign key to the ticket.
- `author_id`: Foreign key to the user who wrote the comment.
- `created_at`: Timestamp when the comment was created.

Relationships:
- A comment belongs to one ticket.
- A comment belongs to one author.

Indexes:
- `ticket_id`
- `author_id`

## Relationship Summary

- `users.id -> tickets.created_by_id`: one customer creates many tickets.
- `users.id -> tickets.assigned_to_id`: one admin can be assigned many tickets.
- `tickets.id -> comments.ticket_id`: one ticket has many comments.
- `users.id -> comments.author_id`: one user writes many comments.
