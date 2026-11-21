from app.core.database import engine, Base
from app.models.models import User, Flight, Wallet, Transaction, Notification, Subscription

def reset():
    print("Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    print("Creating all tables...")
    Base.metadata.create_all(bind=engine)
    print("Database reset complete.")

if __name__ == "__main__":
    reset()
