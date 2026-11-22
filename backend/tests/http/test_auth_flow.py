"""Auth flow over HTTP: register, login, read own profile."""
import uuid


def test_register_user(client):
    email = f"new-{uuid.uuid4().hex[:10]}@example.com"
    response = client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "Password123", "full_name": "New User"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == email
    assert "id" in data


def test_register_rejects_weak_password(client):
    response = client.post(
        "/api/v1/auth/register",
        json={"email": "weak@example.com", "password": "password", "full_name": "Weak"},
    )
    assert response.status_code == 422


def test_login_user(client, test_user):
    response = client.post(
        "/api/v1/auth/login",
        data={"username": test_user["email"], "password": test_user["password"]},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client, test_user):
    response = client.post(
        "/api/v1/auth/login",
        data={"username": test_user["email"], "password": "WrongPass999"},
    )
    assert response.status_code == 401


def test_get_current_user(client, auth_headers, test_user):
    response = client.get("/api/v1/auth/me", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["email"] == test_user["email"]


def test_new_user_has_empty_wallet(client, auth_headers):
    response = client.get("/api/v1/wallet/", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["balance_kg"] == 0.0
