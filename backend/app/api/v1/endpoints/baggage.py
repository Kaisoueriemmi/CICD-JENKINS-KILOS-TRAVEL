"""Public baggage-credit calculator (no login, no database).

Used by the pipeline smoke test:
GET /api/v1/baggage/credit?flight_type=international&allowed_kg=23&actual_kg=18
-> {"flight_type": "international", "unused_kg": 5.0, "credit_kg": 7.5}
"""
from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel

from app.models.models import FlightType
from app.services.baggage_credit import credit_for_flight

router = APIRouter()


class CreditQuote(BaseModel):
    flight_type: FlightType
    unused_kg: float
    credit_kg: float


@router.get("/credit", response_model=CreditQuote)
async def quote_credit(
    flight_type: FlightType = Query(..., description="domestic, international or transatlantic"),
    allowed_kg: float = Query(..., ge=0, le=100),
    actual_kg: float = Query(..., ge=0, le=100),
):
    """How many kg of credit a flight would earn."""
    try:
        unused_kg, credit_kg = credit_for_flight(flight_type, allowed_kg, actual_kg)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    return CreditQuote(flight_type=flight_type, unused_kg=unused_kg, credit_kg=credit_kg)
