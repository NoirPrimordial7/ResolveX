# Usage: python -m app.seed_placement_demo
from __future__ import annotations

import json
from datetime import datetime, timedelta, timezone
from typing import Any
from urllib.parse import quote

from sqlalchemy import delete, inspect, select
from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.db.session import SessionLocal
from app.models.comment import Comment
from app.models.ticket import Ticket, TicketCategory, TicketPriority, TicketStatus
from app.models.user import User, UserRole

try:
    from app.models.assignment_request import AssignmentRequestStatus, TicketAssignmentRequest
except ImportError:  # pragma: no cover - keeps this script usable if the optional model is removed.
    AssignmentRequestStatus = None
    TicketAssignmentRequest = None

try:
    from app.models.notification import Notification
except ImportError:  # pragma: no cover - keeps this script usable if notifications are removed.
    Notification = None


DEMO_PASSWORD = "Password@123"

DEMO_USERS = [
    {
        "full_name": "Arya Patil",
        "email": "student.arya@resolvex.edu",
        "role": UserRole.CUSTOMER,
        "display_role": "Student",
        "initials": "AP",
    },
    {
        "full_name": "Shambhavi Karanjkar",
        "email": "student.shambhavi@resolvex.edu",
        "role": UserRole.CUSTOMER,
        "display_role": "Student",
        "initials": "SK",
    },
    {
        "full_name": "Aditya Gholap",
        "email": "student.aditya@resolvex.edu",
        "role": UserRole.CUSTOMER,
        "display_role": "Student",
        "initials": "AG",
    },
    {
        "full_name": "Prof. Meera Sharma",
        "email": "faculty.meera@resolvex.edu",
        "role": UserRole.SUPPORT_AGENT,
        "display_role": "Faculty Coordinator",
        "initials": "MS",
    },
    {
        "full_name": "Prof. Rahul Deshmukh",
        "email": "faculty.rahul@resolvex.edu",
        "role": UserRole.SUPPORT_AGENT,
        "display_role": "Faculty Coordinator",
        "initials": "RD",
    },
    {
        "full_name": "Dr. Swati More",
        "email": "head.placement@resolvex.edu",
        "role": UserRole.ADMIN,
        "display_role": "Placement Head",
        "initials": "SM",
    },
]


def _initials_avatar_data_uri(initials: str, role: UserRole) -> str:
    colors = {
        UserRole.ADMIN: ("#FF4B24", "#D93618"),
        UserRole.CUSTOMER: ("#38BDF8", "#0EA5E9"),
        UserRole.SUPPORT_AGENT: ("#34D399", "#10B981"),
    }
    start, end = colors[role]
    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">'
        f"<defs><linearGradient id=\"g\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\">"
        f'<stop offset="0%" stop-color="{start}"/><stop offset="100%" stop-color="{end}"/>'
        "</linearGradient></defs>"
        '<rect width="128" height="128" rx="18" fill="url(#g)"/>'
        f'<text x="64" y="76" text-anchor="middle" font-size="46" font-family="Arial, sans-serif" '
        f'font-weight="800" fill="#0B0B0A">{initials}</text>'
        "</svg>"
    )
    return f"data:image/svg+xml;utf8,{quote(svg, safe='')}"


def _model_table_exists(db: Session, model: type[Any] | None) -> bool:
    if model is None:
        return False
    return inspect(db.get_bind()).has_table(model.__tablename__)


def _delete_model_rows(db: Session, model: type[Any] | None) -> int:
    if not _model_table_exists(db, model):
        return 0
    result = db.execute(delete(model))
    return int(result.rowcount or 0)


def _require_tables(db: Session) -> None:
    required_models = (User, Ticket, Comment)
    missing = [model.__tablename__ for model in required_models if not _model_table_exists(db, model)]
    if missing:
        raise RuntimeError(f"Missing required table(s): {', '.join(missing)}. Run Alembic migrations first.")


