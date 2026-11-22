import os
import uuid

# Must be set before the app is imported: the rate limiter reads it at import time.
os.environ.setdefault("RATE_LIMIT_ENABLED", "false")

import httpx
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.database import Base, get_db

# BASE_URL set  -> HTTP tests call a running server (pipeline: local uvicorn or
#                  the app container wired to PostgreSQL).
# BASE_URL unset -> HTTP tests run in-process against an in-memory SQLite DB.
BASE_URL = os.environ.get("BASE_URL", "").rstrip("/")

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def pytest_collection_modifyitems(config, items):
    """Mark tests from their folder: tests/unit -> unit, tests/http -> http."""
    for item in items:
        parts = item.path.parts
        if "unit" in parts:
            item.add_marker(pytest.mark.unit)
        elif "http" in parts:
            item.add_marker(pytest.mark.http)


@pytest.fixture(scope="module")
def db_engine():
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def db(db_engine):
    connection = db_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    yield session
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture(scope="function")
def client(request):
    """HTTP client: a real server when BASE_URL is set, otherwise in-process."""
    if BASE_URL:
        with httpx.Client(base_url=BASE_URL, timeout=10) as c:
            yield c
        return

    db = request.getfixturevalue("db")

    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def test_user(client):
    """Register a new user (unique e-mail, so it also works on a persistent DB)."""
    user_data = {
        "email": f"test-{uuid.uuid4().hex[:10]}@example.com",
        "password": "Password123",
        "full_name": "Test User",
    }
    response = client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == 201, response.text
    return user_data


@pytest.fixture(scope="function")
def auth_headers(client, test_user):
    """Authorization header for the test user."""
    login_data = {"username": test_user["email"], "password": test_user["password"]}
    response = client.post("/api/v1/auth/login", data=login_data)
    assert response.status_code == 200, response.text
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
