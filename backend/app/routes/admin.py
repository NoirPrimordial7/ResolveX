from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.models.ticket import TicketCategory, TicketPriority, TicketStatus
from app.models.user import User
from app.schemas.ticket import (
    AdminDashboardResponse,
    AdminDashboardStats,
    TicketAssignUpdate,
    TicketListResponse,
    TicketPriorityUpdate,
    TicketRead,
    TicketStatusUpdate,
)
from app.services.ticket_service import (
    assign_ticket,
    get_admin_dashboard,
    get_ticket_or_404,
    list_admin_tickets,
    update_ticket_priority,
    update_ticket_status,
)
from app.utils.dependencies import get_db, require_admin


router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/dashboard", response_model=AdminDashboardResponse)
def admin_dashboard(db: Session = Depends(get_db), _: User = Depends(require_admin)) -> AdminDashboardResponse:
    stats, recent_tickets = get_admin_dashboard(db)
    return AdminDashboardResponse(stats=AdminDashboardStats(**stats), recent_tickets=recent_tickets)


@router.get("/tickets", response_model=TicketListResponse)
def admin_tickets(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    search: str | None = Query(default=None, max_length=100),
    status: TicketStatus | None = Query(default=None),
    priority: TicketPriority | None = Query(default=None),
    category: TicketCategory | None = Query(default=None),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> TicketListResponse:
    tickets, total = list_admin_tickets(
        db=db,
        page=page,
        page_size=page_size,
        search=search,
        status_filter=status,
        priority=priority,
        category=category,
    )
    return TicketListResponse(items=tickets, total=total, page=page, page_size=page_size)


@router.patch("/tickets/{ticket_id}/status", response_model=TicketRead)
def change_ticket_status(
    ticket_id: int,
    payload: TicketStatusUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    ticket = get_ticket_or_404(db, ticket_id)
    return update_ticket_status(db, ticket, payload.status)


@router.patch("/tickets/{ticket_id}/assign", response_model=TicketRead)
def assign_ticket_to_admin(
    ticket_id: int,
    payload: TicketAssignUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    ticket = get_ticket_or_404(db, ticket_id)
    return assign_ticket(db, ticket, current_admin, payload.assigned_to_id)


@router.patch("/tickets/{ticket_id}/priority", response_model=TicketRead)
def change_ticket_priority(
    ticket_id: int,
    payload: TicketPriorityUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    ticket = get_ticket_or_404(db, ticket_id)
    return update_ticket_priority(db, ticket, payload.priority)
