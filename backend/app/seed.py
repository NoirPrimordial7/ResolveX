from sqlalchemy import select

from app.core.security import get_password_hash
from app.db.session import SessionLocal
from app.models.user import User, UserRole


SEED_USERS = [
    {
        "full_name": "ResolveX Admin",
        "email": "admin@resolvex.com",
        "password": "Admin@123",
        "role": UserRole.ADMIN,
    },
    {
        "full_name": "Demo Customer",
        "email": "customer@resolvex.com",
        "password": "Customer@123",
        "role": UserRole.CUSTOMER,
    },
    {
        "full_name": "Demo Agent",
        "email": "agent@resolvex.com",
        "password": "Agent@123",
        "role": UserRole.SUPPORT_AGENT,
    },
]


def seed_users() -> None:
    db = SessionLocal()
    try:
        for item in SEED_USERS:
            existing = db.scalar(select(User).where(User.email == item["email"]))
            if existing:
                continue
            user = User(
                full_name=item["full_name"],
                email=item["email"],
                hashed_password=get_password_hash(item["password"]),
                role=item["role"],
            )
            db.add(user)
        db.commit()
        print("Seed data is ready.")
    finally:
        db.close()


if __name__ == "__main__":
    seed_users()
