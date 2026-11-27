from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.v1.endpoints.auth import get_current_user
from app.models.models import User, Wallet
from app.schemas.schemas import WalletResponse, DashboardStats
from app.services.baggage_credit import money_saved as estimate_money_saved, carbon_reduced

router = APIRouter()


@router.get("/", response_model=WalletResponse)
async def get_wallet(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user's wallet"""
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()

    if not wallet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wallet not found"
        )

    return wallet


@router.get("/stats", response_model=DashboardStats)
async def get_wallet_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get wallet statistics and dashboard data"""
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()

    if not wallet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wallet not found"
        )

    # Calculate stats
    from app.models.models import Flight
    total_flights = db.query(Flight).filter(Flight.user_id == current_user.id).count()

    money_saved = estimate_money_saved(wallet.total_spent_kg)
    carbon_footprint_reduced = carbon_reduced(wallet.total_earned_kg)

    return DashboardStats(
        total_kg_saved=wallet.total_earned_kg,
        total_kg_used=wallet.total_spent_kg,
        current_balance=wallet.balance_kg,
        total_flights=total_flights,
        money_saved=money_saved,
        carbon_footprint_reduced=carbon_footprint_reduced
    )
