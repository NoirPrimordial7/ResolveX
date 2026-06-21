from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.models.ticket import TicketCategory, TicketPriority, TicketStatus
from app.models.user import User
from app.models.assignment_request import AssignmentRequestStatus
from app.schemas.ticket import (
    AdminDashboardResponse,
    AdminDashboardStats,
    ReassignmentRequestDecision,
    ReassignmentRequestRead,
    TicketAssignUpdate,
    TicketListResponse,
    TicketPriorityUpdate,
    TicketRead,
    TicketReassignUpdate,
    TicketStatusUpdate,
)
from app.schemas.user import AgentWorkload, UserRead
from app.services.ticket_service import (
    assign_ticket,
    get_all_users,
    get_admin_dashboard,
    get_agent_workload,
    get_reassignment_request_or_404,
    get_ticket_or_404,
    list_admin_tickets,
    list_reassignment_requests,
    reassign_ticket,
    resolve_reassignment_request,
    update_ticket_priority,
    update_ticket_status,
)
from app.utils.dependencies import get_db, require_admin


router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/dashboard", response_model=AdminDashboardResponse)
def admin_dashboard(db: Session = Depends(get_db), _: User = Depends(require_admin)) -> AdminDashboardResponse:
    stats, recent_tickets, agent_workload = get_admin_dashboard(db)
    return AdminDashboardResponse(
        stats=AdminDashboardStats(**stats),
        recent_tickets=recent_tickets,
        agent_workload=[AgentWorkload(**item) for item in agent_workload],
    )


@router.get("/tickets", response_model=TicketListResponse)
def admin_tickets(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    search: str | None = Query(default=None, max_length=100),
    status: TicketStatus | None = Query(default=None),
    priority: TicketPriority | None = Query(default=None),
    category: TicketCategory | None = Query(default=None),
    assigned_to_id: int | None = Query(default=None),
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
        assigned_to_id=assigned_to_id,
    )
    return TicketListResponse(items=tickets, total=total, page=page, page_size=page_size)


@router.get("/users", response_model=list[UserRead])
def admin_users(db: Session = Depends(get_db), _: User = Depends(require_admin)) -> list[User]:
    return get_all_users(db)


@router.get("/agents", response_model=list[AgentWorkload])
def admin_agents(db: Session = Depends(get_db), _: User = Depends(require_admin)) -> list[AgentWorkload]:
    return [AgentWorkload(**item) for item in get_agent_workload(db)]


@router.patch("/tickets/{ticket_id}/status", response_model=TicketRead)
def change_ticket_status(
    ticket_id: int,
    payload: TicketStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    ticket = get_ticket_or_404(db, ticket_id)
    return update_ticket_status(db, ticket, current_user, payload.status)


@router.patch("/tickets/{ticket_id}/assign", response_model=TicketRead)
def assign_ticket_to_admin(
    ticket_id: int,
    payload: TicketAssignUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    ticket = get_ticket_or_404(db, ticket_id)
    return assign_ticket(db, ticket, current_user, payload.assigned_to_id)


@router.patch("/tickets/{ticket_id}/reassign", response_model=TicketRead)
def reassign_ticket_to_agent(
    ticket_id: int,
    payload: TicketReassignUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    ticket = get_ticket_or_404(db, ticket_id)
    return reassign_ticket(db, ticket, current_user, payload.assigned_to_id)


@router.patch("/tickets/{ticket_id}/priority", response_model=TicketRead)
def change_ticket_priority(
    ticket_id: int,
    payload: TicketPriorityUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    ticket = get_ticket_or_404(db, ticket_id)
    return update_ticket_priority(db, ticket, current_user, payload.priority)


@router.get("/reassignment-requests", response_model=list[ReassignmentRequestRead])
def admin_reassignment_requests(
    status: AssignmentRequestStatus | None = Query(default=None),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return list_reassignment_requests(db, status_filter=status)


@router.patch("/reassignment-requests/{request_id}", response_model=ReassignmentRequestRead)
def admin_resolve_reassignment_request(
    request_id: int,
    payload: ReassignmentRequestDecision,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    request = get_reassignment_request_or_404(db, request_id)
    return resolve_reassignment_request(db, request, payload, current_user)
