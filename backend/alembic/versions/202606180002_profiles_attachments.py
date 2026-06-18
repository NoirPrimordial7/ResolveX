"""Add profile avatars and comment attachments.

Revision ID: 202606180002
Revises: 202606180001
Create Date: 2026-06-18
"""

from alembic import op
import sqlalchemy as sa


revision = "202606180002"
down_revision = "202606180001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table("users") as batch_op:
        batch_op.add_column(sa.Column("avatar_url", sa.Text(), nullable=True))

    with op.batch_alter_table("ticket_comments") as batch_op:
        batch_op.add_column(sa.Column("attachments", sa.Text(), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table("ticket_comments") as batch_op:
        batch_op.drop_column("attachments")

    with op.batch_alter_table("users") as batch_op:
        batch_op.drop_column("avatar_url")
