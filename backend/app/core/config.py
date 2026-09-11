from functools import lru_cache
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    environment: Literal["development", "production"] = "development"
    database_url: str = "postgresql+psycopg://portfolio:portfolio@localhost:5433/portfolio"

    # Firmado de JWT. En produccion viene del .env del servidor, nunca del repo.
    secret_key: str = "dev-only-insecure-key-change-me"
    access_token_expire_minutes: int = 60 * 12

    # Origenes permitidos por CORS, separados por coma.
    cors_origins: str = "http://localhost:5173"

    # Credenciales del unico usuario admin, usadas por `python -m app.seed`.
    admin_email: str = "tomasgabrielvia@gmail.com"
    admin_password: str = ""

    # SMTP opcional: si falta el host, los mensajes solo se guardan en la base.
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    notification_email: str = ""

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
