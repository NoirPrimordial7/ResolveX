from datetime import datetime

from pydantic import BaseModel, ConfigDict


class NotificationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    actor_id: int | None
    ticket_id: int | None
    type: str
    title: str
    message: str
    dedupe_key: str
    is_read: bool
    metadata_json: str | None = None
    created_at: datetime
