from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr

from app.models.user import UserRole


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    full_name: str
    email: EmailStr
    role: UserRole
    is_active: bool
    created_at: datetime
    updated_at: datetime


class AgentWorkload(BaseModel):
    id: int
    name: str
    full_name: str
    email: EmailStr
    active_ticket_count: int
    open_ticket_count: int
    in_progress_ticket_count: int
    resolved_ticket_count: int
