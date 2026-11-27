from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from datetime import datetime
from app.models.models import UserRole, FlightType, TransactionType, NotificationType


# ============= User Schemas =============

class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=100)
    phone_number: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=100)

    @validator('password')
    def validate_password(cls, v):
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain at least one digit')
        if not any(char.isupper() for char in v):
            raise ValueError('Password must contain at least one uppercase letter')
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone_number: Optional[str] = None


class UserResponse(UserBase):
    id: int
    role: UserRole
    is_active: bool
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ============= Wallet Schemas =============

class WalletResponse(BaseModel):
    id: int
    user_id: int
    balance_kg: float
    total_earned_kg: float
    total_spent_kg: float
    total_transferred_kg: float
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# ============= Flight Schemas =============

class FlightBase(BaseModel):
    flight_number: str
    airline: str
    departure_airport: str
    arrival_airport: str
    flight_date: datetime
    flight_type: FlightType
    allowed_weight_kg: float = Field(..., gt=0)
    actual_weight_kg: float = Field(..., gt=0)


class FlightCreate(FlightBase):
    ticket_image_url: Optional[str] = None


class FlightResponse(FlightBase):
    id: int
    user_id: int
    difference_kg: float
    credit_value_kg: float
    is_credited: bool
    scan_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ============= Transaction Schemas =============

class TransactionBase(BaseModel):
    transaction_type: TransactionType
    amount_kg: float
    description: Optional[str] = None


class TransactionCreate(TransactionBase):
    flight_id: Optional[int] = None
    recipient_user_id: Optional[int] = None


class TransactionResponse(TransactionBase):
    id: int
    user_id: int
    balance_after: float
    service_fee: float
    created_at: datetime

    class Config:
        from_attributes = True


# ============= Subscription Schemas =============

class SubscriptionCreate(BaseModel):
    plan_type: UserRole

    @validator('plan_type')
    def validate_plan_type(cls, v):
        if v not in [UserRole.PREMIUM, UserRole.FAMILY]:
            raise ValueError('Plan type must be PREMIUM or FAMILY')
        return v


class SubscriptionResponse(BaseModel):
    id: int
    user_id: int
    plan_type: UserRole
    status: str
    start_date: datetime
    end_date: datetime
    amount: float
    currency: str
    auto_renew: bool

    class Config:
        from_attributes = True


# ============= OCR Schemas =============

class OCRScanRequest(BaseModel):
    image_base64: str
    flight_id: Optional[int] = None


class OCRScanResponse(BaseModel):
    success: bool
    extracted_data: Optional[dict] = None
    error: Optional[str] = None


# ============= Auth Schemas =============

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[int] = None


# ============= Dashboard Schemas =============

class DashboardStats(BaseModel):
    total_kg_saved: float
    total_kg_used: float
    current_balance: float
    total_flights: int
    money_saved: float
    carbon_footprint_reduced: float


class AirlineStats(BaseModel):
    airline_name: str
    total_users: int
    total_kg_managed: float
    total_flights: int
    average_savings_per_flight: float


# ============= Notification Schemas =============

class NotificationBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    message: str = Field(..., min_length=1)
    notification_type: NotificationType = NotificationType.INFO


class NotificationCreate(NotificationBase):
    user_id: int
    action_url: Optional[str] = None
    action_label: Optional[str] = None
    related_flight_id: Optional[int] = None
    related_transaction_id: Optional[int] = None


class NotificationUpdate(BaseModel):
    is_read: Optional[bool] = None


class NotificationResponse(NotificationBase):
    id: int
    user_id: int
    is_read: bool
    read_at: Optional[datetime] = None
    action_url: Optional[str] = None
    action_label: Optional[str] = None
    related_flight_id: Optional[int] = None
    related_transaction_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationListResponse(BaseModel):
    notifications: list[NotificationResponse]
    total: int
    unread_count: int
