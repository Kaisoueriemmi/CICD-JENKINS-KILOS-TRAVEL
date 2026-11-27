from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.api.v1.endpoints.auth import get_current_user
from app.models.models import User, Flight, Wallet, Transaction, TransactionType
from app.schemas.schemas import FlightCreate, FlightResponse
from app.services.ocr_service import get_ocr_service, BaggageTicketOCR
from app.services.amadeus_service import get_amadeus_service, AmadeusService
from app.services.baggage_credit import calculate_credit_value, classify_flight
import tempfile
import os
from pydantic import BaseModel

router = APIRouter()


class OCRResponse(BaseModel):
    """Response model for OCR scan"""
    flight_number: Optional[str]
    weight_kg: Optional[float]
    bag_tag: Optional[str]
    raw_text: str
    confidence: str


class BaggageAllowanceRequest(BaseModel):
    """Request model for baggage allowance lookup"""
    flight_number: str
    departure_airport: str
    arrival_airport: str
    flight_date: str


class BaggageAllowanceResponse(BaseModel):
    """Response model for baggage allowance"""
    allowed_weight_kg: float
    source: str  # 'amadeus' or 'fallback'
    flight_type: str


@router.post("/", response_model=FlightResponse, status_code=status.HTTP_201_CREATED)
async def create_flight(
    flight_data: FlightCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new flight record"""
    # Calculate difference
    difference_kg = flight_data.allowed_weight_kg - flight_data.actual_weight_kg

    # Calculate credit value
    credit_value_kg = calculate_credit_value(flight_data.flight_type, difference_kg)

    # Create flight
    new_flight = Flight(
        user_id=current_user.id,
        flight_number=flight_data.flight_number,
        airline=flight_data.airline,
        departure_airport=flight_data.departure_airport,
        arrival_airport=flight_data.arrival_airport,
        flight_date=flight_data.flight_date,
        flight_type=flight_data.flight_type,
        allowed_weight_kg=flight_data.allowed_weight_kg,
        actual_weight_kg=flight_data.actual_weight_kg,
        difference_kg=difference_kg,
        credit_value_kg=credit_value_kg,
        ticket_image_url=flight_data.ticket_image_url,
        scan_verified=False
    )

    db.add(new_flight)
    db.commit()
    db.refresh(new_flight)

    return new_flight


@router.post("/{flight_id}/credit", response_model=FlightResponse)
async def credit_flight_to_wallet(
    flight_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Credit flight savings to wallet"""
    flight = db.query(Flight).filter(
        Flight.id == flight_id,
        Flight.user_id == current_user.id
    ).first()

    if not flight:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flight not found"
        )

    if flight.is_credited:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Flight already credited"
        )

    if flight.credit_value_kg <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No credits available for this flight"
        )

    # Get wallet
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()

    # Update wallet
    wallet.balance_kg += flight.credit_value_kg
    wallet.total_earned_kg += flight.credit_value_kg

    # Mark flight as credited
    flight.is_credited = True

    # Create transaction
    transaction = Transaction(
        user_id=current_user.id,
        transaction_type=TransactionType.CREDIT,
        amount_kg=flight.credit_value_kg,
        balance_after=wallet.balance_kg,
        flight_id=flight.id,
        description=f"Credit from flight {flight.flight_number}"
    )

    db.add(transaction)
    db.commit()
    db.refresh(flight)

    return flight


@router.get("/", response_model=List[FlightResponse])
async def get_flights(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all flights for current user"""
    flights = db.query(Flight).filter(
        Flight.user_id == current_user.id
    ).offset(skip).limit(limit).all()

    return flights


@router.get("/{flight_id}", response_model=FlightResponse)
async def get_flight(
    flight_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get flight by ID"""
    flight = db.query(Flight).filter(
        Flight.id == flight_id,
        Flight.user_id == current_user.id
    ).first()

    if not flight:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flight not found"
        )

    return flight


@router.post("/scan-ticket", response_model=OCRResponse)
async def scan_ticket(
    file: UploadFile = File(...),
    ocr_service: BaggageTicketOCR = Depends(get_ocr_service)
):
    """
    Scan baggage ticket using OCR

    Upload an image or PDF of a baggage ticket to extract:
    - Flight number
    - Baggage weight
    - Bag tag number
    """
    # Validate file type
    allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed types: {', '.join(allowed_types)}"
        )

    # Create temporary file
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp_file:
            # Write uploaded file to temporary file
            content = await file.read()
            tmp_file.write(content)
            tmp_file_path = tmp_file.name

        # Extract data using OCR
        extracted_data = ocr_service.extract_baggage_data(tmp_file_path)

        # Clean up temporary file
        os.unlink(tmp_file_path)

        return OCRResponse(**extracted_data)

    except Exception as e:
        # Clean up temporary file if it exists
        if 'tmp_file_path' in locals() and os.path.exists(tmp_file_path):
            os.unlink(tmp_file_path)

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"OCR processing failed: {str(e)}"
        )


@router.post("/lookup-allowance", response_model=BaggageAllowanceResponse)
async def lookup_baggage_allowance(
    request: BaggageAllowanceRequest,
    amadeus_service: AmadeusService = Depends(get_amadeus_service)
):
    """
    Lookup baggage allowance for a flight

    Uses Amadeus API to get accurate baggage allowance.
    Falls back to default values if API is unavailable.
    """
    try:
        # Try to get allowance from Amadeus API
        allowance_data = amadeus_service.get_baggage_allowance(
            flight_number=request.flight_number,
            departure=request.departure_airport,
            arrival=request.arrival_airport,
            date=request.flight_date
        )

        if allowance_data:
            return BaggageAllowanceResponse(
                allowed_weight_kg=allowance_data.get('weight_kg', 23.0),
                source='amadeus',
                flight_type=allowance_data.get('flight_type', 'international')
            )
    except Exception as e:
        # Log the error but continue to fallback
        import logging
        logger = logging.getLogger(__name__)
        logger.warning(f"Amadeus API lookup failed: {e}. Using fallback values.")

    # Fallback: simple rule based on the IATA codes
    try:
        flight_type, allowed_weight_kg = classify_flight(
            request.departure_airport, request.arrival_airport
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    return BaggageAllowanceResponse(
        allowed_weight_kg=allowed_weight_kg,
        source='fallback',
        flight_type=flight_type.value
    )
