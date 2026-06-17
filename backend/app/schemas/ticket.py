from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.ticket import TicketCategory, TicketPriority, TicketStatus
from app.schemas.comment import CommentRead
from app.schemas.user import UserRead


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


class AdminDashboardStats(BaseModel):
    total_tickets: int
    open_tickets: int
    in_progress_tickets: int
    resolved_tickets: int
    high_priority_tickets: int


class AdminDashboardResponse(BaseModel):
    stats: AdminDashboardStats
    recent_tickets: list[TicketRead]
