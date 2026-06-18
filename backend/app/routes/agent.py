from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.models.ticket import Ticket, TicketCategory, TicketPriority, TicketStatus
from app.models.user import User
from app.schemas.comment import CommentCreate, CommentRead
from app.schemas.ticket import (
    AgentDashboardResponse,
    AgentDashboardStats,
    ReassignmentRequestCreate,
    ReassignmentRequestRead,
    TicketDetail,
    TicketRead,
    TicketStatusUpdate,
)
from app.services.ticket_service import (
    add_comment,
    create_reassignment_request,
    ensure_agent_ticket_access,
    get_agent_dashboard,
    get_ticket_or_404,
    list_agent_tickets,
    update_agent_ticket_status,
)
from app.utils.dependencies import get_db, require_support_agent


router = APIRouter(prefix="/agent", tags=["Support Agent"])


@router.get("/dashboard", response_model=AgentDashboardResponse)
def agent_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_support_agent),
) -> AgentDashboardResponse:
    stats, recent_tickets = get_agent_dashboard(db, current_user)
    return AgentDashboardResponse(stats=AgentDashboardStats(**stats), recent_tickets=recent_tickets)


@router.get("/tickets", response_model=list[TicketRead])
def agent_tickets(
    status: TicketStatus | None = Query(default=None),
    priority: TicketPriority | None = Query(default=None),
    category: TicketCategory | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_support_agent),
) -> list[Ticket]:
    return list_agent_tickets(
        db,
        current_user,
        status_filter=status,
        priority=priority,
        category=category,
    )


@router.get("/tickets/{ticket_id}", response_model=TicketDetail)
def agent_ticket_details(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_support_agent),
) -> Ticket:
    ticket = get_ticket_or_404(db, ticket_id)
    ensure_agent_ticket_access(ticket, current_user)
    return ticket


@router.patch("/tickets/{ticket_id}/status", response_model=TicketRead)
def agent_update_ticket_status(
    ticket_id: int,
    payload: TicketStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_support_agent),
) -> Ticket:
    ticket = get_ticket_or_404(db, ticket_id)
    return update_agent_ticket_status(db, ticket, current_user, payload.status)


@router.post("/tickets/{ticket_id}/comments", response_model=CommentRead, status_code=201)
def agent_add_ticket_comment(
    ticket_id: int,
    payload: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_support_agent),
):
    ticket = get_ticket_or_404(db, ticket_id)
    ensure_agent_ticket_access(ticket, current_user)
    return add_comment(db, ticket, payload, current_user)


@router.post("/tickets/{ticket_id}/reassignment-requests", response_model=ReassignmentRequestRead, status_code=201)
def agent_request_reassignment(
    ticket_id: int,
    payload: ReassignmentRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_support_agent),
):
    ticket = get_ticket_or_404(db, ticket_id)
    return create_reassignment_request(db, ticket, payload, current_user)
