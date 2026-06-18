# API Reference

Base URL:

```text
http://localhost:8000/api
```

Authentication uses a JWT bearer token:

```text
Authorization: Bearer <access_token>
```

Roles:
- `customer`
- `support_agent`
- `admin`

## Auth

### POST `/auth/register`

Public customer registration only. Admins and support agents are created with server-side scripts.

```json
{
  "full_name": "Demo Customer",
  "email": "customer@example.com",
  "password": "Customer@123"
}
```

### POST `/auth/login`

```json
{
  "email": "admin@resolvex.com",
  "password": "Admin@123"
}
```

### GET `/auth/me`

Returns the current user, including `role`, `name`, `full_name`, `created_at`, and `updated_at`.

## Customer

### POST `/tickets`

Access: customer only. Tickets start as `Open` and are auto-assigned to the active support agent with the fewest active tickets when an agent exists.

```json
{
  "title": "Payment failed",
  "description": "My payment was deducted but the invoice still shows unpaid.",
  "category": "Billing",
  "priority": "High"
}
```

### GET `/tickets/my`

Access: customer only.

Query:
- `status`: optional Open, In Progress, Resolved, or Closed.

### GET `/tickets/{ticket_id}`

Access: customer who created the ticket, assigned support agent, or admin.

### POST `/tickets/{ticket_id}/comments`

Access: customer who created the ticket, assigned support agent, or admin.

```json
{
  "message": "Please check this as soon as possible."
}
```

## Support Agent

### GET `/agent/dashboard`

Access: support agent only.

Returns assigned, open assigned, in-progress assigned, resolved counts, and recent assigned tickets.

### GET `/agent/tickets`

Access: support agent only.

Query:
- `status`
- `priority`
- `category`

### GET `/agent/tickets/{ticket_id}`

Access: assigned support agent only.

### PATCH `/agent/tickets/{ticket_id}/status`

Access: assigned support agent only.

Allowed status transitions for agents:
- `In Progress`
- `Resolved`

```json
{
  "status": "In Progress"
}
```

### POST `/agent/tickets/{ticket_id}/comments`

Access: assigned support agent only.

### POST `/agent/tickets/{ticket_id}/reassignment-requests`

Access: assigned support agent only.

```json
{
  "reason": "This ticket requires a billing specialist."
}
```

## Admin

### GET `/admin/dashboard`

Access: admin only.

Returns ticket stats, recent tickets, pending reassignment count, unassigned tickets, and agent workload.

### GET `/admin/tickets`

Access: admin only.

Query:
- `page`
- `page_size`
- `search`
- `status`
- `priority`
- `category`
- `assigned_to_id`

### GET `/admin/users`

Access: admin only. Returns all users.

### GET `/admin/agents`

Access: admin only. Returns support agents with active, open, in-progress, and resolved ticket counts.

### PATCH `/admin/tickets/{ticket_id}/assign`

Access: admin only. Assigns or unassigns a ticket.

```json
{
  "assigned_to_id": 3
}
```

Use `null` to leave the ticket unassigned.

### PATCH `/admin/tickets/{ticket_id}/reassign`

Access: admin only. Requires a support agent id.

```json
{
  "assigned_to_id": 4
}
```

### PATCH `/admin/tickets/{ticket_id}/priority`

Access: admin only.

```json
{
  "priority": "Urgent"
}
```

### PATCH `/admin/tickets/{ticket_id}/status`

Access: admin only. Admin can set Open, In Progress, Resolved, or Closed.

### GET `/admin/reassignment-requests`

Access: admin only.

Query:
- `status`: optional Pending, Approved, or Rejected.

### PATCH `/admin/reassignment-requests/{request_id}`

Access: admin only.

Approve:

```json
{
  "status": "Approved",
  "assigned_to_id": 4,
  "admin_response": "Reassigned to billing support."
}
```

Reject:

```json
{
  "status": "Rejected",
  "admin_response": "Current agent should continue handling this ticket."
}
```

## Error Format

FastAPI returns readable JSON errors:

```json
{
  "detail": "Admin access required"
}
```
