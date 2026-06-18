import json
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import Select, and_, func, or_, select
from sqlalchemy.orm import Session, selectinload

from app.models.assignment_request import AssignmentRequestStatus, TicketAssignmentRequest
from app.models.comment import Comment
from app.models.ticket import Ticket, TicketCategory, TicketPriority, TicketStatus
from app.models.user import User, UserRole
from app.schemas.comment import CommentCreate
from app.schemas.ticket import ReassignmentRequestCreate, ReassignmentRequestDecision, TicketCreate


ACTIVE_STATUSES = (TicketStatus.OPEN, TicketStatus.IN_PROGRESS)
AGENT_ALLOWED_STATUSES = (TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED)


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _ticket_options():
    return (
        selectinload(Ticket.created_by),
        selectinload(Ticket.assigned_to),
        selectinload(Ticket.comments).selectinload(Comment.author),
    )


def _assignment_request_options():
    return (
        selectinload(TicketAssignmentRequest.ticket).selectinload(Ticket.created_by),
        selectinload(TicketAssignmentRequest.ticket).selectinload(Ticket.assigned_to),
        selectinload(TicketAssignmentRequest.requested_by),
        selectinload(TicketAssignmentRequest.current_assignee),
    )


def _ticket_count_for_agent(db: Session, agent_id: int, statuses: tuple[TicketStatus, ...] | None = None) -> int:
    query = select(func.count(Ticket.id)).where(Ticket.assigned_to_id == agent_id)
    if statuses:
        query = query.where(Ticket.status.in_(statuses))
    return db.scalar(query) or 0


def get_agent_workload(db: Session) -> list[dict[str, int | str]]:
    agents = list(
        db.scalars(
            select(User)
            .where(User.role == UserRole.SUPPORT_AGENT, User.is_active.is_(True))
            .order_by(User.full_name.asc())
        ).all()
    )
    return [
        {
            "id": agent.id,
            "name": agent.full_name,
            "full_name": agent.full_name,
            "email": agent.email,
            "avatar_url": agent.avatar_url,
            "active_ticket_count": _ticket_count_for_agent(db, agent.id, ACTIVE_STATUSES),
            "open_ticket_count": _ticket_count_for_agent(db, agent.id, (TicketStatus.OPEN,)),
            "in_progress_ticket_count": _ticket_count_for_agent(db, agent.id, (TicketStatus.IN_PROGRESS,)),
            "resolved_ticket_count": _ticket_count_for_agent(db, agent.id, (TicketStatus.RESOLVED,)),
        }
        for agent in agents
    ]


def get_support_agents(db: Session) -> list[User]:
    return list(
        db.scalars(
            select(User)
            .where(User.role == UserRole.SUPPORT_AGENT, User.is_active.is_(True))
            .order_by(User.full_name.asc())
        ).all()
    )


def get_all_users(db: Session) -> list[User]:
    return list(db.scalars(select(User).order_by(User.created_at.desc())).all())


def _get_least_loaded_agent(db: Session) -> User | None:
    agents = get_support_agents(db)
    if not agents:
        return None
    return min(agents, key=lambda agent: (_ticket_count_for_agent(db, agent.id, ACTIVE_STATUSES), agent.id))


