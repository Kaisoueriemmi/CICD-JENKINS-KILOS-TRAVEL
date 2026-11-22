from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, wallet, flights, transactions, subscriptions, payments, notifications, iata, baggage

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(wallet.router, prefix="/wallet", tags=["Wallet"])
api_router.include_router(flights.router, prefix="/flights", tags=["Flights"])
api_router.include_router(transactions.router, prefix="/transactions", tags=["Transactions"])
api_router.include_router(subscriptions.router, prefix="/subscriptions", tags=["Subscriptions"])
api_router.include_router(payments.router, prefix="/payments", tags=["Payments"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(iata.router, prefix="/iata", tags=["IATA Integration"])
api_router.include_router(baggage.router, prefix="/baggage", tags=["Baggage credit"])
