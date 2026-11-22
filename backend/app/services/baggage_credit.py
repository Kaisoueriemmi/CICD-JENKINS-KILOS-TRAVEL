"""
Baggage credit rules for KilosTravel.

Pure functions (no database, no network) so they can be unit tested on
their own and reused by the API endpoints.
"""
from typing import Tuple

from app.core.config import settings
from app.models.models import FlightType

# Airports treated as "the other side of the Atlantic" by the fallback rule.
TRANSATLANTIC_AIRPORTS = {"JFK", "LAX", "ORD", "MIA", "ATL", "BOS", "SFO", "IAD"}

DEFAULT_ALLOWANCE_KG = 23.0
TRANSATLANTIC_ALLOWANCE_KG = 32.0

# Estimates shown on the dashboard
EXCESS_FEE_EUR_PER_KG = 40.0
CO2_KG_PER_KG_SAVED = 0.5


def flight_multiplier(flight_type: FlightType) -> float:
    """Return the credit multiplier for a flight type."""
    if flight_type == FlightType.DOMESTIC:
        return settings.DOMESTIC_FLIGHT_MULTIPLIER
    if flight_type == FlightType.INTERNATIONAL:
        return settings.INTERNATIONAL_FLIGHT_MULTIPLIER
    if flight_type == FlightType.TRANSATLANTIC:
        return settings.TRANSATLANTIC_FLIGHT_MULTIPLIER
    return 1.0


def calculate_credit_value(flight_type: FlightType, difference_kg: float) -> float:
    """Credit earned for the unused allowance (0 when the bag was too heavy)."""
    if difference_kg <= 0:
        return 0.0
    return round(difference_kg * flight_multiplier(flight_type), 2)


def credit_for_flight(
    flight_type: FlightType, allowed_kg: float, actual_kg: float
) -> Tuple[float, float]:
    """Return (unused_kg, credit_kg) for one flight."""
    if allowed_kg < 0 or actual_kg < 0:
        raise ValueError("Weights must be positive")
    difference_kg = round(allowed_kg - actual_kg, 2)
    return difference_kg, calculate_credit_value(flight_type, difference_kg)


def classify_flight(departure: str, arrival: str) -> Tuple[FlightType, float]:
    """Fallback rule: guess the flight type and the allowance from IATA codes."""
    departure = departure.strip().upper()
    arrival = arrival.strip().upper()
    if len(departure) != 3 or len(arrival) != 3:
        raise ValueError("Airports must be 3-letter IATA codes")
    if departure in TRANSATLANTIC_AIRPORTS or arrival in TRANSATLANTIC_AIRPORTS:
        return FlightType.TRANSATLANTIC, TRANSATLANTIC_ALLOWANCE_KG
    return FlightType.INTERNATIONAL, DEFAULT_ALLOWANCE_KG


def service_fee(amount_kg: float) -> float:
    """Fee charged when credits are used."""
    return round(amount_kg * settings.SERVICE_FEE_PER_KG, 2)


def check_debit(balance_kg: float, amount_kg: float) -> float:
    """Validate a debit and return the new balance."""
    if amount_kg <= 0:
        raise ValueError("Amount must be positive")
    if balance_kg < amount_kg:
        raise ValueError(f"Insufficient balance. Available: {balance_kg} kg")
    return round(balance_kg - amount_kg, 2)


def money_saved(total_spent_kg: float) -> float:
    """Estimated excess-baggage fees avoided, in euros."""
    return round(total_spent_kg * EXCESS_FEE_EUR_PER_KG, 2)


def carbon_reduced(total_earned_kg: float) -> float:
    """Estimated CO2 avoided, in kg."""
    return round(total_earned_kg * CO2_KG_PER_KG_SAVED, 2)
