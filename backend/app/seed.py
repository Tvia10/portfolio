"""Carga inicial de datos.

    uv run python -m app.seed

Es idempotente: crea el admin si no existe y carga `seed_data.json` solo
cuando las tablas de contenido estan vacias, asi no pisa lo que edites
despues desde el panel.
"""

import json
import sys
from datetime import date
from pathlib import Path

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models import Certification, Education, Experience, Profile, Project, Skill, User

SEED_FILE = Path(__file__).parent / "seed_data.json"


def _parse_date(value: str | None) -> date | None:
    return date.fromisoformat(value) if value else None


def seed_admin(db: Session) -> None:
    if db.query(User).first():
        print("admin: ya existe, se omite")
        return
    if not settings.admin_password:
        print("admin: falta ADMIN_PASSWORD en el .env, no se creo el usuario", file=sys.stderr)
        return
    db.add(
        User(
            email=settings.admin_email,
            hashed_password=hash_password(settings.admin_password),
        )
    )
    db.commit()
    print(f"admin: creado {settings.admin_email}")


def seed_content(db: Session) -> None:
    if not SEED_FILE.exists():
        print("contenido: no hay seed_data.json, se omite")
        return

    data = json.loads(SEED_FILE.read_text(encoding="utf-8"))

    if "profile" in data and not db.get(Profile, 1):
        db.add(Profile(id=1, **data["profile"]))
        print("contenido: perfil cargado")

    if data.get("projects") and not db.query(Project).first():
        db.add_all(Project(**p) for p in data["projects"])
        print(f"contenido: {len(data['projects'])} proyectos")

    if data.get("experience") and not db.query(Experience).first():
        for item in data["experience"]:
            item = {**item}
            item["start_date"] = _parse_date(item["start_date"])
            item["end_date"] = _parse_date(item.get("end_date"))
            db.add(Experience(**item))
        print(f"contenido: {len(data['experience'])} experiencias")

    if data.get("education") and not db.query(Education).first():
        for item in data["education"]:
            item = {**item}
            item["start_date"] = _parse_date(item["start_date"])
            item["end_date"] = _parse_date(item.get("end_date"))
            db.add(Education(**item))
        print(f"contenido: {len(data['education'])} estudios")

    if data.get("skills") and not db.query(Skill).first():
        db.add_all(Skill(**s) for s in data["skills"])
        print(f"contenido: {len(data['skills'])} skills")

    if data.get("certifications") and not db.query(Certification).first():
        for item in data["certifications"]:
            item = {**item}
            item["issued_date"] = _parse_date(item["issued_date"])
            db.add(Certification(**item))
        print(f"contenido: {len(data['certifications'])} certificaciones")

    db.commit()


def main() -> None:
    db = SessionLocal()
    try:
        seed_admin(db)
        seed_content(db)
    finally:
        db.close()


if __name__ == "__main__":
    main()
