# Security and Scalability

## JWT Security

ResolveX uses JSON Web Tokens for stateless authentication. After login, the backend returns an access token. The frontend sends it in the `Authorization` header for protected API calls.

Security notes:
- Tokens include the user id in the `sub` claim.
- Tokens expire based on `ACCESS_TOKEN_EXPIRE_MINUTES`.
- The signing secret is loaded from `.env`.
- Production should use a long random `SECRET_KEY`.

## Password Hashing

Plain passwords are never stored. During registration and seeding, passwords are hashed with bcrypt through Passlib. During login, the submitted password is verified against the stored hash.

API responses use `UserRead`, which does not include `hashed_password`.

## Role-Based Access

The system has two roles:
- `customer`
- `admin`

Rules:
- Customers can create tickets.
- Customers can view and comment only on their own tickets.
- Admins can view all tickets.
- Admins can update status, priority, and assignment.
- Admin routes use a `require_admin` dependency.

## Pydantic Validation

Request bodies are validated by Pydantic schemas. Examples:
- Email must be valid.
- Password has a minimum length.
- Ticket title and description have minimum lengths.
- Category, priority, and status must match allowed values.

## SQL Injection Protection

The app uses SQLAlchemy ORM and parameterized SQL generation. It does not build raw SQL strings from user input.

## Database Pooling

The backend creates the SQLAlchemy engine with:
- `pool_size`
- `max_overflow`
- `pool_pre_ping`

This allows the API to reuse PostgreSQL connections and detect stale connections.

## Pagination

The admin ticket list uses `page` and `page_size`. This prevents the API from returning every ticket at once when the database grows.

## Indexes

Tickets have indexes on:
- status
- priority
- category
- created_by_id
- assigned_to_id

These indexes support common dashboard and filtering queries.

## Why Many Users Will Not Immediately Crash the App

ResolveX has a realistic MVP architecture:
- Stateless JWT authentication avoids server-side session storage.
- PostgreSQL handles concurrent reads and writes.
- SQLAlchemy connection pooling limits and reuses database connections.
- Admin ticket lists are paginated.
- The frontend fetches only the data needed for each page.
- The API separates dependencies, routes, services, schemas, and models for maintainability.

This does not make the app enterprise-scale, but it is stable enough for a college MVP and a small demo team.

## Production Improvements

For production, improve the deployment with:
- A strong secret key from a secret manager.
- HTTPS-only hosting.
- Secure cookies or refresh tokens if longer sessions are needed.
- Rate limiting on login and registration.
- Centralized logging.
- Automated tests.
- Database backups.
- Managed PostgreSQL.
- Gunicorn with Uvicorn workers:

```bash
gunicorn -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:8000 --workers 4
```
