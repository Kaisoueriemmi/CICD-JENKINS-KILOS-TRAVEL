from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.v1.endpoints.auth import get_current_user
from app.models.models import User, Transaction, Wallet, TransactionType
from app.schemas.schemas import TransactionResponse
from app.core.config import settings
from app.services.baggage_credit import check_debit, service_fee as compute_service_fee

router = APIRouter()


@router.get("/", response_model=List[TransactionResponse])
async def get_transactions(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all transactions for current user"""
    transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id
    ).order_by(Transaction.created_at.desc()).offset(skip).limit(limit).all()

    return transactions


@router.post("/debit", response_model=TransactionResponse)
async def debit_from_wallet(
    amount_kg: float,
    description: str = "Debit for baggage excess",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Debit kg from wallet (use credits for excess baggage)"""
    if amount_kg <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Amount must be positive"
        )

    # Get wallet
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    if not wallet:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Wallet not found")

    try:
        new_balance = check_debit(wallet.balance_kg, amount_kg)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    service_fee = compute_service_fee(amount_kg)

    # Update wallet
    wallet.balance_kg = new_balance
    wallet.total_spent_kg += amount_kg

    # Create transaction
    transaction = Transaction(
        user_id=current_user.id,
        transaction_type=TransactionType.DEBIT,
        amount_kg=amount_kg,
        balance_after=wallet.balance_kg,
        service_fee=service_fee,
        description=description
    )

    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    return transaction


@router.post("/transfer", response_model=TransactionResponse)
async def transfer_to_user(
    recipient_email: str,
    amount_kg: float,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Transfer kg to another user"""
    if amount_kg <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Amount must be positive"
        )

    # Check if marketplace is enabled
    if not settings.ENABLE_MARKETPLACE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Marketplace feature is not enabled"
        )

    # Get recipient
    recipient = db.query(User).filter(User.email == recipient_email).first()
    if not recipient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipient not found"
        )

    if recipient.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot transfer to yourself"
        )

    # Get sender wallet
    sender_wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()

    if sender_wallet.balance_kg < amount_kg:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient balance. Available: {sender_wallet.balance_kg} kg"
        )

    # Get recipient wallet
    recipient_wallet = db.query(Wallet).filter(Wallet.user_id == recipient.id).first()

    # Update wallets
    sender_wallet.balance_kg -= amount_kg
    sender_wallet.total_transferred_kg += amount_kg

    recipient_wallet.balance_kg += amount_kg
    recipient_wallet.total_earned_kg += amount_kg

    # Create sender transaction
    sender_transaction = Transaction(
        user_id=current_user.id,
        transaction_type=TransactionType.TRANSFER,
        amount_kg=-amount_kg,
        balance_after=sender_wallet.balance_kg,
        recipient_user_id=recipient.id,
        description=f"Transfer to {recipient.email}"
    )

    # Create recipient transaction
    recipient_transaction = Transaction(
        user_id=recipient.id,
        transaction_type=TransactionType.TRANSFER,
        amount_kg=amount_kg,
        balance_after=recipient_wallet.balance_kg,
        description=f"Transfer from {current_user.email}"
    )

    db.add(sender_transaction)
    db.add(recipient_transaction)
    db.commit()
    db.refresh(sender_transaction)

    return sender_transaction
