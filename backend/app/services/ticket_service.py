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
from app.services.notification_service import create_notifications


ACTIVE_STATUSES = (TicketStatus.OPEN, TicketStatus.IN_PROGRESS)
AGENT_ALLOWED_STATUSES = (TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED)
HIGH_ATTENTION_PRIORITIES = (TicketPriority.HIGH, TicketPriority.URGENT)


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


def _active_admin_ids(db: Session) -> list[int]:
    return list(
        db.scalars(
            select(User.id).where(
                User.role == UserRole.ADMIN,
                User.is_active.is_(True),
            )
        ).all()
    )


def _ticket_metadata(ticket: Ticket, actor: User | None = None, extra: dict[str, object] | None = None) -> dict[str, object]:
    metadata: dict[str, object] = {
        "action_text": "Open Query",
        "ticket_title": ticket.title,
    }
    if actor:
        metadata["actor_name"] = actor.full_name
    if extra:
        metadata.update(extra)
    return metadata


def _notify(
    db: Session,
    *,
    ticket: Ticket,
    actor: User | None,
    target_user_ids: list[int],
    notification_type: str,
    title: str,
    message: str,
    dedupe_seed: str,
    metadata: dict[str, object] | None = None,
) -> None:
    create_notifications(
        db,
        target_user_ids=target_user_ids,
        actor_id=actor.id if actor else None,
        ticket_id=ticket.id,
        notification_type=notification_type,
        title=title,
        message=message,
        dedupe_seed=dedupe_seed,
        metadata=_ticket_metadata(ticket, actor, metadata),
    )


def _notify_ticket_created(db: Session, ticket: Ticket, actor: User) -> None:
    seed = f"created:{ticket.id}"
    if ticket.assigned_to_id:
        _notify(
            db,
            ticket=ticket,
            actor=actor,
            target_user_ids=[ticket.assigned_to_id],
            notification_type="ticket_created",
            title="New student ticket assigned to you",
            message=f"New student ticket assigned to you: {ticket.title}",
            dedupe_seed=seed,
        )

    if ticket.assigned_to_id is None or ticket.priority in HIGH_ATTENTION_PRIORITIES:
        title = "New urgent ticket needs attention" if ticket.priority in HIGH_ATTENTION_PRIORITIES else "New placement support ticket created"
        _notify(
            db,
            ticket=ticket,
            actor=actor,
            target_user_ids=_active_admin_ids(db),
            notification_type="ticket_created",
            title=title,
            message=f"{actor.full_name} raised a placement support query: {ticket.title}",
            dedupe_seed=seed,
            metadata={"priority": ticket.priority.value},
        )


def _notify_assignment_changed(
    db: Session,
    ticket: Ticket,
    actor: User,
    old_assignee_id: int | None,
    new_assignee: User | None,
    event_time: datetime,
) -> None:
    if old_assignee_id == ticket.assigned_to_id:
        return

    seed = f"assignment:{ticket.assigned_to_id or 'none'}:{event_time.isoformat()}"
    if new_assignee:
        _notify(
            db,
            ticket=ticket,
            actor=actor,
            target_user_ids=[new_assignee.id],
            notification_type="assignment_changed",
            title="You have been assigned a new student ticket",
            message=f"You have been assigned a student ticket: {ticket.title}",
            dedupe_seed=seed,
            metadata={"assigned_to": new_assignee.full_name},
        )
        _notify(
            db,
            ticket=ticket,
            actor=actor,
            target_user_ids=[ticket.created_by_id],
            notification_type="assignment_changed",
            title="Your ticket has been assigned",
            message=f"Your ticket has been assigned to {new_assignee.full_name}: {ticket.title}",
            dedupe_seed=seed,
            metadata={"assigned_to": new_assignee.full_name},
        )
    else:
        _notify(
            db,
            ticket=ticket,
            actor=actor,
            target_user_ids=[ticket.created_by_id],
            notification_type="assignment_changed",
            title="Your ticket is awaiting a faculty coordinator",
            message=f"Your ticket is waiting for a faculty coordinator: {ticket.title}",
            dedupe_seed=seed,
        )

    if old_assignee_id and old_assignee_id != ticket.assigned_to_id:
        _notify(
            db,
            ticket=ticket,
            actor=actor,
            target_user_ids=[old_assignee_id],
            notification_type="assignment_changed",
            title="Ticket reassigned away from you",
            message=f"Ticket reassigned away from you: {ticket.title}",
            dedupe_seed=seed,
        )


