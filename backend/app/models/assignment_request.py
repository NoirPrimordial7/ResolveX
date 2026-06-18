from __future__ import annotations

import enum
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, ForeignKey, Index, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.ticket import Ticket
    from app.models.user import User


class AssignmentRequestStatus(str, enum.Enum):
    PENDING = "Pending"
    APPROVED = "Approved"
    REJECTED = "Rejected"


class TicketAssignmentRequest(Base):
    __tablename__ = "ticket_assignment_requests"
    __table_args__ = (
        Index("ix_ticket_assignment_requests_status", "status"),
        Index("ix_ticket_assignment_requests_ticket_id", "ticket_id"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    ticket_id: Mapped[int] = mapped_column(ForeignKey("tickets.id", ondelete="CASCADE"), nullable=False)
    requested_by_id: Mapped[int] = mapped_column(
        "requested_by",
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    current_assignee_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[AssignmentRequestStatus] = mapped_column(
        Enum(AssignmentRequestStatus, values_callable=lambda values: [item.value for item in values], native_enum=False),
        default=AssignmentRequestStatus.PENDING,
        nullable=False,
    )
    admin_response: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    ticket: Mapped["Ticket"] = relationship("Ticket", back_populates="reassignment_requests")
    requested_by: Mapped["User"] = relationship(
        "User",
        foreign_keys=[requested_by_id],
        back_populates="reassignment_requests",
    )
    current_assignee: Mapped["User | None"] = relationship("User", foreign_keys=[current_assignee_id])
