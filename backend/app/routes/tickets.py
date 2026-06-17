from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.models.ticket import Ticket, TicketStatus
from app.models.user import User
from app.schemas.comment import CommentCreate, CommentRead
from app.schemas.ticket import TicketCreate, TicketDetail, TicketRead
from app.services.ticket_service import (
    add_comment,
    create_ticket,
    ensure_ticket_access,
    get_ticket_or_404,
    list_customer_tickets,
)
from app.utils.dependencies import get_current_user, get_db, require_customer


router = APIRouter(prefix="/tickets", tags=["Tickets"])


@router.post("", response_model=TicketDetail, status_code=201)
def create_support_ticket(
    payload: TicketCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_customer),
) -> Ticket:
    return create_ticket(db, payload, current_user)


@router.get("/my", response_model=list[TicketRead])
def my_tickets(
    status: TicketStatus | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_customer),
) -> list[Ticket]:
    return list_customer_tickets(db, current_user, status_filter=status)


@router.get("/{ticket_id}", response_model=TicketDetail)
def ticket_details(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Ticket:
    ticket = get_ticket_or_404(db, ticket_id)
    ensure_ticket_access(ticket, current_user)
    return ticket


@router.post("/{ticket_id}/comments", response_model=CommentRead, status_code=201)
def create_ticket_comment(
    ticket_id: int,
    payload: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ticket = get_ticket_or_404(db, ticket_id)
    ensure_ticket_access(ticket, current_user)
    return add_comment(db, ticket, payload, current_user)