def create_ticket(db: Session, payload: TicketCreate, current_user: User) -> Ticket:
    assignee = _get_least_loaded_agent(db)
    ticket = Ticket(
        title=payload.title.strip(),
        description=payload.description.strip(),
        category=payload.category,
        priority=payload.priority,
        status=TicketStatus.OPEN,
        created_by_id=current_user.id,
        assigned_to_id=assignee.id if assignee else None,
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
    if current_user.role == UserRole.CUSTOMER and ticket.created_by_id == current_user.id:
        return
    if current_user.role == UserRole.SUPPORT_AGENT and ticket.assigned_to_id == current_user.id:
        return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Ticket access denied")


def ensure_agent_ticket_access(ticket: Ticket, current_user: User) -> None:
    if current_user.role != UserRole.SUPPORT_AGENT or ticket.assigned_to_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Ticket is not assigned to this agent")


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


def list_agent_tickets(
    db: Session,
    current_user: User,
    status_filter: TicketStatus | None = None,
    priority: TicketPriority | None = None,
    category: TicketCategory | None = None,
) -> list[Ticket]:
    query = (
        select(Ticket)
        .options(*_ticket_options())
        .where(Ticket.assigned_to_id == current_user.id)
        .order_by(Ticket.updated_at.desc(), Ticket.created_at.desc())
    )
    if status_filter:
        query = query.where(Ticket.status == status_filter)
    if priority:
        query = query.where(Ticket.priority == priority)
    if category:
        query = query.where(Ticket.category == category)
    return list(db.scalars(query).all())


def get_agent_dashboard(db: Session, current_user: User) -> tuple[dict[str, int], list[Ticket]]:
    tickets = list_agent_tickets(db, current_user)
    stats = {
        "assigned_tickets": len(tickets),
        "open_assigned_tickets": len([ticket for ticket in tickets if ticket.status == TicketStatus.OPEN]),
        "in_progress_assigned_tickets": len(
            [ticket for ticket in tickets if ticket.status == TicketStatus.IN_PROGRESS]
        ),
        "resolved_tickets": len([ticket for ticket in tickets if ticket.status == TicketStatus.RESOLVED]),
    }
    return stats, tickets[:6]


def add_comment(db: Session, ticket: Ticket, payload: CommentCreate, current_user: User) -> Comment:
    attachments = [attachment.model_dump() for attachment in payload.attachments]
    comment = Comment(
        message=payload.message.strip(),
        attachments_json=json.dumps(attachments) if attachments else None,
        ticket_id=ticket.id,
        author_id=current_user.id,
    )
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
    assigned_to_id: int | None,
) -> Select[tuple[Ticket]] | Select[tuple[int]]:
    filters = []
    if search:
        pattern = f"%{search.strip()}%"
        filters.append(or_(Ticket.title.ilike(pattern), Ticket.description.ilike(pattern), User.full_name.ilike(pattern)))
    if status_filter:
        filters.append(Ticket.status == status_filter)
    if priority:
        filters.append(Ticket.priority == priority)
    if category:
        filters.append(Ticket.category == category)
    if assigned_to_id:
        filters.append(Ticket.assigned_to_id == assigned_to_id)
    if filters:
        query = query.join(Ticket.created_by).where(and_(*filters))
    return query


def list_admin_tickets(
    db: Session,
    page: int,
    page_size: int,
    search: str | None = None,
    status_filter: TicketStatus | None = None,
    priority: TicketPriority | None = None,
    category: TicketCategory | None = None,
    assigned_to_id: int | None = None,
) -> tuple[list[Ticket], int]:
    base_query = select(Ticket).options(*_ticket_options())
    count_query = select(func.count(Ticket.id))

    base_query = _apply_admin_filters(base_query, search, status_filter, priority, category, assigned_to_id)
    count_query = _apply_admin_filters(count_query, search, status_filter, priority, category, assigned_to_id)

    total = db.scalar(count_query) or 0
    tickets = list(
        db.scalars(
            base_query.order_by(Ticket.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
        ).all()
    )
    return tickets, total


def get_admin_dashboard(db: Session) -> tuple[dict[str, int], list[Ticket], list[dict[str, int | str]]]:
    total_tickets = db.scalar(select(func.count(Ticket.id))) or 0
    open_tickets = db.scalar(select(func.count(Ticket.id)).where(Ticket.status == TicketStatus.OPEN)) or 0
    in_progress_tickets = (
        db.scalar(select(func.count(Ticket.id)).where(Ticket.status == TicketStatus.IN_PROGRESS)) or 0
    )
    resolved_tickets = db.scalar(select(func.count(Ticket.id)).where(Ticket.status == TicketStatus.RESOLVED)) or 0
    closed_tickets = db.scalar(select(func.count(Ticket.id)).where(Ticket.status == TicketStatus.CLOSED)) or 0
    high_priority_tickets = db.scalar(select(func.count(Ticket.id)).where(Ticket.priority == TicketPriority.HIGH)) or 0
    unassigned_tickets = db.scalar(select(func.count(Ticket.id)).where(Ticket.assigned_to_id.is_(None))) or 0
    pending_reassignment_requests = (
        db.scalar(
            select(func.count(TicketAssignmentRequest.id)).where(
                TicketAssignmentRequest.status == AssignmentRequestStatus.PENDING
            )
        )
        or 0
    )
    recent_tickets = list(
        db.scalars(select(Ticket).options(*_ticket_options()).order_by(Ticket.created_at.desc()).limit(6)).all()
    )

    stats = {
        "total_tickets": total_tickets,
        "open_tickets": open_tickets,
        "in_progress_tickets": in_progress_tickets,
        "resolved_tickets": resolved_tickets,
        "closed_tickets": closed_tickets,
        "unassigned_tickets": unassigned_tickets,
        "pending_reassignment_requests": pending_reassignment_requests,
        "high_priority_tickets": high_priority_tickets,
    }
    return stats, recent_tickets, get_agent_workload(db)


def _apply_status_transition(ticket: Ticket, new_status: TicketStatus) -> None:
    ticket.status = new_status
    ticket.resolved_at = _now() if new_status == TicketStatus.RESOLVED else None


def update_ticket_status(db: Session, ticket: Ticket, new_status: TicketStatus) -> Ticket:
    _apply_status_transition(ticket, new_status)
    db.add(ticket)
    db.commit()
    return get_ticket_or_404(db, ticket.id)


def update_agent_ticket_status(db: Session, ticket: Ticket, current_user: User, new_status: TicketStatus) -> Ticket:
    ensure_agent_ticket_access(ticket, current_user)
    if new_status not in AGENT_ALLOWED_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Support agents can only move tickets to In Progress or Resolved",
        )
    return update_ticket_status(db, ticket, new_status)


