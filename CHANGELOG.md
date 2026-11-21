# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-02-04

### Added - Frontend

- 🔔 **Complete Notification System**
  - New `/notifications` page with full notification management
  - `NotificationBell` component for navbar with live badge counter
  - Notification dropdown with latest 5 notifications
  - Mark individual notifications as read
  - Mark all notifications as read
  - Delete notifications
  - Auto-refresh every 30 seconds
  - Filter by unread/all

- 📡 **API Client Service** (`lib/api.ts`)
  - Centralized axios instance with JWT token auto-injection
  - API groups: flightAPI, notificationsAPI, walletAPI, authAPI, userAPI
  - Request interceptors for authentication
  - Response handling

- 🎨 **UI Enhancements**
  - Integrated NotificationBell into Navbar
  - Enhanced navigation with notification support
  - Responsive notification badge with counter

### Technical

- Added NotificationBell component to Navbar
- Implemented API service layer for frontend-backend communication
- Full CRUD operations for notifications via API endpoints
- Notifications page with pagination and filtering

---

## [1.1.0] - 2026-01-26

### Added

- 🚀 Initial release of AirWeight platform
- ✨ User authentication and authorization system
- 💰 Virtual wallet for baggage credits
- ✈️ Flight tracking and credit calculation
- 📊 Transaction history and management
- 💳 Subscription plans (Free, Premium, Family)
- 🎨 Premium landing page with modern UI
- 🐳 Docker containerization for easy deployment
- 📚 Comprehensive API documentation
- 🔐 JWT-based security
- 🗄️ PostgreSQL database integration
- 🎯 Dynamic credit conversion based on flight type
- 📱 Responsive design for all devices

### Backend Features

- FastAPI REST API with OpenAPI documentation
- SQLAlchemy ORM with Alembic migrations
- User role management (User, Premium, Family, Admin, Airline Partner)
- Wallet balance tracking and statistics
- Flight credit calculation with multipliers
- Transaction logging and auditing
- Subscription management with Stripe integration ready
- Redis caching support
- Celery for async tasks

### Frontend Features

- Next.js 14 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Framer Motion for animations
- Zustand for state management
- Axios for API communication
- Premium landing page with hero section
- Features showcase
- Pricing comparison
- Responsive navigation

### Documentation

- README.md with project overview
- DEVELOPMENT.md with setup instructions
- API documentation via Swagger UI
- Docker Compose configuration
- Environment variables template

### Security

- Password hashing with bcrypt
- JWT access and refresh tokens
- Token refresh mechanism
- CORS configuration
- Rate limiting ready
- Input validation with Pydantic

## [1.2.0] - 2026-02-04

### Backend Updates

- 🎫 **OCR Ticket Scanning Endpoint** (`POST /api/v1/flights/scan-ticket`)
  - Upload and scan baggage tickets (images/PDF)
  - Automatic extraction of flight number, weight, and bag tag
  - Support for Google Vision API with Tesseract fallback
  - Comprehensive error handling and file validation

- 🔍 **Baggage Allowance Lookup** (`POST /api/v1/flights/lookup-allowance`)
  - Integration with Amadeus API for accurate baggage allowances
  - Intelligent fallback system with default values
  - Automatic flight type detection

- ✉️ **Email Verification System**
  - Email verification endpoint (`POST /auth/verify-email`)
  - Resend verification email (`POST /auth/resend-verification`)
  - Complete SMTP email service
  - Professional HTML email templates (verification, welcome, password reset)
  - Token-based verification with expiration (24 hours)

- 🔐 **Password Reset System**
  - Forgot password endpoint (`POST /auth/forgot-password`)
  - Reset password endpoint (`POST /auth/reset-password`)
  - Secure token generation with 1-hour expiration
  - Email notifications for password reset requests

### Frontend Updates

- ✈️ **Flights List Page** (`/flights`)
  - Complete flights list with pagination (10 items per page)
  - Advanced filters (airline, status, flight type)
  - Statistics dashboard (total flights, credited, pending, total credits)
  - Premium UI with gradient backgrounds and animations
  - Responsive table with flight details
  - Direct navigation to flight details

- 📊 **Flight Detail Page** (`/flights/[id]`)
  - Comprehensive flight information display
  - Visual credit calculation breakdown
  - Interactive weight usage progress bar
  - One-click wallet crediting functionality
  - Status indicators (credited, scan verified)
  - Contextual help and information cards
  - Premium gradient design with smooth transitions

### Improved

- Enhanced user registration flow with email verification
- Better security with password reset tokens
- Improved error handling across all new endpoints
- Updated User model to support verification and reset tokens

### Technical Details

- Added email service dependency (`app/services/email_service.py`)
- Extended auth endpoints with 4 new routes
- Added 2 new flight endpoints
- Created Pydantic models for OCR and baggage allowance responses
- Implemented file upload handling with temporary file management

## [Unreleased]

### Planned Features

- 📸 OCR integration for ticket scanning
- 🤝 Marketplace for kg transfers
- 📊 B2B dashboard for airline partners
- 📱 Mobile application (React Native)
- 🌍 Multi-language support
- 📧 Email notifications
- 📈 Advanced analytics
- 🎁 Referral program
- 🔔 Push notifications
- 🌐 PWA support

---

## Attribution

*Project maintained by Kais Oueriemmi*
