import httpx
from typing import List, Dict
from app.core.config import settings


class IATAService:
    def __init__(self):
        self.base_url = settings.IATA_API_URL
        self.api_key = settings.IATA_API_KEY
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        } if self.api_key else {}

    async def search_airports(self, query: str) -> List[Dict]:
        """
        Search for airports by IATA code, city name, or airport name.
        Uses IATA API if configured, otherwise falls back to comprehensive internal mock data.
        """
        if self.api_key:
            return await self._search_iata_api(query)
        else:
            return self._search_mock_data(query)

    async def _search_iata_api(self, query: str) -> List[Dict]:
        try:
            # This is a placeholder for the actual IATA endpoint URL
            # The actual endpoint will depend on the specific API subscribed to in the Hub
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/places",
                    params={"q": query, "type": "airport"},
                    headers=self.headers
                )
                response.raise_for_status()
                data = response.json()
                # Transform to our internal format
                return [
                    {
                        "code": item.get("iata_code"),
                        "name": item.get("name"),
                        "city": item.get("city_name"),
                        "country": item.get("country_name")
                    } for item in data.get("data", [])
                ]
        except Exception as e:
            print(f"IATA API Error: {e}")
            return self._search_mock_data(query)

    def _search_mock_data(self, query: str) -> List[Dict]:
        """Local sandbox data simulating IATA database"""
        query = query.lower()

        # Extended list of major airports
        mock_db = [
            # Europe
            {"code": "CDG", "name": "Charles de Gaulle", "city": "Paris", "country": "France"},
            {"code": "ORY", "name": "Orly", "city": "Paris", "country": "France"},
            {"code": "LHR", "name": "Heathrow", "city": "London", "country": "United Kingdom"},
            {"code": "LGW", "name": "Gatwick", "city": "London", "country": "United Kingdom"},
            {"code": "FRA", "name": "Frankfurt Airport", "city": "Frankfurt", "country": "Germany"},
            {"code": "AMS", "name": "Schiphol", "city": "Amsterdam", "country": "Netherlands"},
            {"code": "MAD", "name": "Adolfo Suárez Madrid–Barajas", "city": "Madrid", "country": "Spain"},
            {"code": "BCN", "name": "El Prat", "city": "Barcelona", "country": "Spain"},
            {"code": "FCO", "name": "Fiumicino", "city": "Rome", "country": "Italy"},
            {"code": "ZRH", "name": "Zürich Airport", "city": "Zurich", "country": "Switzerland"},

            # North America
            {"code": "JFK", "name": "John F. Kennedy", "city": "New York", "country": "USA"},
            {"code": "EWR", "name": "Newark Liberty", "city": "New York", "country": "USA"},
            {"code": "LAX", "name": "Los Angeles International", "city": "Los Angeles", "country": "USA"},
            {"code": "SFO", "name": "San Francisco International", "city": "San Francisco", "country": "USA"},
            {"code": "ORD", "name": "O'Hare", "city": "Chicago", "country": "USA"},
            {"code": "ATL", "name": "Hartsfield-Jackson", "city": "Atlanta", "country": "USA"},
            {"code": "YYZ", "name": "Pearson", "city": "Toronto", "country": "Canada"},

            # Asia / Middle East
            {"code": "DXB", "name": "Dubai International", "city": "Dubai", "country": "UAE"},
            {"code": "HND", "name": "Haneda", "city": "Tokyo", "country": "Japan"},
            {"code": "NRT", "name": "Narita", "city": "Tokyo", "country": "Japan"},
            {"code": "SIN", "name": "Changi", "city": "Singapore", "country": "Singapore"},
            {"code": "HKG", "name": "Hong Kong International", "city": "Hong Kong", "country": "China"},
            {"code": "DOH", "name": "Hamad International", "city": "Doha", "country": "Qatar"},

            # Africa
            {"code": "TUN", "name": "Tunis-Carthage", "city": "Tunis", "country": "Tunisia"},
            {"code": "ALG", "name": "Houari Boumediene", "city": "Algiers", "country": "Algeria"},
            {"code": "CMN", "name": "Mohammed V", "city": "Casablanca", "country": "Morocco"},
            {"code": "CAI", "name": "Cairo International", "city": "Cairo", "country": "Egypt"},
            {"code": "JNB", "name": "O.R. Tambo", "city": "Johannesburg", "country": "South Africa"}
        ]

        return [
            airport for airport in mock_db
            if query in airport["code"].lower()
            or query in airport["name"].lower()
            or query in airport["city"].lower()
        ][:10]


iata_service = IATAService()
