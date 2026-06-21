from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.models.notification import Notification
from app.models.user import User
from app.schemas.notification import NotificationRead
from app.services.notification_service import (
    list_user_notifications,
    mark_all_notifications_read,
    mark_notification_read,
)
from app.utils.dependencies import get_current_user, get_db


router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=list[NotificationRead])
def notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Notification]:
    return list_user_notifications(db, current_user)


@router.patch("/read-all")
def read_all_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, int]:
    return mark_all_notifications_read(db, current_user)


@router.patch("/{notification_id}/read", response_model=NotificationRead)
def read_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Notification:
    return mark_notification_read(db, notification_id, current_user)