def _notify_comment_added(db: Session, ticket: Ticket, comment: Comment, actor: User) -> None:
    seed = f"comment:{comment.id}"
    if actor.role == UserRole.CUSTOMER:
        if ticket.assigned_to_id:
            _notify(
                db,
                ticket=ticket,
                actor=actor,
                target_user_ids=[ticket.assigned_to_id],
                notification_type="comment_added",
                title="Student replied on your assigned ticket",
                message=f"Student replied on your assigned ticket: {ticket.title}",
                dedupe_seed=seed,
                metadata={"comment_id": comment.id},
            )
        if ticket.assigned_to_id is None or ticket.priority in HIGH_ATTENTION_PRIORITIES:
            _notify(
                db,
                ticket=ticket,
                actor=actor,
                target_user_ids=_active_admin_ids(db),
                notification_type="comment_added",
                title="Student reply needs placement cell attention",
                message=f"{actor.full_name} replied on an urgent or unassigned ticket: {ticket.title}",
                dedupe_seed=seed,
                metadata={"comment_id": comment.id, "priority": ticket.priority.value},
            )
        return

    if actor.role == UserRole.SUPPORT_AGENT:
        _notify(
            db,
            ticket=ticket,
            actor=actor,
            target_user_ids=[ticket.created_by_id],
            notification_type="comment_added",
            title="Faculty replied to your ticket",
            message=f"Faculty replied to your ticket: {ticket.title}",
            dedupe_seed=seed,
            metadata={"comment_id": comment.id},
        )
        return

    if actor.role == UserRole.ADMIN:
        _notify(
            db,
            ticket=ticket,
            actor=actor,
            target_user_ids=[ticket.created_by_id],
            notification_type="comment_added",
            title="Placement Head replied to your ticket",
            message=f"Placement Head replied to your ticket: {ticket.title}",
            dedupe_seed=seed,
            metadata={"comment_id": comment.id},
        )


def _notify_status_changed(
    db: Session,
    ticket: Ticket,
    actor: User,
    old_status: TicketStatus,
    event_time: datetime,
) -> None:
    if old_status == ticket.status:
        return

    seed = f"status:{ticket.status.value}:{event_time.isoformat()}"
    if ticket.status == TicketStatus.RESOLVED:
        _notify(
            db,
            ticket=ticket,
            actor=actor,
            target_user_ids=[ticket.created_by_id],
            notification_type="status_changed",
            title="Your ticket has been marked resolved",
            message=f"Your ticket has been marked resolved: {ticket.title}",
            dedupe_seed=seed,
            metadata={"status": ticket.status.value},
        )
        if ticket.priority in HIGH_ATTENTION_PRIORITIES:
            _notify(
                db,
                ticket=ticket,
                actor=actor,
                target_user_ids=_active_admin_ids(db),
                notification_type="status_changed",
                title="High-priority ticket resolved",
                message=f"A {ticket.priority.value.lower()} placement ticket was marked resolved: {ticket.title}",
                dedupe_seed=seed,
                metadata={"status": ticket.status.value, "priority": ticket.priority.value},
            )
    else:
        _notify(
            db,
            ticket=ticket,
            actor=actor,
            target_user_ids=[ticket.created_by_id],
            notification_type="status_changed",
            title=f"Your ticket status changed to {ticket.status.value}",
            message=f"Your ticket status changed to {ticket.status.value}: {ticket.title}",
            dedupe_seed=seed,
            metadata={"status": ticket.status.value},
        )

    if actor.role == UserRole.ADMIN and ticket.assigned_to_id:
        _notify(
            db,
            ticket=ticket,
            actor=actor,
            target_user_ids=[ticket.assigned_to_id],
            notification_type="status_changed",
            title=f"Ticket status changed to {ticket.status.value}",
            message=f"Ticket status changed to {ticket.status.value}: {ticket.title}",
            dedupe_seed=seed,
            metadata={"status": ticket.status.value},
        )