def _upsert_demo_users(db: Session, now: datetime) -> tuple[dict[str, User], int, int]:
    users_by_email: dict[str, User] = {}
    created = 0
    updated = 0

    for item in DEMO_USERS:
        existing = db.scalar(select(User).where(User.email == item["email"]))
        avatar_url = _initials_avatar_data_uri(item["initials"], item["role"])
        if existing:
            existing.full_name = item["full_name"]
            existing.hashed_password = get_password_hash(DEMO_PASSWORD)
            existing.role = item["role"]
            existing.is_active = True
            existing.updated_at = now
            if hasattr(existing, "avatar_url"):
                existing.avatar_url = avatar_url
            db.add(existing)
            users_by_email[item["email"]] = existing
            updated += 1
            continue

        user = User(
            full_name=item["full_name"],
            email=item["email"],
            hashed_password=get_password_hash(DEMO_PASSWORD),
            role=item["role"],
            is_active=True,
            avatar_url=avatar_url,
            created_at=now - timedelta(days=3),
            updated_at=now,
        )
        db.add(user)
        users_by_email[item["email"]] = user
        created += 1

    db.flush()
    return users_by_email, created, updated


def _ticket_specs(now: datetime) -> list[dict[str, Any]]:
    return [
        {
            "key": "portal",
            "student_email": "student.aditya@resolvex.edu",
            "faculty_email": "faculty.meera@resolvex.edu",
            "title": "Placement portal not opening",
            "description": (
                "I am unable to open the placement portal from my account. It keeps showing a blank page after login."
            ),
            "category": TicketCategory.TECHNICAL,
            "priority": TicketPriority.HIGH,
            "status": TicketStatus.IN_PROGRESS,
            "created_at": now - timedelta(days=2, hours=5, minutes=20),
            "comments": [
                ("student", "The placement portal is not opening after login. I need to register for the upcoming drive.", 15),
                ("faculty", "Please clear your browser cache and try again. Also send a screenshot if the issue continues.", 55),
                ("student", "I tried in another browser too, but the same blank page is shown.", 150),
                (
                    "faculty",
                    "I have forwarded this to the placement portal team. Please try again after some time.",
                    300,
                ),
            ],
        },
        {
            "key": "eligibility",
            "student_email": "student.shambhavi@resolvex.edu",
            "faculty_email": "faculty.rahul@resolvex.edu",
            "title": "Eligibility criteria clarification",
            "description": (
                "I want to know whether I am eligible for the upcoming company drive because the CGPA criteria is confusing."
            ),
            "category": TicketCategory.GENERAL,
            "priority": TicketPriority.MEDIUM,
            "status": TicketStatus.OPEN,
            "created_at": now - timedelta(days=1, hours=8, minutes=40),
            "comments": [
                (
                    "student",
                    "The company notice says minimum 7.0 CGPA, but my current CGPA is 6.95. Am I eligible?",
                    20,
                ),
                ("faculty", "Please wait, I will confirm this with the placement head and update you.", 80),
                ("student", "Okay sir, please update soon because registration closes today.", 220),
            ],
        },
        {
            "key": "resume",
            "student_email": "student.arya@resolvex.edu",
            "faculty_email": "faculty.meera@resolvex.edu",
            "title": "Resume PDF not getting accepted",
            "description": "I am uploading my resume in PDF format, but the system says invalid file.",
            "category": TicketCategory.TECHNICAL,
            "priority": TicketPriority.HIGH,
            "status": TicketStatus.IN_PROGRESS,
            "created_at": now - timedelta(days=1, hours=4, minutes=15),
            "comments": [
                ("student", "My resume PDF is not getting accepted on the portal.", 10),
                (
                    "faculty",
                    "Please make sure the file size is below 2 MB and the file name has no special characters.",
                    45,
                ),
                ("student", "I renamed the file and compressed it, but it still fails.", 115),
                ("faculty", "Please attach the file here. I will verify the format and help you upload it.", 170),
            ],
        },
        {
            "key": "schedule",
            "student_email": "student.aditya@resolvex.edu",
            "faculty_email": "faculty.rahul@resolvex.edu",
            "title": "Interview schedule not visible",
            "description": "I was shortlisted for the interview, but the interview schedule is not visible on my dashboard.",
            "category": TicketCategory.ACCOUNT,
            "priority": TicketPriority.URGENT,
            "status": TicketStatus.OPEN,
            "created_at": now - timedelta(hours=6, minutes=30),
            "comments": [
                ("student", "My name is in the shortlisted list, but I cannot see the interview timing.", 8),
                ("faculty", "Please share your registration ID for this drive.", 35),
                ("student", "My registration ID is DRV-2026-104.", 75),
                ("faculty", "I will check this with the placement office and update the schedule.", 105),
            ],
        },
        {
            "key": "registration_id",
            "student_email": "student.shambhavi@resolvex.edu",
            "faculty_email": "faculty.meera@resolvex.edu",
            "title": "Company registration ID issue",
            "description": "I registered for the company drive but did not receive my registration ID.",
            "category": TicketCategory.ACCOUNT,
            "priority": TicketPriority.MEDIUM,
            "status": TicketStatus.RESOLVED,
            "created_at": now - timedelta(days=2, hours=2, minutes=10),
            "comments": [
                ("student", "I completed registration but did not receive the company registration ID.", 25),
                ("faculty", "I checked the placement sheet. Your registration was captured successfully.", 70),
                (
                    "faculty",
                    "Your registration ID is CMP-REG-2198. Please keep it for interview verification.",
                    95,
                ),
                ("student", "Thank you, ma'am. The issue is resolved.", 130),
            ],
        },
        {
            "key": "offer_letter",
            "student_email": "student.arya@resolvex.edu",
            "faculty_email": "faculty.rahul@resolvex.edu",
            "title": "Offer letter document verification",
            "description": "I need confirmation about which documents are required for offer letter verification.",
            "category": TicketCategory.GENERAL,
            "priority": TicketPriority.LOW,
            "status": TicketStatus.CLOSED,
            "created_at": now - timedelta(days=1, hours=1, minutes=30),
            "comments": [
                ("student", "What documents are needed for offer letter verification?", 10),
                (
                    "faculty",
                    "Please keep your Aadhaar card, PAN card, college ID, marksheets, and offer letter PDF ready.",
                    35,
                ),
                ("student", "Okay sir, I have all documents ready.", 70),
                ("faculty", "Good. This query is closed.", 95),
            ],
        },
    ]


