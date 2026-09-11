import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.core.security import hash_password
from app.main import app
from app.models import User

ADMIN_EMAIL = "admin@test.local"
ADMIN_PASSWORD = "test-password-123"


@pytest.fixture
def db_session():
    # SQLite en memoria: los tests no dependen de tener Postgres levantado.
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    Base.metadata.create_all(engine)
    session = sessionmaker(bind=engine)()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client(db_session):
    # El rate limiter guarda sus contadores en memoria a nivel de proceso, y
    # el TestClient siempre pega desde la misma IP falsa. Sin resetear, los
    # tests comparten cupo entre si y un test posterior puede fallar por un
    # 429 que en realidad "gastaron" tests anteriores.
    app.state.limiter.reset()
    app.dependency_overrides[get_db] = lambda: db_session
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def admin_headers(client, db_session):
    db_session.add(User(email=ADMIN_EMAIL, hashed_password=hash_password(ADMIN_PASSWORD)))
    db_session.commit()
    response = client.post(
        "/api/auth/login", data={"username": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
    )
    return {"Authorization": f"Bearer {response.json()['access_token']}"}
