from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Enum, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class UserRole(str, enum.Enum):
    """User role enumeration"""
    USER = "user"
    PREMIUM = "premium"
    FAMILY = "family"
    ADMIN = "admin"
    AIRLINE_PARTNER = "airline_partner"


class FlightType(str, enum.Enum):
    """Flight type enumeration"""
    DOMESTIC = "domestic"
    INTERNATIONAL = "international"
    TRANSATLANTIC = "transatlantic"


class TransactionType(str, enum.Enum):
    """Transaction type enumeration"""
    CREDIT = "credit"  # Adding kg to wallet
    DEBIT = "debit"    # Using kg from wallet
    TRANSFER = "transfer"  # Transferring kg to another user
    EXPIRY = "expiry"  # Kg expired


class User(Base):
    """User model"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    phone_number = Column(String, nullable=True)
    role = Column(Enum(UserRole), default=UserRole.USER, nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    # Verification and Reset Tokens
    verification_token = Column(String, nullable=True, unique=True)
    verification_token_expires = Column(DateTime(timezone=True), nullable=True)
    reset_token = Column(String, nullable=True, unique=True)
    reset_token_expires = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    wallet = relationship("Wallet", back_populates="user", uselist=False)
    flights = relationship("Flight", back_populates="user")
    
    # Explicitly specify foreign_keys for transactions to avoid ambiguity with recipient_user_id
    transactions = relationship("Transaction", back_populates="user", foreign_keys="Transaction.user_id")
    received_transfers = relationship("Transaction", foreign_keys="Transaction.recipient_user_id")
    
    subscriptions = relationship("Subscription", back_populates="user")


class Wallet(Base):
    """Wallet model for storing baggage credits"""
    __tablename__ = "wallets"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    balance_kg = Column(Float, default=0.0, nullable=False)
    total_earned_kg = Column(Float, default=0.0, nullable=False)
    total_spent_kg = Column(Float, default=0.0, nullable=False)
    total_transferred_kg = Column(Float, default=0.0, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="wallet")


class Flight(Base):
    """Flight model for tracking user flights"""
    __tablename__ = "flights"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Flight details
    flight_number = Column(String, nullable=False)
    airline = Column(String, nullable=False)
    departure_airport = Column(String, nullable=False)
    arrival_airport = Column(String, nullable=False)
    flight_date = Column(DateTime(timezone=True), nullable=False)
    flight_type = Column(Enum(FlightType), nullable=False)
    
    # Baggage details
    allowed_weight_kg = Column(Float, nullable=False)
    actual_weight_kg = Column(Float, nullable=False)
    difference_kg = Column(Float, nullable=False)  # Can be positive (saved) or negative (excess)
    
    # OCR scan details
    ticket_image_url = Column(String, nullable=True)
    scan_verified = Column(Boolean, default=False)
    
    # Credit calculation
    credit_value_kg = Column(Float, default=0.0)  # After applying multipliers
    is_credited = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="flights")


class Transaction(Base):
    """Transaction model for wallet operations"""
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    transaction_type = Column(Enum(TransactionType), nullable=False)
    amount_kg = Column(Float, nullable=False)
    balance_after = Column(Float, nullable=False)
    
    # Related flight (if applicable)
    flight_id = Column(Integer, ForeignKey("flights.id"), nullable=True)
    
    # Transfer details (if applicable)
    recipient_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Service fee
    service_fee = Column(Float, default=0.0)
    
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="transactions", foreign_keys=[user_id])


class Subscription(Base):
    """Subscription model for premium plans"""
    __tablename__ = "subscriptions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    plan_type = Column(String, nullable=False)  # PREMIUM or FAMILY
    status = Column(String, default="active")  # active, cancelled, expired
    
    start_date = Column(DateTime(timezone=True), server_default=func.now())
    end_date = Column(DateTime(timezone=True), nullable=True)
    
    # Payment details
    stripe_subscription_id = Column(String, nullable=True)
    stripe_customer_id = Column(String, nullable=True)
    price_paid = Column(Float, nullable=False)
    currency = Column(String, default="EUR")
    
    auto_renew = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="subscriptions")


class Airline(Base):
    """Airline partner model for B2B dashboard"""
    __tablename__ = "airlines"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    iata_code = Column(String(2), unique=True, nullable=False)
    icao_code = Column(String(3), unique=True, nullable=False)
    
    # Partner status
    is_partner = Column(Boolean, default=False)
    partner_since = Column(DateTime(timezone=True), nullable=True)
    
    # Contact
    contact_email = Column(String, nullable=True)
    contact_phone = Column(String, nullable=True)
    
    # Commission rate
    commission_rate = Column(Float, default=0.0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class NotificationType(str, enum.Enum):
    """Notification type enumeration"""
    INFO = "info"
    SUCCESS = "success"
    WARNING = "warning"
    ERROR = "error"
    CREDIT = "credit"
    DEBIT = "debit"
    TRANSFER = "transfer"
    SYSTEM = "system"


class Notification(Base):
    """Notification model for in-app notifications"""
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Notification content
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(Enum(NotificationType), default=NotificationType.INFO, nullable=False)
    
    # Status
    is_read = Column(Boolean, default=False)
    read_at = Column(DateTime(timezone=True), nullable=True)
    
    # Optional link/action
    action_url = Column(String, nullable=True)
    action_label = Column(String, nullable=True)
    
    # Related entities (optional)
    related_flight_id = Column(Integer, ForeignKey("flights.id"), nullable=True)
    related_transaction_id = Column(Integer, ForeignKey("transactions.id"), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", backref="notifications")

