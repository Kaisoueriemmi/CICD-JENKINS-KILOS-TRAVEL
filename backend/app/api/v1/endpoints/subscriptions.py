from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from app.core.database import get_db
from app.api.v1.endpoints.auth import get_current_user
from app.models.models import User, Subscription, UserRole
from app.schemas.schemas import SubscriptionCreate, SubscriptionResponse
from app.core.config import settings

router = APIRouter()


@router.post("/", response_model=SubscriptionResponse, status_code=status.HTTP_201_CREATED)
async def create_subscription(
    subscription_data: SubscriptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new subscription"""
    # Check if user already has an active subscription
    active_subscription = db.query(Subscription).filter(
        Subscription.user_id == current_user.id,
        Subscription.status == "active",
        Subscription.end_date > datetime.utcnow()
    ).first()

    if active_subscription:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already has an active subscription"
        )

    # Determine price
    if subscription_data.plan_type == UserRole.PREMIUM:
        amount = settings.PREMIUM_PRICE_MONTHLY
    else:
        amount = settings.FAMILY_PRICE_MONTHLY

    # Create subscription
    new_subscription = Subscription(
        user_id=current_user.id,
        plan_type=subscription_data.plan_type,
        status="active",
        start_date=datetime.utcnow(),
        end_date=datetime.utcnow() + timedelta(days=30),
        amount=amount,
        currency="EUR"
    )

    # Update user role
    current_user.role = subscription_data.plan_type

    db.add(new_subscription)
    db.commit()
    db.refresh(new_subscription)

    return new_subscription


@router.get("/", response_model=List[SubscriptionResponse])
async def get_subscriptions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all subscriptions for current user"""
    subscriptions = db.query(Subscription).filter(
        Subscription.user_id == current_user.id
    ).order_by(Subscription.created_at.desc()).all()

    return subscriptions


@router.get("/active", response_model=SubscriptionResponse)
async def get_active_subscription(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get active subscription for current user"""
    subscription = db.query(Subscription).filter(
        Subscription.user_id == current_user.id,
        Subscription.status == "active",
        Subscription.end_date > datetime.utcnow()
    ).first()

    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active subscription found"
        )

    return subscription


@router.post("/{subscription_id}/cancel", response_model=SubscriptionResponse)
async def cancel_subscription(
    subscription_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Cancel a subscription"""
    subscription = db.query(Subscription).filter(
        Subscription.id == subscription_id,
        Subscription.user_id == current_user.id
    ).first()

    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription not found"
        )

    if subscription.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Subscription is not active"
        )

    # Cancel subscription
    subscription.status = "cancelled"
    subscription.auto_renew = False

    # Revert user role to free tier
    current_user.role = UserRole.USER

    db.commit()
    db.refresh(subscription)

    return subscription