def _notify_priority_changed(
    db: Session,
    ticket: Ticket,
    actor: User,
    old_priority: TicketPriority,
    event_time: datetime,
) -> None:
    if old_priority == ticket.priority:
        return

    seed = f"priority:{ticket.priority.value}:{event_time.isoformat()}"
    if ticket.assigned_to_id:
        _notify(
            db,
            ticket=ticket,
            actor=actor,
            target_user_ids=[ticket.assigned_to_id],
            notification_type="priority_changed",
            title=f"Ticket priority changed to {ticket.priority.value}",
            message=f"Ticket priority changed to {ticket.priority.value}: {ticket.title}",
            dedupe_seed=seed,
            metadata={"priority": ticket.priority.value},
        )

    if ticket.priority in HIGH_ATTENTION_PRIORITIES:
        _notify(
            db,
            ticket=ticket,
            actor=actor,
            target_user_ids=[ticket.created_by_id],
            notification_type="priority_changed",
            title=f"Your ticket was marked {ticket.priority.value}",
            message=f"Your ticket was marked {ticket.priority.value}: {ticket.title}",
            dedupe_seed=seed,
            metadata={"priority": ticket.priority.value},
        )


def _notify_reassignment_requested(db: Session, request: TicketAssignmentRequest, actor: User) -> None:
    if not request.ticket:
        return
    _notify(
        db,
        ticket=request.ticket,
        actor=actor,
        target_user_ids=_active_admin_ids(db),
        notification_type="reassignment_requested",
        title="Faculty handover requested",
        message=f"Reassignment requested for: {request.ticket.title}",
        dedupe_seed=f"reassignment-requested:{request.id}",
        metadata={"reassignment_request_id": request.id},
    )


def _notify_reassignment_decision(
    db: Session,
    request: TicketAssignmentRequest,
    actor: User,
    new_assignee: User | None,
) -> None:
    if not request.ticket:
        return

    ticket = request.ticket
    seed = f"reassignment-decision:{request.id}:{request.status.value}"
    if request.status == AssignmentRequestStatus.APPROVED:
        _notify(
            db,
            ticket=ticket,
            actor=actor,
            target_user_ids=[request.requested_by_id],
            notification_type="reassignment_approved",
            title="Reassignment request approved",
            message=f"Your reassignment request was approved: {ticket.title}",
            dedupe_seed=seed,
            metadata={"reassignment_request_id": request.id},
        )
        if new_assignee:
            _notify(
                db,
                ticket=ticket,
                actor=actor,
                target_user_ids=[new_assignee.id],
                notification_type="assignment_changed",
                title="You have been assigned a reassigned ticket",
                message=f"You have been assigned a reassigned ticket: {ticket.title}",
                dedupe_seed=seed,
                metadata={"reassignment_request_id": request.id, "assigned_to": new_assignee.full_name},
            )
        _notify(
            db,
            ticket=ticket,
            actor=actor,
            target_user_ids=[ticket.created_by_id],
            notification_type="assignment_changed",
            title="Your ticket was moved to another faculty coordinator",
            message="Your ticket was moved to another faculty coordinator.",
            dedupe_seed=seed,
            metadata={"reassignment_request_id": request.id},
        )
        return

    if request.status == AssignmentRequestStatus.REJECTED:
        _notify(
            db,
            ticket=ticket,
            actor=actor,
            target_user_ids=[request.requested_by_id],
            notification_type="reassignment_rejected",
            title="Reassignment request rejected",
            message=f"Your reassignment request was rejected: {ticket.title}",
            dedupe_seed=seed,
            metadata={"reassignment_request_id": request.id},
        )


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
    event_time = _now()
    ticket = Ticket(
        title=payload.title.strip(),
        description=payload.description.strip(),
        category=payload.category,
        priority=payload.priority,
        status=TicketStatus.OPEN,
        created_by_id=current_user.id,
        assigned_to_id=assignee.id if assignee else None,
        updated_at=event_time,
    )
    db.add(ticket)
    db.flush()
    _notify_ticket_created(db, ticket, current_user)
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
    event_time = _now()
    attachments = [attachment.model_dump() for attachment in payload.attachments]
    comment = Comment(
        message=payload.message.strip(),
        attachments_json=json.dumps(attachments) if attachments else None,
        ticket_id=ticket.id,
        author_id=current_user.id,
    )
    ticket.updated_at = event_time
    db.add(comment)
    db.add(ticket)
    db.flush()
    _notify_comment_added(db, ticket, comment, current_user)
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


