"""
Amadeus API Service for Flight and Baggage Data
Provides integration with Amadeus Flight Offers API
"""
from amadeus import Client, ResponseError
from typing import Optional, Dict
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


class AmadeusService:
    """Service for interacting with Amadeus API"""

    def __init__(self):
        """Initialize Amadeus client"""
        try:
            self.client = Client(
                client_id=settings.AMADEUS_API_KEY,
                client_secret=settings.AMADEUS_API_SECRET,
                hostname='test' if settings.ENVIRONMENT == 'development' else 'production'
            )
            logger.info("Amadeus API client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Amadeus client: {e}")
            self.client = None

    def get_baggage_allowance(
        self,
        origin: str,
        destination: str,
        departure_date: str,
        airline_code: Optional[str] = None
    ) -> Optional[Dict]:
        """
        Get baggage allowance for a flight route

        Args:
            origin: IATA airport code (e.g., "TUN")
            destination: IATA airport code (e.g., "CDG")
            departure_date: Date in YYYY-MM-DD format
            airline_code: Optional airline IATA code (e.g., "TU")

        Returns:
            Dictionary with baggage allowance data or None if error
            {
                "pieces": 1,
                "weight_kg": 23,
                "weight_unit": "KG",
                "cabin_class": "ECONOMY"
            }
        """
        if not self.client:
            logger.warning("Amadeus client not initialized")
            return None

        try:
            # Search for flight offers
            params = {
                'originLocationCode': origin.upper(),
                'destinationLocationCode': destination.upper(),
                'departureDate': departure_date,
                'adults': 1,
                'max': 1
            }

            if airline_code:
                params['includedAirlineCodes'] = airline_code.upper()

            response = self.client.shopping.flight_offers_search.get(**params)

            if not response.data:
                logger.warning(f"No flight offers found for {origin} -> {destination}")
                return None

            # Extract baggage allowance from first offer
            offer = response.data[0]
            traveler_pricing = offer['travelerPricings'][0]
            fare_details = traveler_pricing['fareDetailsBySegment'][0]

            # Get checked baggage allowance
            checked_bags = fare_details.get('includedCheckedBags', {})

            result = {
                'pieces': checked_bags.get('quantity', 1),
                'weight_kg': checked_bags.get('weight', 23),
                'weight_unit': checked_bags.get('weightUnit', 'KG'),
                'cabin_class': traveler_pricing.get('fareOption', 'ECONOMY'),
                'airline': offer['validatingAirlineCodes'][0] if offer.get('validatingAirlineCodes') else None
            }

            logger.info(f"Baggage allowance retrieved: {result}")
            return result

        except ResponseError as error:
            logger.error(f"Amadeus API error: {error}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error in get_baggage_allowance: {e}")
            return None

    def search_airport(self, keyword: str, max_results: int = 10) -> list:
        """
        Search for airports by keyword

        Args:
            keyword: Search term (city name, airport name, or code)
            max_results: Maximum number of results to return

        Returns:
            List of airport dictionaries
        """
        if not self.client:
            return []

        try:
            response = self.client.reference_data.locations.get(
                keyword=keyword,
                subType='AIRPORT',
                page={'limit': max_results}
            )

            airports = []
            for location in response.data:
                airports.append({
                    'iata_code': location['iataCode'],
                    'name': location['name'],
                    'city': location['address']['cityName'],
                    'country': location['address']['countryName']
                })

            return airports

        except ResponseError as error:
            logger.error(f"Airport search error: {error}")
            return []

    def get_airline_info(self, airline_code: str) -> Optional[Dict]:
        """
        Get airline information by IATA code

        Args:
            airline_code: IATA airline code (e.g., "TU")

        Returns:
            Dictionary with airline information or None
        """
        if not self.client:
            return None

        try:
            response = self.client.reference_data.airlines.get(
                airlineCodes=airline_code.upper()
            )

            if not response.data:
                return None

            airline = response.data[0]
            return {
                'iata_code': airline['iataCode'],
                'icao_code': airline.get('icaoCode'),
                'name': airline['businessName'],
                'common_name': airline.get('commonName')
            }

        except ResponseError as error:
            logger.error(f"Airline info error: {error}")
            return None


# Dependency for FastAPI
def get_amadeus_service() -> AmadeusService:
    """Dependency to get Amadeus service instance"""
    return AmadeusService()
