"""
Database initialization script
Creates initial data for testing and development
"""
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.models.models import User, Wallet, Airline, UserRole
from app.core.security import get_password_hash
from datetime import datetime

def init_db():
    """Initialize database with sample data"""
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Check if admin user already exists
        admin = db.query(User).filter(User.email == "admin@airweight.io").first()
        if not admin:
            # Create admin user
            admin = User(
                email="admin@airweight.io",
                hashed_password=get_password_hash("Admin123!"),
                full_name="Admin User",
                role=UserRole.ADMIN,
                is_active=True,
                is_verified=True
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
            
            # Create wallet for admin
            admin_wallet = Wallet(user_id=admin.id)
            db.add(admin_wallet)
            
            print("✅ Admin user created: admin@airweight.io / Admin123!")
        
        # Create test user
        test_user = db.query(User).filter(User.email == "test@airweight.io").first()
        if not test_user:
            test_user = User(
                email="test@airweight.io",
                hashed_password=get_password_hash("Test123!"),
                full_name="Test User",
                role=UserRole.USER,
                is_active=True,
                is_verified=True
            )
            db.add(test_user)
            db.commit()
            db.refresh(test_user)
            
            # Create wallet for test user
            test_wallet = Wallet(user_id=test_user.id, balance_kg=10.5)
            db.add(test_wallet)
            
            print("✅ Test user created: test@airweight.io / Test123!")
        
        # Create sample airlines
        airlines_data = [
            {"name": "Air France", "iata_code": "AF", "icao_code": "AFR", "is_partner": True},
            {"name": "Tunisair", "iata_code": "TU", "icao_code": "TAR", "is_partner": True},
            {"name": "Lufthansa", "iata_code": "LH", "icao_code": "DLH", "is_partner": False},
            {"name": "Emirates", "iata_code": "EK", "icao_code": "UAE", "is_partner": False},
            {"name": "British Airways", "iata_code": "BA", "icao_code": "BAW", "is_partner": False},
        ]
        
        for airline_data in airlines_data:
            existing = db.query(Airline).filter(
                Airline.iata_code == airline_data["iata_code"]
            ).first()
            
            if not existing:
                airline = Airline(**airline_data)
                if airline.is_partner:
                    airline.partner_since = datetime.utcnow()
                    airline.commission_rate = 0.05
                db.add(airline)
        
        db.commit()
        print("✅ Sample airlines created")
        
        print("\n🎉 Database initialized successfully!")
        print("\n📝 Test Credentials:")
        print("   Admin: admin@airweight.io / Admin123!")
        print("   User:  test@airweight.io / Test123!")
        
    except Exception as e:
        print(f"❌ Error initializing database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    import sys
    
    print("🚀 Initializing AirWeight database...")
    
    if len(sys.argv) > 1 and sys.argv[1] == "--reset":
        print("⚠️ Resetting database (dropping all tables)...")
        Base.metadata.drop_all(bind=engine)
    
    init_db()
