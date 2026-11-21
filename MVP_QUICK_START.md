# 🚀 KilosTravel MVP - Quick Start Guide

## ✅ MVP 100% Complété

Toutes les fonctionnalités du MVP ont été implémentées et testées. Voici comment démarrer rapidement :

---

## 🐳 Option 1: Docker (Recommandé)

### Démarrage Rapide

```bash
# Clone the repository
git clone https://github.com/Kaisoueriemmi/KilosTravel.git
cd KilosTravel

# Start with Docker Compose
docker-compose up -d

# Check services
docker-compose ps
```

**Services disponibles :**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Arrêter les services

```bash
docker-compose down
```

---

## 💻 Option 2: Local Development

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate
# Or (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Setup database
python init_db.py

# Run server
python -m uvicorn app.main:app --reload --port 8000
```

Backend running at: http://localhost:8000

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend running at: http://localhost:3000

---

## 🧪 Tester les Fonctionnalités

### 1. Authentication Flow
```bash
# Register
POST http://localhost:8000/api/v1/auth/register
Content-Type: application/json

{
  "email": "test@airweight.io",
  "password": "TestPassword123!",
  "full_name": "Test User",
  "phone_number": "+33612345678"
}

# Login
POST http://localhost:8000/api/v1/auth/login
Content-Type: application/x-www-form-urlencoded

username=test@airweight.io&password=TestPassword123!
```

### 2. OCR Ticket Scanning
```bash
POST http://localhost:8000/api/v1/flights/scan-ticket
Authorization: Bearer YOUR_TOKEN
Content-Type: multipart/form-data

file=@path/to/ticket.jpg
```

### 3. Notifications
```bash
# Get all notifications
GET http://localhost:8000/api/v1/notifications
Authorization: Bearer YOUR_TOKEN

# Mark as read
PATCH http://localhost:8000/api/v1/notifications/{id}/read
Authorization: Bearer YOUR_TOKEN

# Delete notification
DELETE http://localhost:8000/api/v1/notifications/{id}
Authorization: Bearer YOUR_TOKEN
```

### 4. Rate Limiting (Automatic)
- Auth endpoints: 3-5 requests/minute
- OCR scan: 10 requests/minute
- General API: 60 requests/minute
- Read operations: 100 requests/minute

---

## 📁 Project Structure

```
KilosTravel/
├── backend/
│   ├── app/
│   │   ├── api/v1/
│   │   │   └── endpoints/
│   │   │       ├── auth.py         (Authentication)
│   │   │       ├── flights.py      (Flight management)
│   │   │       ├── notifications.py (Notifications) ✨
│   │   │       ├── wallet.py       (Wallet)
│   │   │       └── ...
│   │   ├── models/
│   │   │   └── models.py           (Database models)
│   │   ├── services/
│   │   │   ├── notification_service.py ✨
│   │   │   ├── email_service.py
│   │   │   ├── ocr_service.py
│   │   │   └── ...
│   │   ├── middleware/
│   │   │   └── rate_limit.py       (Rate limiting)
│   │   └── main.py                 (App entry)
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── notifications/
│   │   │   │   └── page.tsx        (NEW ✨)
│   │   │   ├── flights/
│   │   │   ├── dashboard/
│   │   │   ├── wallet/
│   │   │   └── ...
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   ├── NotificationBell.tsx (NEW ✨)
│   │   │   ├── FileUpload.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── ...
│   │   └── lib/
│   │       └── api.ts              (NEW ✨)
│   ├── package.json
│   ├── tailwind.config.ts
│   └── Dockerfile
│
├── docker-compose.yml
├── CHANGELOG.md                    (Updated ✨)
├── MVP_COMPLETION_SUMMARY.md       (NEW ✨)
└── README.md
```

---

## 🎯 Features Implémentées

### ✈️ Flight Management
- ✅ List flights with pagination
- ✅ Add new flight (manual or OCR)
- ✅ View flight details
- ✅ Credit flight to wallet
- ✅ OCR ticket scanning with fallback

### 💰 Wallet System
- ✅ View balance
- ✅ Transaction history
- ✅ Credit calculations
- ✅ Subscription-based multipliers

### 🔔 Notifications (NEW)
- ✅ In-app notifications
- ✅ Notification badge with counter
- ✅ Real-time dropdown
- ✅ Full notifications management page
- ✅ Mark as read/delete
- ✅ Auto-refresh

### 🔐 Security
- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ Email verification
- ✅ Password reset
- ✅ Rate limiting
- ✅ CORS protection

### 💳 Subscriptions
- ✅ Free plan
- ✅ Premium plan
- ✅ Family plan
- ✅ Stripe integration ready

---

## 📊 Database Schema

### Key Tables
- `users` - User accounts
- `wallets` - User wallets
- `flights` - Flight records
- `notifications` - In-app notifications (✨ NEW)
- `transactions` - Transaction history
- `subscriptions` - Subscription plans

---

## 🧹 Maintenance Commands

```bash
# Build frontend
npm run build

# Run backend tests
pytest

# Format code (backend)
black .

# Lint (frontend)
npm run lint

# Type check (frontend)
npm run type-check
```

---

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL is running
# Update .env with correct DB_URL
```

### Port Already in Use
```bash
# Change port in docker-compose.yml
# Or kill existing process
```

### Frontend API Connection Error
```bash
# Check NEXT_PUBLIC_API_URL in .env.local
# Ensure backend is running on port 8000
```

---

## 📞 Support

For issues and questions:
1. Check DEVELOPMENT.md
2. Review API documentation at `/docs`
3. Check GitHub Issues

---

## 🎉 Ready for Production!

All MVP features are complete and tested. The application is ready for:
- ✅ Testing in staging environment
- ✅ User acceptance testing
- ✅ Production deployment

**Next Steps:**
1. Configure environment variables (.env)
2. Run database migrations
3. Start services with Docker Compose
4. Run smoke tests
5. Deploy to production

---

**Happy coding! 🚀**
