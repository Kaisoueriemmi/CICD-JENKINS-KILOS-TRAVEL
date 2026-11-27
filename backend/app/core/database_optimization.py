"""
Database optimization utilities for better query performance.
"""

from sqlalchemy import Index, func
from sqlalchemy.orm import Session
from sqlalchemy.pool import QueuePool
from backend.app.models.models import User, Flight, Notification, Wallet, Transaction


def create_indexes(engine):
    """Create indexes for commonly queried fields."""
    indexes = [
        # User indexes
        Index('idx_user_email', User.email, unique=True),
        Index('idx_user_username', User.username, unique=True),
        Index('idx_user_created_at', User.created_at),

        # Flight indexes
        Index('idx_flight_user_id', Flight.user_id),
        Index('idx_flight_status', Flight.status),
        Index('idx_flight_created_at', Flight.created_at),
        Index('idx_flight_user_status', Flight.user_id, Flight.status),

        # Notification indexes
        Index('idx_notification_user_id', Notification.user_id),
        Index('idx_notification_is_read', Notification.is_read),
        Index('idx_notification_created_at', Notification.created_at),
        Index('idx_notification_user_unread', Notification.user_id, Notification.is_read),

        # Transaction indexes
        Index('idx_transaction_wallet_id', Transaction.wallet_id),
        Index('idx_transaction_created_at', Transaction.created_at),
        Index('idx_transaction_type', Transaction.transaction_type),
    ]

    for index in indexes:
        index.create(engine, if_not_exists=True)


def get_connection_pool_config():
    """Return optimal connection pool configuration."""
    return {
        'poolclass': QueuePool,
        'pool_size': 20,
        'max_overflow': 40,
        'pool_pre_ping': True,  # Test connections before using
        'pool_recycle': 3600,   # Recycle connections after 1 hour
        'echo_pool': False,
    }


class QueryOptimizer:
    """Utilities for optimizing database queries."""

    @staticmethod
    def get_user_flights(db: Session, user_id: int, skip: int = 0, limit: int = 10):
        """Optimized query to fetch user flights with related data."""
        return (
            db.query(Flight)
            .filter(Flight.user_id == user_id)
            .order_by(Flight.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    @staticmethod
    def get_user_flight_stats(db: Session, user_id: int):
        """Get aggregated flight statistics efficiently."""
        return db.query(
            func.count(Flight.id).label('total_flights'),
            func.sum(Flight.credited_weight).label('total_credited'),
            func.count(Flight.id).filter(Flight.status == 'pending').label('pending_flights'),
        ).filter(Flight.user_id == user_id).first()

    @staticmethod
    def get_user_notifications(db: Session, user_id: int, unread_only: bool = False, skip: int = 0, limit: int = 20):
        """Optimized query to fetch user notifications."""
        query = db.query(Notification).filter(Notification.user_id == user_id)

        if unread_only:
            query = query.filter(Notification.is_read == False)

        return query.order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()

    @staticmethod
    def get_notification_count(db: Session, user_id: int):
        """Get count of unread notifications efficiently."""
        return db.query(func.count(Notification.id)).filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        ).scalar()

    @staticmethod
    def get_wallet_transactions(db: Session, wallet_id: int, skip: int = 0, limit: int = 10):
        """Optimized query to fetch wallet transactions."""
        return (
            db.query(Transaction)
            .filter(Transaction.wallet_id == wallet_id)
            .order_by(Transaction.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    @staticmethod
    def get_wallet_summary(db: Session, wallet_id: int):
        """Get wallet summary statistics efficiently."""
        return db.query(
            Wallet.balance,
            func.sum(Transaction.amount).filter(Transaction.transaction_type == 'credit').label('total_credited'),
            func.sum(Transaction.amount).filter(Transaction.transaction_type == 'debit').label('total_debited'),
        ).join(Transaction, Wallet.id == Transaction.wallet_id).filter(
            Wallet.id == wallet_id
        ).first()


class CacheHelper:
    """Caching strategy for frequently accessed data."""

    # Cache keys
    USER_PROFILE_KEY = 'user_profile:{user_id}'
    USER_FLIGHTS_KEY = 'user_flights:{user_id}:{skip}:{limit}'
    USER_NOTIFICATIONS_KEY = 'user_notifications:{user_id}:{skip}:{limit}'
    WALLET_BALANCE_KEY = 'wallet_balance:{wallet_id}'

    # Cache durations (in seconds)
    PROFILE_CACHE_DURATION = 300  # 5 minutes
    FLIGHTS_CACHE_DURATION = 120  # 2 minutes
    NOTIFICATIONS_CACHE_DURATION = 60  # 1 minute
    WALLET_CACHE_DURATION = 60  # 1 minute

    @staticmethod
    def get_cache_key(template: str, **kwargs) -> str:
        """Generate cache key from template."""
        return template.format(**kwargs)
