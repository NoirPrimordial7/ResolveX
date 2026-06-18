from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import normalize_database_url, settings


database_url = normalize_database_url(settings.DATABASE_URL)
engine_kwargs = {"pool_pre_ping": True}

if database_url.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    engine_kwargs["pool_size"] = settings.DB_POOL_SIZE
    engine_kwargs["max_overflow"] = settings.DB_MAX_OVERFLOW

engine = create_engine(database_url, **engine_kwargs)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
