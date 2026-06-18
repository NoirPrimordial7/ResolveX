"""Add support agents and assignment request workflow.

Revision ID: 202606180001
Revises: 202606170001
Create Date: 2026-06-18
"""

from alembic import op
import sqlalchemy as sa


revision = "202606180001"
down_revision = "202606170001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table("users") as batch_op:
        batch_op.alter_column("full_name", new_column_name="name", existing_type=sa.String(length=120), existing_nullable=False)
        batch_op.alter_column(
            "hashed_password",
            new_column_name="password_hash",
            existing_type=sa.String(length=255),
            existing_nullable=False,
        )
        batch_op.add_column(
            sa.Column(
                "updated_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("CURRENT_TIMESTAMP"),
                nullable=False,
            )
        )

    op.drop_index("ix_tickets_created_by_id", table_name="tickets")
    op.drop_index("ix_tickets_assigned_to_id", table_name="tickets")
    with op.batch_alter_table("tickets") as batch_op:
        batch_op.alter_column("created_by_id", new_column_name="created_by", existing_type=sa.Integer(), existing_nullable=False)
        batch_op.alter_column("assigned_to_id", new_column_name="assigned_to", existing_type=sa.Integer(), existing_nullable=True)
        batch_op.add_column(sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True))
    op.create_index("ix_tickets_created_by", "tickets", ["created_by"], unique=False)
    op.create_index("ix_tickets_assigned_to", "tickets", ["assigned_to"], unique=False)
    op.create_index("ix_tickets_created_at", "tickets", ["created_at"], unique=False)

    op.drop_index("ix_comments_id", table_name="comments")
    op.drop_index("ix_comments_ticket_id", table_name="comments")
    op.drop_index("ix_comments_author_id", table_name="comments")
    op.rename_table("comments", "ticket_comments")
    with op.batch_alter_table("ticket_comments") as batch_op:
        batch_op.alter_column("author_id", new_column_name="user_id", existing_type=sa.Integer(), existing_nullable=False)
    op.create_index("ix_ticket_comments_id", "ticket_comments", ["id"], unique=False)
    op.create_index("ix_ticket_comments_ticket_id", "ticket_comments", ["ticket_id"], unique=False)
    op.create_index("ix_ticket_comments_user_id", "ticket_comments", ["user_id"], unique=False)

    op.create_table(
        "ticket_assignment_requests",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("ticket_id", sa.Integer(), nullable=False),
        sa.Column("requested_by", sa.Integer(), nullable=False),
        sa.Column("current_assignee_id", sa.Integer(), nullable=True),
        sa.Column("reason", sa.Text(), nullable=False),
        sa.Column("status", sa.String(length=20), server_default="Pending", nullable=False),
        sa.Column("admin_response", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["current_assignee_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["requested_by"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["ticket_id"], ["tickets.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_ticket_assignment_requests_id", "ticket_assignment_requests", ["id"], unique=False)
    op.create_index("ix_ticket_assignment_requests_status", "ticket_assignment_requests", ["status"], unique=False)
    op.create_index("ix_ticket_assignment_requests_ticket_id", "ticket_assignment_requests", ["ticket_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_ticket_assignment_requests_ticket_id", table_name="ticket_assignment_requests")
    op.drop_index("ix_ticket_assignment_requests_status", table_name="ticket_assignment_requests")
    op.drop_index("ix_ticket_assignment_requests_id", table_name="ticket_assignment_requests")
    op.drop_table("ticket_assignment_requests")

    op.drop_index("ix_ticket_comments_user_id", table_name="ticket_comments")
    op.drop_index("ix_ticket_comments_ticket_id", table_name="ticket_comments")
    op.drop_index("ix_ticket_comments_id", table_name="ticket_comments")
    with op.batch_alter_table("ticket_comments") as batch_op:
        batch_op.alter_column("user_id", new_column_name="author_id", existing_type=sa.Integer(), existing_nullable=False)
    op.rename_table("ticket_comments", "comments")
    op.create_index("ix_comments_author_id", "comments", ["author_id"], unique=False)
    op.create_index("ix_comments_ticket_id", "comments", ["ticket_id"], unique=False)
    op.create_index("ix_comments_id", "comments", ["id"], unique=False)

    op.drop_index("ix_tickets_created_at", table_name="tickets")
    op.drop_index("ix_tickets_assigned_to", table_name="tickets")
    op.drop_index("ix_tickets_created_by", table_name="tickets")
    with op.batch_alter_table("tickets") as batch_op:
        batch_op.drop_column("resolved_at")
        batch_op.alter_column("assigned_to", new_column_name="assigned_to_id", existing_type=sa.Integer(), existing_nullable=True)
        batch_op.alter_column("created_by", new_column_name="created_by_id", existing_type=sa.Integer(), existing_nullable=False)
    op.create_index("ix_tickets_assigned_to_id", "tickets", ["assigned_to_id"], unique=False)
    op.create_index("ix_tickets_created_by_id", "tickets", ["created_by_id"], unique=False)

    with op.batch_alter_table("users") as batch_op:
        batch_op.drop_column("updated_at")
        batch_op.alter_column(
            "password_hash",
            new_column_name="hashed_password",
            existing_type=sa.String(length=255),
            existing_nullable=False,
        )
        batch_op.alter_column("name", new_column_name="full_name", existing_type=sa.String(length=120), existing_nullable=False)
