"""Main KilosTravel scenario over HTTP: declare a flight, earn credit, use it."""

FLIGHT = {
    "flight_number": "TU712",
    "airline": "Tunisair",
    "departure_airport": "TUN",
    "arrival_airport": "CDG",
    "flight_date": "2026-12-01T10:00:00",
    "flight_type": "international",
    "allowed_weight_kg": 23,
    "actual_weight_kg": 18,
}


def _credited_flight(client, headers):
    flight = client.post("/api/v1/flights/", json=FLIGHT, headers=headers).json()
    response = client.post(f"/api/v1/flights/{flight['id']}/credit", headers=headers)
    assert response.status_code == 200, response.text
    return response.json()


def test_declare_flight_computes_credit(client, auth_headers):
    response = client.post("/api/v1/flights/", json=FLIGHT, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["difference_kg"] == 5.0
    assert data["credit_value_kg"] == 7.5
    assert data["is_credited"] is False


def test_credit_flight_fills_wallet_once(client, auth_headers):
    flight = _credited_flight(client, auth_headers)
    assert flight["is_credited"] is True

    wallet = client.get("/api/v1/wallet/", headers=auth_headers).json()
    assert wallet["balance_kg"] == 7.5

    again = client.post(f"/api/v1/flights/{flight['id']}/credit", headers=auth_headers)
    assert again.status_code == 400


def test_debit_uses_credit_and_charges_fee(client, auth_headers):
    _credited_flight(client, auth_headers)
    response = client.post(
        "/api/v1/transactions/debit", params={"amount_kg": 3}, headers=auth_headers
    )
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["balance_after"] == 4.5
    assert data["service_fee"] == 3.0

    stats = client.get("/api/v1/wallet/stats", headers=auth_headers).json()
    assert stats["current_balance"] == 4.5
    assert stats["money_saved"] == 120.0

    history = client.get("/api/v1/transactions/", headers=auth_headers).json()
    assert len(history) == 2


def test_debit_more_than_balance_is_refused(client, auth_headers):
    response = client.post(
        "/api/v1/transactions/debit", params={"amount_kg": 50}, headers=auth_headers
    )
    assert response.status_code == 400


def test_flights_list_and_detail(client, auth_headers):
    created = client.post("/api/v1/flights/", json=FLIGHT, headers=auth_headers).json()
    flights = client.get("/api/v1/flights/", headers=auth_headers).json()
    assert [f["id"] for f in flights] == [created["id"]]
    detail = client.get(f"/api/v1/flights/{created['id']}", headers=auth_headers)
    assert detail.status_code == 200


def test_allowance_lookup_fallback(client):
    response = client.post(
        "/api/v1/flights/lookup-allowance",
        json={
            "flight_number": "AF006",
            "departure_airport": "CDG",
            "arrival_airport": "JFK",
            "flight_date": "2026-12-01",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["flight_type"] == "transatlantic"
    assert data["allowed_weight_kg"] == 32.0