def update_ticket_status(db: Session, ticket: Ticket, current_user: User, new_status: TicketStatus) -> Ticket:
    old_status = ticket.status
    event_time = _now()
    _apply_status_transition(ticket, new_status)
    ticket.updated_at = event_time
    _notify_status_changed(db, ticket, current_user, old_status, event_time)
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
    return update_ticket_status(db, ticket, current_user, new_status)


def update_ticket_priority(db: Session, ticket: Ticket, current_user: User, new_priority: TicketPriority) -> Ticket:
    old_priority = ticket.priority
    event_time = _now()
    ticket.priority = new_priority
    ticket.updated_at = event_time
    _notify_priority_changed(db, ticket, current_user, old_priority, event_time)
    db.add(ticket)
    db.commit()
    return get_ticket_or_404(db, ticket.id)


def _get_support_agent_or_400(db: Session, assigned_to_id: int) -> User:
    target_agent = db.get(User, assigned_to_id)
    if not target_agent or target_agent.role != UserRole.SUPPORT_AGENT or not target_agent.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ticket can only be assigned to an active support agent")
    return target_agent


def assign_ticket(db: Session, ticket: Ticket, current_user: User, assigned_to_id: int | None = None) -> Ticket:
    old_assignee_id = ticket.assigned_to_id
    event_time = _now()
    target_agent = None
    if assigned_to_id is None:
        ticket.assigned_to_id = None
    else:
        target_agent = _get_support_agent_or_400(db, assigned_to_id)
        ticket.assigned_to_id = target_agent.id
    ticket.updated_at = event_time
    _notify_assignment_changed(db, ticket, current_user, old_assignee_id, target_agent, event_time)
    db.add(ticket)
    db.commit()
    return get_ticket_or_404(db, ticket.id)


def reassign_ticket(db: Session, ticket: Ticket, current_user: User, assigned_to_id: int) -> Ticket:
    return assign_ticket(db, ticket, current_user, assigned_to_id)


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
    db.flush()
    request = get_reassignment_request_or_404(db, request.id)
    _notify_reassignment_requested(db, request, current_user)
    db.commit()
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
    current_user: User,
) -> TicketAssignmentRequest:
    if request.status != AssignmentRequestStatus.PENDING:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Request has already been resolved")
    if payload.status not in (AssignmentRequestStatus.APPROVED, AssignmentRequestStatus.REJECTED):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Decision must be Approved or Rejected")

    new_assignee = None
    if payload.status == AssignmentRequestStatus.APPROVED:
        if payload.assigned_to_id is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Approved requests require a new assignee")
        ticket = get_ticket_or_404(db, request.ticket_id)
        new_assignee = _get_support_agent_or_400(db, payload.assigned_to_id)
        ticket.assigned_to_id = new_assignee.id
        ticket.updated_at = _now()
        db.add(ticket)

    request.status = payload.status
    request.admin_response = payload.admin_response.strip() if payload.admin_response else None
    request.resolved_at = _now()
    db.add(request)
    db.flush()
    request = get_reassignment_request_or_404(db, request.id)
    _notify_reassignment_decision(db, request, current_user, new_assignee)
    db.commit()
    return get_reassignment_request_or_404(db, request.id)
