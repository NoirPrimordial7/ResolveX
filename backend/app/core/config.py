from functools import lru_cache

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


def normalize_database_url(url: str) -> str:
    """Normalize provider URLs into SQLAlchemy-compatible database URLs."""
    if url.startswith("postgres://"):
        return f"postgresql://{url.removeprefix('postgres://')}"
    return url


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    APP_NAME: str = "ResolveX - Customer Support Ticket Management System"
    API_PREFIX: str = "/api"
    ENVIRONMENT: str = "development"

    DATABASE_URL: str = "postgresql+psycopg://resolvex:resolvex@localhost:5432/resolvex"
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 10

    SECRET_KEY: str = Field(default="change-this-secret-key-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: str | list[str]) -> list[str]:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
