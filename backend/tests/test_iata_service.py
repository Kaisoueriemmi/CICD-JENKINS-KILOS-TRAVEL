from fastapi.testclient import TestClient
from app.services.iata_service import iata_service
import pytest

@pytest.mark.asyncio
async def test_iata_service_mock():
    # Force API Key to None to test mock
    original_key = iata_service.api_key
    iata_service.api_key = None
    
    results = await iata_service.search_airports("par")
    
    # Restaure key
    iata_service.api_key = original_key
    
    assert len(results) > 0
    # Check if we get Paris airports
    found_cdg = any(a["code"] == "CDG" for a in results)
    assert found_cdg

def test_iata_endpoint(client: TestClient, auth_headers):
    response = client.get(
        "/api/v1/iata/airports?query=par",
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "code" in data[0]
    assert "name" in data[0]
