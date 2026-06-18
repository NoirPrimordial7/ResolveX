from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.assignment_request import AssignmentRequestStatus
from app.models.ticket import TicketCategory, TicketPriority, TicketStatus
from app.schemas.comment import CommentRead
from app.schemas.user import AgentWorkload, UserRead


class TicketCreate(BaseModel):
    title: str = Field(min_length=3, max_length=180)
    description: str = Field(min_length=10, max_length=5000)
    category: TicketCategory
    priority: TicketPriority = TicketPriority.MEDIUM


class TicketRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str
    category: TicketCategory
    priority: TicketPriority
    status: TicketStatus
    created_by: UserRead
    assigned_to: UserRead | None
    created_at: datetime
    updated_at: datetime
    resolved_at: datetime | None


class TicketDetail(TicketRead):
    comments: list[CommentRead] = Field(default_factory=list)


class TicketListResponse(BaseModel):
    items: list[TicketRead]
    total: int
    page: int
    page_size: int


class TicketStatusUpdate(BaseModel):
    status: TicketStatus


class TicketPriorityUpdate(BaseModel):
    priority: TicketPriority


class TicketAssignUpdate(BaseModel):
    assigned_to_id: int | None = None


class TicketReassignUpdate(BaseModel):
    assigned_to_id: int


class ReassignmentRequestCreate(BaseModel):
    reason: str = Field(min_length=5, max_length=2000)


class ReassignmentRequestDecision(BaseModel):
    status: AssignmentRequestStatus
    admin_response: str | None = Field(default=None, max_length=2000)
    assigned_to_id: int | None = None


class ReassignmentRequestRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    ticket_id: int
    requested_by: UserRead
    current_assignee: UserRead | None
    reason: str
    status: AssignmentRequestStatus
    admin_response: str | None
    created_at: datetime
    resolved_at: datetime | None
    ticket: TicketRead | None = None


class AdminDashboardStats(BaseModel):
    total_tickets: int
    open_tickets: int
    in_progress_tickets: int
    resolved_tickets: int
    closed_tickets: int
    unassigned_tickets: int
    pending_reassignment_requests: int
    high_priority_tickets: int


class AdminDashboardResponse(BaseModel):
    stats: AdminDashboardStats
    recent_tickets: list[TicketRead]
    agent_workload: list[AgentWorkload]


class AgentDashboardStats(BaseModel):
    assigned_tickets: int
    open_assigned_tickets: int
    in_progress_assigned_tickets: int
    resolved_tickets: int


class AgentDashboardResponse(BaseModel):
    stats: AgentDashboardStats
    recent_tickets: list[TicketRead]
