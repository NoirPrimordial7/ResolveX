import os
import sys

from sqlalchemy import select

from app.core.security import get_password_hash
from app.db.session import SessionLocal
from app.models.user import User, UserRole


def _required_env(name: str) -> str:
    value = os.getenv(name)
    if not value or not value.strip():
        print(f"{name} is required.", file=sys.stderr)
        raise SystemExit(1)
    return value.strip()


def create_admin() -> None:
    name = _required_env("ADMIN_NAME")
    email = _required_env("ADMIN_EMAIL").lower()
    password = _required_env("ADMIN_PASSWORD")

    db = SessionLocal()
    try:
        existing_user = db.scalar(select(User).where(User.email == email))
        if existing_user:
            print("User with this email already exists. No changes made.")
            return

        user = User(
            full_name=name,
            email=email,
            hashed_password=get_password_hash(password),
            role=UserRole.ADMIN,
        )
        db.add(user)
        db.commit()
        print("Admin user created.")
    finally:
        db.close()


if __name__ == "__main__":
    create_admin()
