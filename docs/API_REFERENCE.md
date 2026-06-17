# API Reference

Base URL:

```text
http://localhost:8000/api
```

Authentication uses a JWT bearer token:

```text
Authorization: Bearer <access_token>
```

## Auth

### POST `/auth/register`

Access: Public customer registration.

Request:

```json
{
  "full_name": "Demo Customer",
  "email": "customer@example.com",
  "password": "Customer@123"
}
```

Response:

```json
{
  "id": 2,
  "full_name": "Demo Customer",
  "email": "customer@example.com",
  "role": "customer",
  "is_active": true,
  "created_at": "2026-06-17T10:00:00Z"
}
```

### POST `/auth/login`

Access: Public.

Request:

```json
{
  "email": "admin@resolvex.com",
  "password": "Admin@123"
}
```

Response:

```json
{
  "access_token": "jwt-token-here",
  "token_type": "bearer"
}
```

### GET `/auth/me`

Access: Authenticated users.

Response:

```json
{
  "id": 1,
  "full_name": "ResolveX Admin",
  "email": "admin@resolvex.com",
  "role": "admin",
  "is_active": true,
  "created_at": "2026-06-17T10:00:00Z"
}
```

## Customer Tickets

### POST `/tickets`

Access: Customer only.

Request:

```json
{
  "title": "Payment failed",
  "description": "My payment was deducted but the invoice still shows unpaid.",
  "category": "Billing",
  "priority": "High"
}
```

Response: ticket details with creator, optional assignee, and comments.

### GET `/tickets/my`

Access: Customer only.

Query params:
- `status`: optional. Open, In Progress, Resolved, or Closed.

Response:

```json
[
  {
    "id": 1,
    "title": "Payment failed",
    "description": "My payment was deducted but the invoice still shows unpaid.",
    "category": "Billing",
    "priority": "High",
    "status": "Open",
    "created_by": {
      "id": 2,
      "full_name": "Demo Customer",
      "email": "customer@resolvex.com",
      "role": "customer",
      "is_active": true,
      "created_at": "2026-06-17T10:00:00Z"
    },
    "assigned_to": null,
    "created_at": "2026-06-17T10:00:00Z",
    "updated_at": "2026-06-17T10:00:00Z"
  }
]
```

### GET `/tickets/{ticket_id}`

Access:
- Customer can access own tickets only.
- Admin can access all tickets.

Response: ticket details with comments.

### POST `/tickets/{ticket_id}/comments`

Access:
- Customer can comment on own tickets only.
- Admin can comment on any ticket.

Request:

```json
{
  "message": "Please check this as soon as possible."
}
```

Response:

```json
{
  "id": 1,
  "message": "Please check this as soon as possible.",
  "created_at": "2026-06-17T10:15:00Z",
  "author": {
    "id": 2,
    "full_name": "Demo Customer",
    "email": "customer@resolvex.com",
    "role": "customer",
    "is_active": true,
    "created_at": "2026-06-17T10:00:00Z"
  }
}
```

## Admin

### GET `/admin/dashboard`

Access: Admin only.

Response:

```json
{
  "stats": {
    "total_tickets": 10,
    "open_tickets": 4,
    "in_progress_tickets": 3,
    "resolved_tickets": 2,
    "high_priority_tickets": 1
  },
  "recent_tickets": []
}
```

### GET `/admin/tickets`

Access: Admin only.

Query params:
- `page`: default 1.
- `page_size`: default 10, max 100.
- `search`: optional title or description search.
- `status`: optional status.
- `priority`: optional priority.
- `category`: optional category.

Response:

```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "page_size": 10
}
```

### PATCH `/admin/tickets/{ticket_id}/status`

Access: Admin only.

Request:

```json
{
  "status": "In Progress"
}
```

Response: updated ticket.

### PATCH `/admin/tickets/{ticket_id}/assign`

Access: Admin only.

Request:

```json
{
  "assigned_to_id": null
}
```

If `assigned_to_id` is null or omitted, the ticket is assigned to the current admin.

Response: updated ticket.

### PATCH `/admin/tickets/{ticket_id}/priority`

Access: Admin only.

Request:

```json
{
  "priority": "Urgent"
}
```

Response: updated ticket.

## Error Format

FastAPI returns readable JSON errors:

```json
{
  "detail": "Admin access required"
}
```