def _create_tickets_and_comments(
    db: Session,
    users_by_email: dict[str, User],
    now: datetime,
) -> tuple[dict[str, Ticket], int, int]:
    tickets_by_key: dict[str, Ticket] = {}
    comment_count = 0

    for spec in _ticket_specs(now):
        student = users_by_email[spec["student_email"]]
        faculty = users_by_email[spec["faculty_email"]]
        comment_times = [spec["created_at"] + timedelta(minutes=offset) for _, _, offset in spec["comments"]]
        updated_at = comment_times[-1] if comment_times else spec["created_at"]

        ticket = Ticket(
            title=spec["title"],
            description=spec["description"],
            category=spec["category"],
            priority=spec["priority"],
            status=spec["status"],
            created_by_id=student.id,
            assigned_to_id=faculty.id,
            created_at=spec["created_at"],
            updated_at=updated_at,
            resolved_at=updated_at if spec["status"] == TicketStatus.RESOLVED else None,
        )
        db.add(ticket)
        db.flush()
        tickets_by_key[spec["key"]] = ticket

        for author_role, message, offset in spec["comments"]:
            author = student if author_role == "student" else faculty
            db.add(
                Comment(
                    message=message,
                    attachments_json=None,
                    ticket_id=ticket.id,
                    author_id=author.id,
                    created_at=spec["created_at"] + timedelta(minutes=offset),
                )
            )
            comment_count += 1

    db.flush()
    return tickets_by_key, len(tickets_by_key), comment_count


