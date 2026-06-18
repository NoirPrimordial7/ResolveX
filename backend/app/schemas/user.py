from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.user import UserRole


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    full_name: str
    email: EmailStr
    avatar_url: str | None = None
    role: UserRole
    is_active: bool
    created_at: datetime
    updated_at: datetime


class UserProfileUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=120)
    avatar_url: str | None = Field(default=None, max_length=2_500_000)


class UserPasswordUpdate(BaseModel):
    current_password: str = Field(min_length=1, max_length=255)
    new_password: str = Field(min_length=8, max_length=255)


class AgentWorkload(BaseModel):
    id: int
    name: str
    full_name: str
    email: EmailStr
    avatar_url: str | None = None
    active_ticket_count: int
    open_ticket_count: int
    in_progress_ticket_count: int
    resolved_ticket_count: int
