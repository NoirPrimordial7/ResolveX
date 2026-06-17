# ResolveX - Customer Support Ticket Management System

## Problem Statement

Many small teams manage customer problems through scattered emails, spreadsheets, or chat messages. This makes it hard to track who raised an issue, what priority it has, who is handling it, and whether the issue is resolved.

## Objective

ResolveX is a customer support ticket management web application. Customers can create tickets and comment on them. Admins can view all tickets, assign work, update priority, change status, and track dashboard counts.

## Target Users

- Customers who need help with technical, billing, account, general, or other issues.
- Support admins who manage customer requests.
- College project evaluators who need to understand a complete full-stack MVP.

## Why This Project Is Useful

ResolveX solves a practical CRM problem with real product features: authentication, role-based access, ticket workflows, comments, dashboards, filters, and database-backed reporting. It is realistic enough to demonstrate software engineering concepts without becoming too large for a 2-day MVP.

## Tech Stack

Backend:
- FastAPI for API development.
- SQLAlchemy ORM for database access.
- PostgreSQL for persistent storage.
- Alembic for migrations.
- JWT for stateless authentication.
- bcrypt hashing through Passlib for password security.
- Pydantic for request and response validation.

Frontend:
- React with Vite.
- TypeScript for safer UI code.
- Tailwind CSS for responsive styling.
- React Router for page navigation.
- Axios for API calls.

Deployment and setup:
- Docker Compose for PostgreSQL, backend, and frontend.
- `.env.example` files for environment configuration.