def _create_handover_request(
    db: Session,
    tickets_by_key: dict[str, Ticket],
    users_by_email: dict[str, User],
    now: datetime,
) -> tuple[int, int | None]:
    if TicketAssignmentRequest is None or AssignmentRequestStatus is None:
        return 0, None
    if not _model_table_exists(db, TicketAssignmentRequest):
        return 0, None

    ticket = tickets_by_key["eligibility"]
    rahul = users_by_email["faculty.rahul@resolvex.edu"]
    request = TicketAssignmentRequest(
        ticket_id=ticket.id,
        requested_by_id=rahul.id,
        current_assignee_id=rahul.id,
        reason=(
            "Need Placement Head clarification because the student's CGPA is borderline and registration closes today."
        ),
        status=AssignmentRequestStatus.PENDING,
        created_at=now - timedelta(hours=2, minutes=15),
    )
    db.add(request)
    db.flush()
    return 1, request.id


def _metadata(ticket: Ticket, actor: User | None = None, extra: dict[str, Any] | None = None) -> str:
    payload: dict[str, Any] = {
        "action_text": "Open Query",
        "source": "placement_demo_seed",
        "ticket_title": ticket.title,
    }
    if actor:
        payload["actor_name"] = actor.full_name
    if extra:
        payload.update(extra)
    return json.dumps(payload)


def _add_notification(
    db: Session,
    *,
    user: User,
    notification_type: str,
    title: str,
    message: str,
    dedupe_key: str,
    created_at: datetime,
    actor: User | None = None,
    ticket: Ticket | None = None,
    metadata: dict[str, Any] | None = None,
) -> bool:
    if Notification is None or not _model_table_exists(db, Notification):
        return False
    if actor is not None and actor.id == user.id:
        return False

    values: dict[str, Any] = {
        "user_id": user.id,
        "type": notification_type,
        "title": title,
        "message": message,
        "dedupe_key": dedupe_key,
        "is_read": False,
        "created_at": created_at,
    }
    if hasattr(Notification, "actor_id"):
        values["actor_id"] = actor.id if actor else None
    if hasattr(Notification, "ticket_id"):
        values["ticket_id"] = ticket.id if ticket else None
    if hasattr(Notification, "metadata_json") and ticket:
        values["metadata_json"] = _metadata(ticket, actor, metadata)

    db.add(Notification(**values))
    return True


