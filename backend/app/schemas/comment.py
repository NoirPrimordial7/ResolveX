from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.schemas.user import UserRead


class CommentAttachment(BaseModel):
    id: str = Field(min_length=1, max_length=80)
    name: str = Field(min_length=1, max_length=180)
    type: str = Field(default="application/octet-stream", max_length=120)
    size: int = Field(ge=0, le=5_242_880)
    url: str | None = Field(default=None, max_length=2_500_000)


class CommentCreate(BaseModel):
    message: str = Field(default="", max_length=2000)
    attachments: list[CommentAttachment] = Field(default_factory=list, max_length=4)

    @model_validator(mode="after")
    def require_message_or_attachment(self) -> "CommentCreate":
        if not self.message.strip() and not self.attachments:
            raise ValueError("Message or attachment is required")
        return self


class CommentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    message: str
    attachments: list[CommentAttachment] = Field(default_factory=list)
    created_at: datetime
    author: UserRead
