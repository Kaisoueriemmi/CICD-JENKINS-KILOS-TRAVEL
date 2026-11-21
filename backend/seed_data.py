import logging
import random
from datetime import datetime, timedelta

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.models.models import Base, User, Flight, Wallet, Transaction, Notification, UserRole, FlightType, TransactionType, NotificationType
from app.core.security import get_password_hash

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db():
    Base.metadata.create_all(bind=engine)

def seed_data(db: Session):
    logger.info("Starting data seeding...")

    # 1. Create Users
    # Check if demo user exists
    demo_user = db.query(User).filter(User.email == "demo@airweight.io").first()
    if not demo_user:
        logger.info("Creating demo user...")
        demo_user = User(
            email="demo@airweight.io",
            hashed_password=get_password_hash("password123"),
            full_name="Jean Dupont",
            role=UserRole.PREMIUM,
            is_active=True,
            is_verified=True
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)
        
        # Create Wallet for demo user
        wallet = Wallet(
            user_id=demo_user.id,
            balance_kg=15.5,
            total_earned_kg=45.0,
            total_spent_kg=10.0,
            total_transferred_kg=19.5
        )
        db.add(wallet)
        db.commit()
    else:
        logger.info("Demo user exists, checking wallet...")
        if not db.query(Wallet).filter(Wallet.user_id == demo_user.id).first():
            logger.info("Creating wallet for existing demo user...")
            wallet = Wallet(
                user_id=demo_user.id,
                balance_kg=15.5,
                total_earned_kg=45.0,
                total_spent_kg=10.0,
                total_transferred_kg=19.5
            )
            db.add(wallet)
            db.commit()
    
    # Check if admin user exists
    admin_user = db.query(User).filter(User.email == "admin@airweight.io").first()
    if not admin_user:
        logger.info("Creating admin user...")
        admin_user = User(
            email="admin@airweight.io",
            hashed_password=get_password_hash("admin123"),
            full_name="Admin System",
            role=UserRole.ADMIN,
            is_active=True,
            is_verified=True
        )
        db.add(admin_user)
        db.commit()
        # Admin usually doesn't need a wallet, but let's be safe
        wallet = Wallet(user_id=admin_user.id, balance_kg=9999.0)
        db.add(wallet)
        db.commit()
    else:
        if not db.query(Wallet).filter(Wallet.user_id == admin_user.id).first():
            wallet = Wallet(user_id=admin_user.id, balance_kg=9999.0)
            db.add(wallet)
            db.commit()

    # 2. Create Flights (only if none exist for demo user)
    flights_count = db.query(Flight).filter(Flight.user_id == demo_user.id).count()
    if flights_count == 0:
        logger.info("Creating flights...")
        flights = [
            Flight(
                user_id=demo_user.id,
                flight_number="AF1234",
                airline="Air France",
                departure_airport="CDG",
                arrival_airport="JFK",
                flight_date=datetime.now() - timedelta(days=5),
                flight_type=FlightType.INTERNATIONAL,
                allowed_weight_kg=23.0,
                actual_weight_kg=18.5,
                difference_kg=4.5
            ),
            Flight(
                user_id=demo_user.id,
                flight_number="TU720",
                airline="Tunisair",
                departure_airport="ORY",
                arrival_airport="TUN",
                flight_date=datetime.now() - timedelta(days=20),
                flight_type=FlightType.INTERNATIONAL,
                allowed_weight_kg=23.0,
                actual_weight_kg=20.0,
                difference_kg=3.0
            ),
            Flight(
                user_id=demo_user.id,
                flight_number="DL085",
                airline="Delta",
                departure_airport="ATL",
                arrival_airport="CDG",
                flight_date=datetime.now() + timedelta(days=10),
                flight_type=FlightType.TRANSATLANTIC,
                allowed_weight_kg=32.0,
                actual_weight_kg=0.0, # Not flown yet
                difference_kg=0.0
            )
        ]
        db.add_all(flights)
        db.commit()

    # 3. Create Transactions
    trx_count = db.query(Transaction).filter(Transaction.user_id == demo_user.id).count()
    if trx_count == 0:
        logger.info("Creating transactions...")
        transactions = [
            Transaction(
                user_id=demo_user.id,
                amount_kg=4.5,
                transaction_type=TransactionType.CREDIT,
                description="Crédit vol AF1234",
                created_at=datetime.now() - timedelta(days=5),
                balance_after=4.5
            ),
            Transaction(
                user_id=demo_user.id,
                amount_kg=3.0,
                transaction_type=TransactionType.CREDIT,
                description="Crédit vol TU720",
                created_at=datetime.now() - timedelta(days=20),
                balance_after=7.5
            ),
            Transaction(
                user_id=demo_user.id,
                amount_kg=-2.0,
                transaction_type=TransactionType.TRANSFER,
                description="Transfert à Marie",
                created_at=datetime.now() - timedelta(days=2),
                balance_after=5.5
            ),
            Transaction(
                user_id=demo_user.id,
                amount_kg=-10.0,
                transaction_type=TransactionType.DEBIT,
                description="Utilisation sur vol EasyJet",
                created_at=datetime.now() - timedelta(days=15),
                balance_after=-4.5 # Inconsistent time/balance but ok for seed
            )
        ]
        db.add_all(transactions)
        db.commit()

    # 4. Create Notifications
    notif_count = db.query(Notification).filter(Notification.user_id == demo_user.id).count()
    if notif_count == 0:
        logger.info("Creating notifications...")
        notifications = [
            Notification(
                user_id=demo_user.id,
                title="Bienvenue sur AirWeight",
                message="Votre compte Premium est activé. Profitez de vos avantages !",
                notification_type=NotificationType.SUCCESS,
                is_read=True,
                created_at=datetime.now() - timedelta(days=30)
            ),
            Notification(
                user_id=demo_user.id,
                title="Nouveau crédit validé",
                message="Vous avez gagné 4.5kg sur votre vol Air France AF1234.",
                notification_type=NotificationType.CREDIT,
                is_read=False,
                created_at=datetime.now() - timedelta(hours=2)
            ),
            Notification(
                user_id=demo_user.id,
                title="Rappel de vol",
                message="N'oubliez pas d'enregistrer vos bagages pour votre vol Delta vers Paris.",
                notification_type=NotificationType.INFO,
                is_read=False,
                created_at=datetime.now() - timedelta(minutes=15)
            ),
            Notification(
                user_id=demo_user.id,
                title="Offre Spéciale",
                message="Doublez vos points si vous voyagez avec Tunisair ce mois-ci !",
                notification_type=NotificationType.WARNING,
                is_read=False,
                created_at=datetime.now() - timedelta(days=1)
            )
        ]
        db.add_all(notifications)
        db.commit()

    logger.info("Data seeding completed successfully!")

    logger.info("Data seeding completed successfully!")

def main():
    db = SessionLocal()
    try:
        # init_db() # Assuming tables are already created by alembic or main app
        seed_data(db)
    except Exception:
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()