def _create_notifications(
    db: Session,
    tickets_by_key: dict[str, Ticket],
    users_by_email: dict[str, User],
    now: datetime,
    handover_request_id: int | None,
) -> int:
    if Notification is None or not _model_table_exists(db, Notification):
        return 0

    head = users_by_email["head.placement@resolvex.edu"]
    meera = users_by_email["faculty.meera@resolvex.edu"]
    rahul = users_by_email["faculty.rahul@resolvex.edu"]
    arya = users_by_email["student.arya@resolvex.edu"]
    shambhavi = users_by_email["student.shambhavi@resolvex.edu"]
    aditya = users_by_email["student.aditya@resolvex.edu"]

    notifications = [
        {
            "user": meera,
            "actor": head,
            "ticket": tickets_by_key["portal"],
            "type": "assignment_changed",
            "title": "New student query assigned",
            "message": "You have been assigned a new student query: Placement portal not opening",
            "at": tickets_by_key["portal"].created_at + timedelta(minutes=2),
            "seed": "faculty-assigned-portal",
        },
        {
            "user": rahul,
            "actor": head,
            "ticket": tickets_by_key["eligibility"],
            "type": "assignment_changed",
            "title": "New student query assigned",
            "message": "You have been assigned a new student query: Eligibility criteria clarification",
            "at": tickets_by_key["eligibility"].created_at + timedelta(minutes=2),
            "seed": "faculty-assigned-eligibility",
        },
        {
            "user": meera,
            "actor": head,
            "ticket": tickets_by_key["resume"],
            "type": "assignment_changed",
            "title": "New student query assigned",
            "message": "You have been assigned a new student query: Resume PDF not getting accepted",
            "at": tickets_by_key["resume"].created_at + timedelta(minutes=2),
            "seed": "faculty-assigned-resume",
        },
        {
            "user": rahul,
            "actor": head,
            "ticket": tickets_by_key["schedule"],
            "type": "assignment_changed",
            "title": "New student query assigned",
            "message": "You have been assigned a new student query: Interview schedule not visible",
            "at": tickets_by_key["schedule"].created_at + timedelta(minutes=2),
            "seed": "faculty-assigned-schedule",
        },
        {
            "user": meera,
            "actor": head,
            "ticket": tickets_by_key["registration_id"],
            "type": "assignment_changed",
            "title": "New student query assigned",
            "message": "You have been assigned a new student query: Company registration ID issue",
            "at": tickets_by_key["registration_id"].created_at + timedelta(minutes=2),
            "seed": "faculty-assigned-registration",
        },
        {
            "user": rahul,
            "actor": head,
            "ticket": tickets_by_key["offer_letter"],
            "type": "assignment_changed",
            "title": "New student query assigned",
            "message": "You have been assigned a new student query: Offer letter document verification",
            "at": tickets_by_key["offer_letter"].created_at + timedelta(minutes=2),
            "seed": "faculty-assigned-offer",
        },
        {
            "user": rahul,
            "actor": aditya,
            "ticket": tickets_by_key["schedule"],
            "type": "comment_added",
            "title": "Student replied on assigned query",
            "message": "Student replied on your assigned query: Interview schedule not visible",
            "at": now - timedelta(hours=5, minutes=15),
            "seed": "student-replied-schedule",
            "metadata": {"priority": TicketPriority.URGENT.value},
        },
        {
            "user": rahul,
            "actor": shambhavi,
            "ticket": tickets_by_key["eligibility"],
            "type": "comment_added",
            "title": "Student replied on assigned query",
            "message": "Student replied on your assigned query: Eligibility criteria clarification",
            "at": now - timedelta(hours=4, minutes=40),
            "seed": "student-replied-eligibility",
        },
        {
            "user": arya,
            "actor": meera,
            "ticket": tickets_by_key["resume"],
            "type": "comment_added",
            "title": "Faculty replied",
            "message": "Faculty replied to your query: Resume PDF not getting accepted",
            "at": tickets_by_key["resume"].updated_at,
            "seed": "faculty-replied-resume",
        },
        {
            "user": aditya,
            "actor": meera,
            "ticket": tickets_by_key["portal"],
            "type": "status_changed",
            "title": "Query status changed",
            "message": "Your query status changed to In Progress: Placement portal not opening",
            "at": tickets_by_key["portal"].updated_at,
            "seed": "status-in-progress-portal",
            "metadata": {"status": TicketStatus.IN_PROGRESS.value},
        },
        {
            "user": arya,
            "actor": meera,
            "ticket": tickets_by_key["resume"],
            "type": "status_changed",
            "title": "Query status changed",
            "message": "Your query status changed to In Progress: Resume PDF not getting accepted",
            "at": tickets_by_key["resume"].updated_at + timedelta(minutes=2),
            "seed": "status-in-progress-resume",
            "metadata": {"status": TicketStatus.IN_PROGRESS.value},
        },
        {
            "user": shambhavi,
            "actor": meera,
            "ticket": tickets_by_key["registration_id"],
            "type": "status_changed",
            "title": "Query resolved",
            "message": "Your query status changed to Resolved: Company registration ID issue",
            "at": tickets_by_key["registration_id"].updated_at,
            "seed": "status-resolved-registration",
            "metadata": {"status": TicketStatus.RESOLVED.value},
        },
        {
            "user": arya,
            "actor": rahul,
            "ticket": tickets_by_key["offer_letter"],
            "type": "status_changed",
            "title": "Query closed",
            "message": "Your query status changed to Closed: Offer letter document verification",
            "at": tickets_by_key["offer_letter"].updated_at,
            "seed": "status-closed-offer",
            "metadata": {"status": TicketStatus.CLOSED.value},
        },
        {
            "user": head,
            "actor": aditya,
            "ticket": tickets_by_key["schedule"],
            "type": "ticket_created",
            "title": "Urgent placement query",
            "message": "Urgent placement query needs attention: Interview schedule not visible",
            "at": tickets_by_key["schedule"].created_at + timedelta(minutes=4),
            "seed": "admin-urgent-schedule",
            "metadata": {"priority": TicketPriority.URGENT.value},
        },
    ]

    if handover_request_id is not None:
        notifications.append(
            {
                "user": head,
                "actor": rahul,
                "ticket": tickets_by_key["eligibility"],
                "type": "reassignment_requested",
                "title": "Faculty handover requested",
                "message": "Faculty handover requested: Eligibility criteria clarification",
                "at": now - timedelta(hours=2, minutes=10),
                "seed": "admin-handover-eligibility",
                "metadata": {"reassignment_request_id": handover_request_id},
            }
        )

    created = 0
    for item in notifications:
        ticket = item["ticket"]
        created += int(
            _add_notification(
                db,
                user=item["user"],
                actor=item["actor"],
                ticket=ticket,
                notification_type=item["type"],
                title=item["title"],
                message=item["message"],
                dedupe_key=f"placement-demo:{item['type']}:{item['user'].id}:{ticket.id}:{item['seed']}",
                created_at=item["at"],
                metadata=item.get("metadata"),
            )
        )

    return created


