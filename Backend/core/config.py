
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    MONGODB_URL: str
    DATABASE_NAME: str = "ufindais"

    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    ADMIN_EMAIL: str
    ADMIN_PASSWORD: str

    class Config:
        env_file = ".env"



settings = Settings()

# Fail fast with a clearer error when env vars are missing.
_required = {
    "MONGODB_URL": settings.MONGODB_URL,
    "SECRET_KEY": settings.SECRET_KEY,
    "ALGORITHM": settings.ALGORITHM,
    "ADMIN_EMAIL": settings.ADMIN_EMAIL,
    "ADMIN_PASSWORD": settings.ADMIN_PASSWORD,
}
_missing = [k for k, v in _required.items() if not v]
if _missing:
    raise RuntimeError(f"Missing required environment variables: {', '.join(_missing)}")