def update_ticket_priority(db: Session, ticket: Ticket, new_priority: TicketPriority) -> Ticket:
    ticket.priority = new_priority
    db.add(ticket)
    db.commit()
    return get_ticket_or_404(db, ticket.id)


def _get_support_agent_or_400(db: Session, assigned_to_id: int) -> User:
    target_agent = db.get(User, assigned_to_id)
    if not target_agent or target_agent.role != UserRole.SUPPORT_AGENT or not target_agent.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ticket can only be assigned to an active support agent")
    return target_agent


def assign_ticket(db: Session, ticket: Ticket, assigned_to_id: int | None = None) -> Ticket:
    if assigned_to_id is None:
        ticket.assigned_to_id = None
    else:
        target_agent = _get_support_agent_or_400(db, assigned_to_id)
        ticket.assigned_to_id = target_agent.id
    db.add(ticket)
    db.commit()
    return get_ticket_or_404(db, ticket.id)


def reassign_ticket(db: Session, ticket: Ticket, assigned_to_id: int) -> Ticket:
    return assign_ticket(db, ticket, assigned_to_id)


def create_reassignment_request(
    db: Session,
    ticket: Ticket,
    payload: ReassignmentRequestCreate,
    current_user: User,
) -> TicketAssignmentRequest:
    ensure_agent_ticket_access(ticket, current_user)
    existing_pending = db.scalar(
        select(TicketAssignmentRequest).where(
            TicketAssignmentRequest.ticket_id == ticket.id,
            TicketAssignmentRequest.requested_by_id == current_user.id,
            TicketAssignmentRequest.status == AssignmentRequestStatus.PENDING,
        )
    )
    if existing_pending:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A pending reassignment request already exists")

    request = TicketAssignmentRequest(
        ticket_id=ticket.id,
        requested_by_id=current_user.id,
        current_assignee_id=ticket.assigned_to_id,
        reason=payload.reason.strip(),
        status=AssignmentRequestStatus.PENDING,
    )
    db.add(request)
    db.commit()
    db.refresh(request)
    return get_reassignment_request_or_404(db, request.id)


def get_reassignment_request_or_404(db: Session, request_id: int) -> TicketAssignmentRequest:
    request = db.scalar(
        select(TicketAssignmentRequest)
        .options(*_assignment_request_options())
        .where(TicketAssignmentRequest.id == request_id)
    )
    if not request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reassignment request not found")
    return request


def list_reassignment_requests(
    db: Session,
    status_filter: AssignmentRequestStatus | None = None,
) -> list[TicketAssignmentRequest]:
    query = select(TicketAssignmentRequest).options(*_assignment_request_options()).order_by(
        TicketAssignmentRequest.created_at.desc()
    )
    if status_filter:
        query = query.where(TicketAssignmentRequest.status == status_filter)
    return list(db.scalars(query).all())


def resolve_reassignment_request(
    db: Session,
    request: TicketAssignmentRequest,
    payload: ReassignmentRequestDecision,
) -> TicketAssignmentRequest:
    if request.status != AssignmentRequestStatus.PENDING:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Request has already been resolved")
    if payload.status not in (AssignmentRequestStatus.APPROVED, AssignmentRequestStatus.REJECTED):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Decision must be Approved or Rejected")

    if payload.status == AssignmentRequestStatus.APPROVED:
        if payload.assigned_to_id is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Approved requests require a new assignee")
        ticket = get_ticket_or_404(db, request.ticket_id)
        reassign_ticket(db, ticket, payload.assigned_to_id)

    request.status = payload.status
    request.admin_response = payload.admin_response.strip() if payload.admin_response else None
    request.resolved_at = _now()
    db.add(request)
    db.commit()
    return get_reassignment_request_or_404(db, request.id)