def _print_summary(summary: dict[str, int]) -> None:
    print("\nPlacement demo seed complete.")
    print(f"Users created: {summary['users_created']}")
    print(f"Users updated: {summary['users_updated']}")
    print(f"Tickets created: {summary['tickets_created']}")
    print(f"Comments created: {summary['comments_created']}")
    print(f"Handover requests created: {summary['handover_requests_created']}")
    print(f"Notifications created: {summary['notifications_created']}")
    print("\nDeleted ticket-related rows before seeding:")
    print(f"Notifications: {summary['notifications_deleted']}")
    print(f"Handover requests: {summary['handover_requests_deleted']}")
    print(f"Comments: {summary['comments_deleted']}")
    print(f"Tickets: {summary['tickets_deleted']}")

    print("\nDemo login credentials:")
    for item in DEMO_USERS:
        print(
            f"- {item['display_role']}: {item['full_name']} | "
            f"{item['email']} | {DEMO_PASSWORD} | role={item['role'].value} | initials={item['initials']}"
        )


def seed_placement_demo() -> None:
    db = SessionLocal()
    try:
        _require_tables(db)
        now = datetime.now(timezone.utc).replace(microsecond=0)

        summary = {
            "notifications_deleted": _delete_model_rows(db, Notification),
            "handover_requests_deleted": _delete_model_rows(db, TicketAssignmentRequest),
            "comments_deleted": _delete_model_rows(db, Comment),
            "tickets_deleted": _delete_model_rows(db, Ticket),
            "users_created": 0,
            "users_updated": 0,
            "tickets_created": 0,
            "comments_created": 0,
            "handover_requests_created": 0,
            "notifications_created": 0,
        }

        users_by_email, users_created, users_updated = _upsert_demo_users(db, now)
        summary["users_created"] = users_created
        summary["users_updated"] = users_updated

        tickets_by_key, tickets_created, comments_created = _create_tickets_and_comments(db, users_by_email, now)
        summary["tickets_created"] = tickets_created
        summary["comments_created"] = comments_created

        handover_created, handover_request_id = _create_handover_request(db, tickets_by_key, users_by_email, now)
        summary["handover_requests_created"] = handover_created

        summary["notifications_created"] = _create_notifications(
            db,
            tickets_by_key,
            users_by_email,
            now,
            handover_request_id,
        )

        db.commit()
        _print_summary(summary)
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_placement_demo()
