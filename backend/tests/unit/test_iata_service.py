from app.services.iata_service import iata_service


async def test_search_by_city_returns_paris_airports(monkeypatch):
    monkeypatch.setattr(iata_service, "api_key", None)
    results = await iata_service.search_airports("par")
    codes = {a["code"] for a in results}
    assert {"CDG", "ORY"} <= codes


async def test_search_unknown_city_returns_nothing(monkeypatch):
    monkeypatch.setattr(iata_service, "api_key", None)
    assert await iata_service.search_airports("zzzzzz") == []
