import json
from collections.abc import Iterable

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.notification import Notification
from app.models.user import User


def create_notification(
    db: Session,
    *,
    user_id: int,
    notification_type: str,
    title: str,
    message: str,
    dedupe_key: str,
    actor_id: int | None = None,
    ticket_id: int | None = None,
    metadata: dict[str, object] | None = None,
) -> Notification | None:
    if actor_id is not None and user_id == actor_id:
        return None

    existing = db.scalar(select(Notification).where(Notification.dedupe_key == dedupe_key))
    if existing:
        return None

    notification = Notification(
        user_id=user_id,
        actor_id=actor_id,
        ticket_id=ticket_id,
        type=notification_type,
        title=title,
        message=message,
        dedupe_key=dedupe_key,
        metadata_json=json.dumps(metadata) if metadata else None,
    )
    db.add(notification)
    return notification


def create_notifications(
    db: Session,
    *,
    target_user_ids: Iterable[int],
    notification_type: str,
    title: str,
    message: str,
    dedupe_seed: str,
    actor_id: int | None = None,
    ticket_id: int | None = None,
    metadata: dict[str, object] | None = None,
) -> None:
    seen: set[int] = set()
    for user_id in target_user_ids:
        if user_id in seen:
            continue
        seen.add(user_id)
        create_notification(
            db,
            user_id=user_id,
            actor_id=actor_id,
            ticket_id=ticket_id,
            notification_type=notification_type,
            title=title,
            message=message,
            dedupe_key=f"{notification_type}:{ticket_id or 'none'}:{user_id}:{dedupe_seed}",
            metadata=metadata,
        )


def list_user_notifications(db: Session, current_user: User) -> list[Notification]:
    return list(
        db.scalars(
            select(Notification)
            .where(Notification.user_id == current_user.id)
            .order_by(Notification.created_at.desc(), Notification.id.desc())
            .limit(80)
        ).all()
    )


def mark_notification_read(db: Session, notification_id: int, current_user: User) -> Notification:
    notification = db.get(Notification, notification_id)
    if not notification or notification.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")

    notification.is_read = True
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification


def mark_all_notifications_read(db: Session, current_user: User) -> dict[str, int]:
    notifications = list(
        db.scalars(select(Notification).where(Notification.user_id == current_user.id, Notification.is_read.is_(False))).all()
    )
    for notification in notifications:
        notification.is_read = True
        db.add(notification)
    db.commit()
    return {"updated": len(notifications)}
