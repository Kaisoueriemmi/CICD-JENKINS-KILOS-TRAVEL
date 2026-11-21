# AirWeight API Documentation

## Base URL

```
Development: http://localhost:8000/api/v1
Production: https://api.airweight.io/api/v1
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Get Access Token

**POST** `/auth/login`

Request:

```json
{
  "username": "user@example.com",
  "password": "password123"
}
```

Response:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

---

## Endpoints

### Authentication

#### Register User

**POST** `/auth/register`

Request:

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "full_name": "John Doe",
  "phone_number": "+33612345678"
}
```

Response: `201 Created`

```json
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "John Doe",
  "role": "user",
  "is_active": true,
  "is_verified": false,
  "created_at": "2026-01-26T17:00:00Z"
}
```

#### Get Current User

**GET** `/auth/me`

Response:

```json
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "John Doe",
  "role": "user",
  "is_active": true,
  "is_verified": true,
  "created_at": "2026-01-26T17:00:00Z"
}
```

---

### Wallet

#### Get Wallet

**GET** `/wallet`

Response:

```json
{
  "id": 1,
  "user_id": 1,
  "balance_kg": 15.5,
  "total_earned_kg": 25.0,
  "total_used_kg": 9.5,
  "created_at": "2026-01-26T17:00:00Z",
  "updated_at": "2026-01-26T18:30:00Z"
}
```

#### Get Wallet Statistics

**GET** `/wallet/stats`

Response:

```json
{
  "total_kg_saved": 25.0,
  "total_kg_used": 9.5,
  "current_balance": 15.5,
  "total_flights": 5,
  "money_saved": 380.0,
  "carbon_footprint_reduced": 12.5
}
```

---

### Flights

#### Create Flight

**POST** `/flights`

Request:

```json
{
  "flight_number": "AF1234",
  "airline": "Air France",
  "departure_airport": "TUN",
  "arrival_airport": "CDG",
  "flight_date": "2026-02-15T10:30:00Z",
  "flight_type": "international",
  "allowed_weight_kg": 23.0,
  "actual_weight_kg": 18.0,
  "ticket_image_url": "https://..."
}
```

Response: `201 Created`

```json
{
  "id": 1,
  "user_id": 1,
  "flight_number": "AF1234",
  "airline": "Air France",
  "departure_airport": "TUN",
  "arrival_airport": "CDG",
  "flight_date": "2026-02-15T10:30:00Z",
  "flight_type": "international",
  "allowed_weight_kg": 23.0,
  "actual_weight_kg": 18.0,
  "difference_kg": 5.0,
  "credit_value_kg": 7.5,
  "is_credited": false,
  "scan_verified": false,
  "created_at": "2026-01-26T17:00:00Z"
}
```

#### Credit Flight to Wallet

**POST** `/flights/{flight_id}/credit`

Response:

```json
{
  "id": 1,
  "is_credited": true,
  "credit_value_kg": 7.5,
  ...
}
```

#### Get All Flights

**GET** `/flights?skip=0&limit=100`

Response:

```json
[
  {
    "id": 1,
    "flight_number": "AF1234",
    ...
  }
]
```

---

### Transactions

#### Get Transactions

**GET** `/transactions?skip=0&limit=100`

Response:

```json
[
  {
    "id": 1,
    "user_id": 1,
    "transaction_type": "credit",
    "amount_kg": 7.5,
    "balance_after": 15.5,
    "service_fee": 0.0,
    "description": "Credit from flight AF1234",
    "created_at": "2026-01-26T17:00:00Z"
  }
]
```

#### Debit from Wallet

**POST** `/transactions/debit?amount_kg=2.0&description=Excess baggage`

Response:

```json
{
  "id": 2,
  "user_id": 1,
  "transaction_type": "debit",
  "amount_kg": 2.0,
  "balance_after": 13.5,
  "service_fee": 2.0,
  "description": "Excess baggage",
  "created_at": "2026-01-26T18:00:00Z"
}
```

#### Transfer to User

**POST** `/transactions/transfer?recipient_email=friend@example.com&amount_kg=5.0`

Response:

```json
{
  "id": 3,
  "user_id": 1,
  "transaction_type": "transfer",
  "amount_kg": -5.0,
  "balance_after": 8.5,
  "recipient_user_id": 2,
  "description": "Transfer to friend@example.com",
  "created_at": "2026-01-26T19:00:00Z"
}
```

---

### Subscriptions

#### Create Subscription

**POST** `/subscriptions`

Request:

```json
{
  "plan_type": "premium"
}
```

Response: `201 Created`

```json
{
  "id": 1,
  "user_id": 1,
  "plan_type": "premium",
  "status": "active",
  "start_date": "2026-01-26T17:00:00Z",
  "end_date": "2026-02-26T17:00:00Z",
  "amount": 4.99,
  "currency": "EUR",
  "auto_renew": true
}
```

#### Get Active Subscription

**GET** `/subscriptions/active`

Response:

```json
{
  "id": 1,
  "plan_type": "premium",
  "status": "active",
  ...
}
```

#### Cancel Subscription

**POST** `/subscriptions/{subscription_id}/cancel`

Response:

```json
{
  "id": 1,
  "status": "cancelled",
  "auto_renew": false,
  ...
}
```

---

## Error Responses

### 400 Bad Request

```json
{
  "detail": "Insufficient balance. Available: 5.0 kg"
}
```

### 401 Unauthorized

```json
{
  "detail": "Could not validate credentials"
}
```

### 403 Forbidden

```json
{
  "detail": "Not authorized to access this resource"
}
```

### 404 Not Found

```json
{
  "detail": "User not found"
}
```

### 422 Validation Error

```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}
```

---

## Rate Limiting

- **Default**: 60 requests per minute per user
- **Premium**: 120 requests per minute
- **Admin**: Unlimited

---

## Pagination

All list endpoints support pagination:

```
GET /flights?skip=0&limit=20
```

- `skip`: Number of records to skip (default: 0)
- `limit`: Maximum number of records to return (default: 100, max: 1000)

---

## Interactive Documentation

Visit the interactive API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

**Last Updated**: January 26, 2026
