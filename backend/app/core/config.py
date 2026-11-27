from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List, Union, Optional


class Settings(BaseSettings):
    # Project Info
    PROJECT_NAME: str = "AirWeight API"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "sqlite:///./sql_app.db"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # Security
    SECRET_KEY: str = "your-super-secret-key-change-in-production-min-32-chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    CORS_ORIGINS: Union[List[str], str] = ["http://localhost:3000", "http://localhost:8000"]
    ALLOWED_HOSTS: List[str] = ["*"]

    @field_validator('CORS_ORIGINS', mode='before')
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(',')]
        return v

    # API Keys
    GOOGLE_VISION_API_KEY: str = ""
    TESSERACT_PATH: str = "/usr/bin/tesseract"

    # Amadeus API (Aviation Data)
    AMADEUS_API_KEY: str = ""
    AMADEUS_API_SECRET: str = ""

    # Email
    SMTP_TLS: bool = True
    SMTP_PORT: Optional[int] = 587
    SMTP_HOST: Optional[str] = None
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAILS_FROM_EMAIL: Optional[str] = None
    EMAILS_FROM_NAME: Optional[str] = None

    # IATA Integration
    IATA_API_URL: str = "https://api.developer.iata.org/hub"  # Default sandbox/hub URL
    IATA_API_KEY: Optional[str] = None

    # Payment
    STRIPE_PUBLISHABLE_KEY: str = ""
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    STRIPE_PREMIUM_PRICE_ID: str = ""
    STRIPE_FAMILY_PRICE_ID: str = ""

    # File Upload
    MAX_UPLOAD_SIZE: int = 10485760  # 10MB
    ALLOWED_EXTENSIONS: List[str] = ["jpg", "jpeg", "png", "pdf"]
    UPLOAD_DIR: str = "uploads"

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    RATE_LIMIT_ENABLED: bool = True  # set to false in automated tests

    # Frontend (links in emails)
    FRONTEND_URL: str = "http://localhost:3000"

    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "logs/airweight.log"

    # Feature Flags
    ENABLE_MARKETPLACE: bool = False
    ENABLE_B2B_DASHBOARD: bool = False
    ENABLE_MOBILE_APP: bool = False

    # Baggage Credit System
    FREE_TIER_MAX_KG: int = 5
    PREMIUM_PRICE_MONTHLY: float = 4.99
    FAMILY_PRICE_MONTHLY: float = 9.99
    SERVICE_FEE_PER_KG: float = 1.0

    # Conversion Rates (base multipliers)
    DOMESTIC_FLIGHT_MULTIPLIER: float = 1.0
    INTERNATIONAL_FLIGHT_MULTIPLIER: float = 1.5
    TRANSATLANTIC_FLIGHT_MULTIPLIER: float = 2.0

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
