from fastapi import APIRouter, Depends, Query
from typing import List, Dict
from app.api.v1.endpoints.auth import get_current_user
from app.models.models import User
from app.services.iata_service import iata_service
from pydantic import BaseModel

router = APIRouter()

class AirportResponse(BaseModel):
    code: str
    name: str
    city: str
    country: str

@router.get("/airports", response_model=List[AirportResponse])
async def search_airports(
    query: str = Query(..., min_length=2, description="Search query (IATA code or city)"),
    current_user: User = Depends(get_current_user)
):
    """
    Search for airports using IATA data (proxied via backend).
    """
    return await iata_service.search_airports(query)
