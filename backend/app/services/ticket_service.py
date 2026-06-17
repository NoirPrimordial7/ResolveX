from sqlalchemy import Select, and_, func, or_, select
from sqlalchemy.orm import Session, selectinload
from fastapi import HTTPException, status

from app.models.comment import Comment
from app.models.ticket import Ticket, TicketCategory, TicketPriority, TicketStatus
from app.models.user import User, UserRole
from app.schemas.comment import CommentCreate
from app.schemas.ticket import TicketCreate


def _ticket_options():
    return (
        selectinload(Ticket.created_by),
        selectinload(Ticket.assigned_to),
        selectinload(Ticket.comments).selectinload(Comment.author),
    )


def create_ticket(db: Session, payload: TicketCreate, current_user: User) -> Ticket:
    ticket = Ticket(
        title=payload.title.strip(),
        description=payload.description.strip(),
        category=payload.category,
        priority=payload.priority,
        created_by_id=current_user.id,
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return get_ticket_or_404(db, ticket.id)


def get_ticket_or_404(db: Session, ticket_id: int) -> Ticket:
    ticket = db.scalar(select(Ticket).options(*_ticket_options()).where(Ticket.id == ticket_id))
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")
    return ticket


def ensure_ticket_access(ticket: Ticket, current_user: User) -> None:
    if current_user.role == UserRole.ADMIN:
        return
    if ticket.created_by_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only access your own tickets")


def list_customer_tickets(db: Session, current_user: User, status_filter: TicketStatus | None = None) -> list[Ticket]:
    query = (
        select(Ticket)
        .options(*_ticket_options())
        .where(Ticket.created_by_id == current_user.id)
        .order_by(Ticket.created_at.desc())
    )
    if status_filter:
        query = query.where(Ticket.status == status_filter)
    return list(db.scalars(query).all())


def add_comment(db: Session, ticket: Ticket, payload: CommentCreate, current_user: User) -> Comment:
    comment = Comment(message=payload.message.strip(), ticket_id=ticket.id, author_id=current_user.id)
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return db.scalar(select(Comment).options(selectinload(Comment.author)).where(Comment.id == comment.id))


def _apply_admin_filters(
    query: Select[tuple[Ticket]] | Select[tuple[int]],
    search: str | None,
    status_filter: TicketStatus | None,
    priority: TicketPriority | None,
    category: TicketCategory | None,
) -> Select[tuple[Ticket]] | Select[tuple[int]]:
    filters = []
    if search:
        pattern = f"%{search.strip()}%"
        filters.append(or_(Ticket.title.ilike(pattern), Ticket.description.ilike(pattern)))
    if status_filter:
        filters.append(Ticket.status == status_filter)
    if priority:
        filters.append(Ticket.priority == priority)
    if category:
        filters.append(Ticket.category == category)
    if filters:
        query = query.where(and_(*filters))
    return query


def list_admin_tickets(
    db: Session,
    page: int,
    page_size: int,
    search: str | None = None,
    status_filter: TicketStatus | None = None,
    priority: TicketPriority | None = None,
    category: TicketCategory | None = None,
) -> tuple[list[Ticket], int]:
    base_query = select(Ticket).options(*_ticket_options())
    count_query = select(func.count(Ticket.id))

    base_query = _apply_admin_filters(base_query, search, status_filter, priority, category)
    count_query = _apply_admin_filters(count_query, search, status_filter, priority, category)

    total = db.scalar(count_query) or 0
    tickets = list(
        db.scalars(
            base_query.order_by(Ticket.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
        ).all()
    )
    return tickets, total


def get_admin_dashboard(db: Session) -> tuple[dict[str, int], list[Ticket]]:
    total_tickets = db.scalar(select(func.count(Ticket.id))) or 0
    open_tickets = db.scalar(select(func.count(Ticket.id)).where(Ticket.status == TicketStatus.OPEN)) or 0
    in_progress_tickets = (
        db.scalar(select(func.count(Ticket.id)).where(Ticket.status == TicketStatus.IN_PROGRESS)) or 0
    )
    resolved_tickets = db.scalar(select(func.count(Ticket.id)).where(Ticket.status == TicketStatus.RESOLVED)) or 0
    high_priority_tickets = db.scalar(select(func.count(Ticket.id)).where(Ticket.priority == TicketPriority.HIGH)) or 0
    recent_tickets = list(
        db.scalars(
            select(Ticket).options(*_ticket_options()).order_by(Ticket.created_at.desc()).limit(6)
        ).all()
    )

    stats = {
        "total_tickets": total_tickets,
        "open_tickets": open_tickets,
        "in_progress_tickets": in_progress_tickets,
        "resolved_tickets": resolved_tickets,
        "high_priority_tickets": high_priority_tickets,
    }
    return stats, recent_tickets


def update_ticket_status(db: Session, ticket: Ticket, new_status: TicketStatus) -> Ticket:
    ticket.status = new_status
    db.add(ticket)
    db.commit()
    return get_ticket_or_404(db, ticket.id)


def update_ticket_priority(db: Session, ticket: Ticket, new_priority: TicketPriority) -> Ticket:
    ticket.priority = new_priority
    db.add(ticket)
    db.commit()
    return get_ticket_or_404(db, ticket.id)


def assign_ticket(db: Session, ticket: Ticket, admin_user: User, assigned_to_id: int | None = None) -> Ticket:
    target_admin_id = assigned_to_id or admin_user.id
    target_admin = db.get(User, target_admin_id)
    if not target_admin or target_admin.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ticket can only be assigned to an admin")

    ticket.assigned_to_id = target_admin.id
    db.add(ticket)
    db.commit()
    return get_ticket_or_404(db, ticket.id)
