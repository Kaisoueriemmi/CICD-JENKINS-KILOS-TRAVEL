"""Health and smoke-test addresses (the pipeline smoke test calls the same ones)."""


def test_health_returns_ok(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_smoke_credit_quote(client):
    # Smoke-test address and its exact expected answer.
    response = client.get(
        "/api/v1/baggage/credit",
        params={"flight_type": "international", "allowed_kg": 23, "actual_kg": 18},
    )
    assert response.status_code == 200
    assert response.json() == {"flight_type": "international", "unused_kg": 5.0, "credit_kg": 7.5}


def test_credit_quote_rejects_unknown_flight_type(client):
    response = client.get(
        "/api/v1/baggage/credit",
        params={"flight_type": "space", "allowed_kg": 23, "actual_kg": 18},
    )
    assert response.status_code == 422


def test_iata_search_requires_login(client):
    response = client.get("/api/v1/iata/airports", params={"query": "par"})
    assert response.status_code == 401


def test_iata_search(client, auth_headers):
    response = client.get("/api/v1/iata/airports", params={"query": "par"}, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert any(a["code"] == "CDG" for a in data)
