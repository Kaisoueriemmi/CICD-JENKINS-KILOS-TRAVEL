from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token, decode_token
from app.models.models import User, Wallet
from app.schemas.schemas import UserCreate, UserResponse, Token, UserLogin
from app.services.email_service import get_email_service, EmailService
from app.middleware.rate_limit import limiter, get_rate_limit
from datetime import timedelta, datetime
from pydantic import BaseModel, EmailStr
import secrets

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


class EmailVerificationRequest(BaseModel):
    """Request model for email verification"""
    token: str


class ResendVerificationRequest(BaseModel):
    """Request model for resending verification email"""
    email: EmailStr


class ForgotPasswordRequest(BaseModel):
    """Request model for forgot password"""
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    """Request model for password reset"""
    token: str
    new_password: str


class MessageResponse(BaseModel):
    """Generic message response"""
    message: str


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    """Get current authenticated user"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = decode_token(token)
    if payload is None:
        raise credentials_exception

    email: str = payload.get("sub")
    if email is None:
        raise credentials_exception

    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception

    return user


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit(get_rate_limit("auth_register"))
async def register(
    request: Request,
    user_data: UserCreate,
    db: Session = Depends(get_db),
    email_service: EmailService = Depends(get_email_service)
):
    """Register a new user"""
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Generate verification token
    verification_token = secrets.token_urlsafe(32)
    verification_token_expires = datetime.utcnow() + timedelta(hours=24)

    # Create new user
    new_user = User(
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
        full_name=user_data.full_name,
        phone_number=user_data.phone_number,
        verification_token=verification_token,
        verification_token_expires=verification_token_expires,
        is_verified=False
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create wallet for user
    wallet = Wallet(user_id=new_user.id)
    db.add(wallet)
    db.commit()

    # Send verification email
    email_service.send_verification_email(
        to_email=new_user.email,
        verification_token=verification_token,
        user_name=new_user.full_name
    )

    return new_user


@router.post("/login", response_model=Token)
@limiter.limit(get_rate_limit("auth_login"))
async def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login user and return access token"""
    user = db.query(User).filter(User.email == form_data.username).first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )

    # Create tokens
    access_token = create_access_token(data={"sub": user.email, "user_id": user.id})
    refresh_token = create_refresh_token(data={"sub": user.email, "user_id": user.id})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


@router.post("/refresh", response_model=Token)
async def refresh_token(refresh_token: str, db: Session = Depends(get_db)):
    """Refresh access token using refresh token"""
    payload = decode_token(refresh_token)

    if payload is None or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

    email = payload.get("sub")
    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    # Create new tokens
    new_access_token = create_access_token(data={"sub": user.email, "user_id": user.id})
    new_refresh_token = create_refresh_token(data={"sub": user.email, "user_id": user.id})

    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return current_user


@router.post("/verify-email", response_model=MessageResponse)
async def verify_email(
    request: EmailVerificationRequest,
    db: Session = Depends(get_db),
    email_service: EmailService = Depends(get_email_service)
):
    """Verify user email with token"""
    user = db.query(User).filter(User.verification_token == request.token).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification token"
        )

    # Check if token is expired
    if user.verification_token_expires and user.verification_token_expires < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification token has expired. Please request a new one."
        )

    # Verify user
    user.is_verified = True
    user.verification_token = None
    user.verification_token_expires = None
    db.commit()

    # Send welcome email
    email_service.send_welcome_email(
        to_email=user.email,
        user_name=user.full_name
    )

    return MessageResponse(message="Email verified successfully")


@router.post("/resend-verification", response_model=MessageResponse)
async def resend_verification(
    request: ResendVerificationRequest,
    db: Session = Depends(get_db),
    email_service: EmailService = Depends(get_email_service)
):
    """Resend verification email"""
    user = db.query(User).filter(User.email == request.email).first()

    if not user:
        # Don't reveal if email exists or not for security
        return MessageResponse(message="If the email exists, a verification link has been sent")

    if user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already verified"
        )

    # Generate new verification token
    verification_token = secrets.token_urlsafe(32)
    verification_token_expires = datetime.utcnow() + timedelta(hours=24)

    user.verification_token = verification_token
    user.verification_token_expires = verification_token_expires
    db.commit()

    # Send verification email
    email_service.send_verification_email(
        to_email=user.email,
        verification_token=verification_token,
        user_name=user.full_name
    )

    return MessageResponse(message="Verification email sent successfully")


@router.post("/forgot-password", response_model=MessageResponse)
@limiter.limit(get_rate_limit("auth_forgot_password"))
async def forgot_password(
    http_request: Request,
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db),
    email_service: EmailService = Depends(get_email_service)
):
    """Request password reset"""
    user = db.query(User).filter(User.email == request.email).first()

    # Don't reveal if email exists or not for security
    if not user:
        return MessageResponse(message="If the email exists, a password reset link has been sent")

    # Generate reset token
    reset_token = secrets.token_urlsafe(32)
    reset_token_expires = datetime.utcnow() + timedelta(hours=1)

    user.reset_token = reset_token
    user.reset_token_expires = reset_token_expires
    db.commit()

    # Send password reset email
    email_service.send_password_reset_email(
        to_email=user.email,
        reset_token=reset_token,
        user_name=user.full_name
    )

    return MessageResponse(message="Password reset link sent successfully")


@router.post("/reset-password", response_model=MessageResponse)
@limiter.limit(get_rate_limit("auth_reset_password"))
async def reset_password(
    http_request: Request,
    request: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    """Reset password with token"""
    user = db.query(User).filter(User.reset_token == request.token).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid reset token"
        )

    # Check if token is expired
    if user.reset_token_expires and user.reset_token_expires < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset token has expired. Please request a new one."
        )

    # Update password
    user.hashed_password = get_password_hash(request.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    db.commit()

    return MessageResponse(message="Password reset successfully")
