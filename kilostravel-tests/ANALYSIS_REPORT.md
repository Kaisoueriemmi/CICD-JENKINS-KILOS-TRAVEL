# KilosTravel — Codebase Analysis Report

_Prepared by the QA automation team. Generated from static analysis of all source files._

---

## ✅ Fully Implemented

| Area | Details |
|------|---------|
| Backend Auth | Register, login (OAuth2 form), JWT tokens, refresh, email verification skeleton |
| Flight CRUD | `POST /flights`, `GET /flights`, `GET /flights/{id}`, credit endpoint |
| Wallet | `GET /wallet`, `GET /wallet/stats` — balance_kg, totals |
| Transactions | `GET /transactions`, `POST /transfer`, `POST /debit` |
| Notifications | Full CRUD: list, get, patch (mark-read), delete, mark-all-read, unread count |
| OCR Scanning | Google Cloud Vision API + Tesseract fallback in `scan_ticket` route |
| Flight credit multipliers | Domestic 1×, International 1.5×, Transatlantic 2× — calculated at flight creation |
| Flight list page | Filter by airline / status / type, pagination, stats grid |
| Wallet page UI | Balance display, stats cards, activity breakdown, transfer modal |

---

## ⚠️ Partially Implemented

| Area | Gap |
|------|-----|
| Stripe integration | Backend `StripeService` exists with all methods. Frontend `/checkout` page is a **simulated** UI — no real Stripe.js loaded, no actual payment processed. |
| Password reset | Backend routes exist (`/forgot-password`, `/reset-password`). Frontend pages are **placeholder stubs** with no form. |
| Profile save | `handleSave()` in `profile/page.tsx` uses `setTimeout(1000ms)` — **does not call any API**. Success toast fires unconditionally. Backend endpoint `PUT /api/users/me` is referenced in a comment but not called. |
| Navbar auth state | Uses **hardcoded mock user** (`user@airweight.io`) instead of reading from the auth store. Logout button calls `console.log('Logout')` only. |
| OCR frontend | Backend scan-ticket endpoint is functional. **No UI button** exposes it to users. |
| Token refresh | `POST /auth/refresh` endpoint exists on backend. **No automatic refresh flow** in the frontend. |

---

## ❌ Not Implemented / Broken (Critical Blockers)

| File | Issue |
|------|-------|
| `frontend/src/lib/api.ts` | **Did not exist.** All pages import `authAPI`, `walletAPI`, `flightAPI`, `transactionAPI`, `notificationsAPI` from this path. App would fail to compile. **Created by this test suite as part of deliverable.** |
| `frontend/src/lib/store.ts` | **Did not exist.** Login page, dashboard, and profile page import `useAuthStore` / `useWalletStore`. **Created by this test suite.** |
| `frontend/src/lib/airports.ts` | **Did not exist.** Add Flight page imports `searchAirports` from this path. **Created by this test suite.** |
| Social login (Google / Facebook) | Buttons render but have no `onClick` handlers and no OAuth integration. |
| Email change | Input is permanently `disabled={true}`. No backend flow wired. |

---

## 🔍 Issues Found

### Bug #1 — API Login Contract Mismatch
- **Where**: `frontend/src/lib/api.ts` (line created by this suite)
- **Issue**: FastAPI's `OAuth2PasswordRequestForm` expects `application/x-www-form-urlencoded` with field name `username` (NOT `email` and NOT `application/json`).
- **Fix applied**: `lib/api.ts` sends `URLSearchParams` with `username` key and correct Content-Type header.

### Bug #2 — Profile Save is Mocked
- **Where**: `frontend/src/app/profile/page.tsx` → `handleSave()`
- **Issue**: Uses `await new Promise(resolve => setTimeout(resolve, 1000))`. The commented-out line `// await axios.put('/api/users/me', formData)` is never called. Any name change is lost on page reload.
- **Test tag**: `@KnownBug` added to `@Profile_UpdateName_Valid` scenario.

### Bug #3 — Navbar Shows Mock User
- **Where**: `frontend/src/components/Navbar.tsx` line 27
- **Issue**: `const user = { email: 'user@airweight.io', name: 'User' }` — hardcoded, does not reflect actual logged-in user.

### Bug #4 — Notification Bell Actions Missing
- **Where**: `frontend/src/components/NotificationBell.tsx`
- **Issue**: The bell dropdown shows notifications but has no "Mark as read" button per item. Only the full page `/notifications` allows marking individual items as read (and only on hover). The dropdown is read-only.

### Bug #5 — Missing Frontend Validations
- **Where**: `frontend/src/app/flights/add/page.tsx` — Step 2
- **Issue**: No validation that `actual_weight_kg > allowed_weight_kg`. Users can submit a flight where they used more than their allowance, which earns 0 credits (correct), but no error feedback is shown. The warning box appears but does not prevent submission.

### Bug #6 — Airport Search Not Connected to IATA API
- **Where**: `frontend/src/lib/airports.ts` (created by this suite)
- **Issue**: The IATA Open API endpoint at `GET /api/v1/iata/airports` exists in the backend but is not called. Airport search uses a static local list. Missing airports will not appear in autocomplete.

---

## 🎯 Test Strategy Decision

The 4 main scenarios were selected based on:

1. **Flight Management** (`@FlightTests`)  
   - Core user journey — adding a flight is the entry point to earning credits.  
   - The 3-step form has real JS validation that can be tested.
   - Covers both successful submission and two validation failure cases.

2. **Wallet Management** (`@WalletTests`)  
   - Primary value proposition — seeing and transferring credits.  
   - Balance display is always accessible (no pre-condition required).  
   - HTML5 form validation on the transfer modal provides reliable invalid cases.

3. **User Profile Management** (`@ProfileTests`)  
   - Edit/view mode toggle is a well-defined UI state machine (testable regardless of backend).  
   - Documents the mock-save bug via `@KnownBug` tag.  
   - Email read-only enforcement is a clear security requirement.

4. **Notification System** (`@NotificationTests`)  
   - Bell dropdown is visible on every authenticated page — no navigation needed.  
   - Covers the full page, empty state, and "mark all read" action.  
   - Tests are resilient to data-dependent state (graceful skip on empty account).

---

## 📋 Selector Strategy

Since the KilosTravel frontend had no `data-testid` attributes, the following were added as part of this deliverable:

| Component | Attributes Added |
|-----------|-----------------|
| `login/page.tsx` | `login-tab`, `register-tab`, `email-input`, `password-input`, `login-btn` |
| `flights/add/page.tsx` | `flight-number-input`, `airline-select`, `departure-input`, `arrival-input`, `flight-date-input`, `flight-type-select`, `suivant-btn`, `suivant-btn-step2`, `precedent-btn`, `allowed-weight-input`, `actual-weight-input`, `confirm-btn` |
| `wallet/page.tsx` | `wallet-balance`, `transfer-btn`, `transfer-modal`, `recipient-email-input`, `transfer-amount-input`, `transfer-cancel-btn`, `transfer-submit-btn` |
| `profile/page.tsx` | `edit-btn`, `cancel-btn`, `save-btn`, `full-name-input`, `email-input-profile` |
| `notifications/page.tsx` | `mark-all-read-btn`, `empty-state`, `notification-item`, `mark-read-btn`, `delete-notification-btn` |
| `components/NotificationBell.tsx` | `notification-bell`, `notification-dropdown` |

Toast notifications use Sonner's internal attributes (`[data-sonner-toast][data-type='error']`) since they cannot receive custom `data-testid` attributes.
