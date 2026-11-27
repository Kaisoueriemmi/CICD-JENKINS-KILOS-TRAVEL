from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.v1.endpoints.auth import get_current_user
from app.models.models import User, Subscription
from app.services.stripe_service import get_stripe_service, StripeService
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()


class CheckoutSessionRequest(BaseModel):
    """Request model for creating checkout session"""
    plan_type: str  # 'premium' or 'family'


class CheckoutSessionResponse(BaseModel):
    """Response model for checkout session"""
    session_id: str
    url: str


class CustomerPortalRequest(BaseModel):
    """Request model for customer portal"""
    return_url: str


class CustomerPortalResponse(BaseModel):
    """Response model for customer portal"""
    url: str


class PaymentHistoryResponse(BaseModel):
    """Response model for payment history"""
    id: int
    amount: float
    plan_type: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


@router.post("/create-checkout", response_model=CheckoutSessionResponse)
async def create_checkout_session(
    request: CheckoutSessionRequest,
    current_user: User = Depends(get_current_user),
    stripe_service: StripeService = Depends(get_stripe_service)
):
    """
    Create a Stripe checkout session for subscription payment

    This endpoint creates a Stripe Checkout session that redirects
    the user to Stripe's hosted payment page.
    """
    # Validate plan type
    valid_plans = ['premium', 'family']
    if request.plan_type.lower() not in valid_plans:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid plan type. Must be one of: {', '.join(valid_plans)}"
        )

    # Create checkout session
    success_url = "http://localhost:3000/subscription?success=true"
    cancel_url = "http://localhost:3000/subscription?cancelled=true"

    session_data = stripe_service.create_checkout_session(
        user_email=current_user.email,
        plan_type=request.plan_type,
        success_url=success_url,
        cancel_url=cancel_url
    )

    if not session_data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create checkout session. Please try again later."
        )

    return CheckoutSessionResponse(**session_data)


@router.post("/customer-portal", response_model=CustomerPortalResponse)
async def create_customer_portal_session(
    request: CustomerPortalRequest,
    current_user: User = Depends(get_current_user),
    stripe_service: StripeService = Depends(get_stripe_service),
    db: Session = Depends(get_db)
):
    """
    Create a Stripe Customer Portal session

    This allows users to manage their subscription, update payment methods,
    and view billing history.
    """
    # Get user's active subscription
    subscription = db.query(Subscription).filter(
        Subscription.user_id == current_user.id,
        Subscription.status == 'active'
    ).first()

    if not subscription or not subscription.stripe_customer_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active subscription found"
        )

    # Create portal session
    portal_url = stripe_service.create_customer_portal_session(
        customer_id=subscription.stripe_customer_id,
        return_url=request.return_url
    )

    if not portal_url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create customer portal session"
        )

    return CustomerPortalResponse(url=portal_url)


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    stripe_service: StripeService = Depends(get_stripe_service),
    db: Session = Depends(get_db)
):
    """
    Handle Stripe webhook events

    This endpoint receives and processes webhook events from Stripe,
    such as successful payments, subscription updates, and cancellations.
    """
    # Get the webhook payload and signature
    payload = await request.body()
    signature = request.headers.get('stripe-signature')

    if not signature:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing Stripe signature"
        )

    # Verify webhook signature
    event = stripe_service.verify_webhook_signature(payload, signature)

    if not event:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid webhook signature"
        )

    # Handle different event types
    event_type = event['type']

    if event_type == 'checkout.session.completed':
        # Payment successful, create/update subscription
        session = event['data']['object']
        subscription_data = stripe_service.handle_checkout_completed(session)

        # Find user by email
        user = db.query(User).filter(User.email == subscription_data['customer_email']).first()

        if user:
            # Update user role
            plan_type = subscription_data['plan_type']
            if plan_type == 'premium':
                user.role = 'premium'
            elif plan_type == 'family':
                user.role = 'family'

            # Create subscription record
            new_subscription = Subscription(
                user_id=user.id,
                plan_type=plan_type,
                status='active',
                stripe_subscription_id=subscription_data['subscription_id'],
                stripe_customer_id=session.get('customer'),
                price_paid=subscription_data['amount_paid'],
                auto_renew=True
            )

            db.add(new_subscription)
            db.commit()

    elif event_type == 'customer.subscription.updated':
        # Subscription updated
        subscription = event['data']['object']
        subscription_data = stripe_service.handle_subscription_updated(subscription)

        # Update subscription in database
        db_subscription = db.query(Subscription).filter(
            Subscription.stripe_subscription_id == subscription_data['subscription_id']
        ).first()

        if db_subscription:
            db_subscription.status = subscription_data['status']
            db_subscription.auto_renew = not subscription_data['cancel_at_period_end']
            db.commit()

    elif event_type == 'customer.subscription.deleted':
        # Subscription cancelled
        subscription = event['data']['object']
        subscription_data = stripe_service.handle_subscription_deleted(subscription)

        # Update subscription in database
        db_subscription = db.query(Subscription).filter(
            Subscription.stripe_subscription_id == subscription_data['subscription_id']
        ).first()

        if db_subscription:
            db_subscription.status = 'cancelled'
            db_subscription.auto_renew = False

            # Downgrade user to free plan
            user = db.query(User).filter(User.id == db_subscription.user_id).first()
            if user:
                user.role = 'user'

            db.commit()

    return {"status": "success"}


@router.get("/history", response_model=List[PaymentHistoryResponse])
async def get_payment_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get payment history for current user

    Returns a list of all past subscription payments.
    """
    subscriptions = db.query(Subscription).filter(
        Subscription.user_id == current_user.id
    ).order_by(Subscription.created_at.desc()).all()

    return [
        PaymentHistoryResponse(
            id=sub.id,
            amount=sub.price_paid,
            plan_type=sub.plan_type,
            status=sub.status,
            created_at=sub.created_at
        )
        for sub in subscriptions
    ]
