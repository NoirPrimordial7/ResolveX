# Viva Notes

## What is the problem?

Customers need a structured way to report issues, and support admins need a dashboard to track, assign, update, and resolve those issues.

## What is ResolveX?

ResolveX is a customer support ticket management system. Customers can raise tickets and comment on them. Admins can manage all tickets from a protected dashboard.

## Why FastAPI?

FastAPI is fast, modern, and easy to document. It supports Pydantic validation, dependency injection, automatic OpenAPI docs, and clean API development with Python.

## Why PostgreSQL?

PostgreSQL is reliable and supports relational data well. This project has users, tickets, and comments with clear relationships, so PostgreSQL is a good fit.

## Why SQLAlchemy?

SQLAlchemy lets us work with database tables as Python classes. It also helps prevent SQL injection by generating parameterized SQL.

## Why Alembic?

Alembic tracks database schema changes. Instead of manually creating tables, we can run migrations and keep the database version controlled.

## Why JWT?

JWT allows stateless authentication. The server does not need to store sessions. The token proves the user is logged in and is sent with protected API requests.

## What is role-based access?

Role-based access means different users have different permissions. In this project, customers can manage only their own tickets, while admins can manage all tickets.

## How does admin resolve tickets?

The admin opens the ticket list, assigns the ticket if needed, changes its status to In Progress while working, and later changes it to Resolved or Closed.

## How are passwords protected?

Passwords are hashed with bcrypt before storing them in the database. The API never returns password hashes in responses.

## How is the project scalable?

The app uses PostgreSQL, connection pooling, stateless JWT authentication, indexed ticket fields, and pagination on admin ticket lists. These choices prevent common performance problems in a small multi-user app.

## What are future enhancements?

Possible improvements:
- Email notifications.
- File attachments.
- SLA timers.
- Customer satisfaction ratings.
- Admin team management.
- More charts and analytics.
- Unit and integration tests.
- Refresh tokens.
- Audit logs.
