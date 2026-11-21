# KilosTravel Test Suite

Selenium 4 + Cucumber 7 + Extent Reports automated test suite for the **KilosTravel / AirWeight** application.

---

## Prerequisites

| Requirement | Minimum version |
|-------------|----------------|
| Java JDK | 11 |
| Maven | 3.8 |
| Google Chrome | latest stable |
| Docker & Docker Compose | any recent version |

> WebDriverManager downloads the correct ChromeDriver automatically — no manual driver installation needed.

---

## Application Setup

### 1. Start the backend and frontend with Docker Compose

```bash
# From the KilosTravel project root
docker-compose up -d
```

Verify the services are running:
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:8000](http://localhost:8000)
- API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### 2. Create the test user account

The test suite authenticates as a dedicated user. Create it via the API:

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@airweight.io",
    "full_name": "Test User QA",
    "password": "Test123!"
  }'
```

Or register through the UI at [http://localhost:3000/login](http://localhost:3000/login) (click "Inscription").

**Test credentials (also visible on the login page):**
| Field | Value |
|-------|-------|
| Email | `test@airweight.io` |
| Password | `Test123!` |

### 3. Verify credentials in `config.properties`

```
kilostravel-tests/src/test/resources/config.properties
```

Update `base.url`, `api.url`, or credentials if your environment differs from the defaults.

---

## Frontend Modifications

The following `data-testid` attributes were added to the KilosTravel frontend source files to enable reliable element selection. **These changes are required for the tests to find elements.**

| File | Attributes Added |
|------|-----------------|
| `frontend/src/app/login/page.tsx` | `login-tab`, `register-tab`, `email-input`, `password-input`, `login-btn` |
| `frontend/src/app/flights/add/page.tsx` | `flight-number-input`, `airline-select`, `departure-input`, `arrival-input`, `flight-date-input`, `flight-type-select`, `suivant-btn`, `suivant-btn-step2`, `precedent-btn`, `allowed-weight-input`, `actual-weight-input`, `confirm-btn` |
| `frontend/src/app/wallet/page.tsx` | `wallet-balance`, `transfer-btn`, `transfer-modal`, `recipient-email-input`, `transfer-amount-input`, `transfer-cancel-btn`, `transfer-submit-btn` |
| `frontend/src/app/profile/page.tsx` | `edit-btn`, `cancel-btn`, `save-btn`, `full-name-input`, `email-input-profile` |
| `frontend/src/app/notifications/page.tsx` | `mark-all-read-btn`, `empty-state`, `notification-item`, `mark-read-btn`, `delete-notification-btn` |
| `frontend/src/components/NotificationBell.tsx` | `notification-bell`, `notification-dropdown` |

Additionally, the following missing library files were created as part of the deliverable (the app could not compile without them):

| File Created | Purpose |
|-------------|---------|
| `frontend/src/lib/api.ts` | Axios API client for all backend endpoints |
| `frontend/src/lib/store.ts` | Zustand stores for auth and wallet state |
| `frontend/src/lib/airports.ts` | Airport search function (static dataset) |

---

## Running Tests

From the `kilostravel-tests/` directory:

```bash
# Run the complete suite
mvn test

# Run a specific feature by tag
mvn test -Dcucumber.filter.tags="@FlightTests"
mvn test -Dcucumber.filter.tags="@WalletTests"
mvn test -Dcucumber.filter.tags="@ProfileTests"
mvn test -Dcucumber.filter.tags="@NotificationTests"
mvn test -Dcucumber.filter.tags="@LoginTests"

# Run a single scenario by tag
mvn test -Dcucumber.filter.tags="@AddFlight_Valid"
mvn test -Dcucumber.filter.tags="@WalletBalance_Valid"

# Exclude known-bug scenarios
mvn test -Dcucumber.filter.tags="not @KnownBug"
```

---

## Reports

After `mvn test` completes:

| Report | Location |
|--------|----------|
| **Extent HTML Report** (primary) | `target/ExtentReport.html` |
| Cucumber HTML Report | `target/cucumber-reports/index.html` |
| Cucumber JSON (for CI parsing) | `target/cucumber-reports/cucumber.json` |
| Screenshots (failed scenarios) | `target/screenshots/` |

Open `target/ExtentReport.html` in any browser. Failed scenarios will have embedded screenshots.

---

## Project Structure

```
kilostravel-tests/
├── pom.xml                            Maven dependencies and surefire config
├── README.md                          This file
├── ANALYSIS_REPORT.md                 Codebase analysis findings
└── src/
    ├── main/
    │   └── java/
    │       └── pages/                 Page Object Model (POM) classes
    │           ├── LoginPage.java
    │           ├── FlightPage.java
    │           ├── WalletPage.java
    │           ├── ProfilePage.java
    │           └── NotificationPage.java
    └── test/
        ├── java/
        │   ├── base/
        │   │   └── TestBase.java      WebDriver setup/teardown + config loader
        │   ├── reports/
        │   │   └── ExtentManager.java Singleton Extent Reports factory
        │   ├── hooks/
        │   │   └── Hooks.java         @Before / @After — screenshot on failure
        │   ├── runner/
        │   │   └── CucumberRunner.java JUnit entry point for `mvn test`
        │   └── stepdefinitions/
        │       ├── LoginStep.java
        │       ├── FlightStep.java
        │       ├── WalletStep.java
        │       ├── ProfileStep.java
        │       └── NotificationStep.java
        └── resources/
            ├── features/
            │   ├── login.feature
            │   ├── flight.feature
            │   ├── wallet.feature
            │   ├── profile.feature
            │   └── notifications.feature
            ├── config.properties      Test credentials and URLs
            └── cucumber.properties    Disables Cucumber cloud publish
```

---

## Test Scenarios Summary

### Scenario 1 — Flight Management (`flight.feature`)

| Tag | Type | Description |
|-----|------|-------------|
| `@AddFlight_Valid` | ✅ Valid | Complete 3-step form → flight appears in list |
| `@AddFlight_MissingFlightNumber` | ❌ Invalid | Empty flight number → JS toast error |
| `@AddFlight_MissingAirline` | ❌ Invalid | No airline selected → JS toast error |

### Scenario 2 — Wallet Management (`wallet.feature`)

| Tag | Type | Description |
|-----|------|-------------|
| `@WalletBalance_Valid` | ✅ Valid | Balance is displayed and ≥ 0 |
| `@TransferModal_OpenClose` | ✅ Valid | Modal opens and closes with Cancel |
| `@Transfer_InvalidEmail` | ❌ Invalid | Non-email string → HTML5 validation blocks |
| `@Transfer_ZeroAmount` | ❌ Invalid | Amount = 0 → HTML5 min validation blocks |

### Scenario 3 — Profile Management (`profile.feature`)

| Tag | Type | Description |
|-----|------|-------------|
| `@Profile_EditModeEnabled` | ✅ Valid | Modifier button enables form fields |
| `@Profile_UpdateName_Valid` `@KnownBug` | ✅ Valid (mock) | Name update shows success toast (mocked save) |
| `@Profile_Cancel_Discards` | ❌ Invalid | Annuler discards changes, returns view mode |
| `@Profile_EmailReadOnly` | ❌ Invalid | Email input is permanently disabled |

### Scenario 4 — Notification System (`notifications.feature`)

| Tag | Type | Description |
|-----|------|-------------|
| `@Notification_BellToggle` | ✅ Valid | Bell opens dropdown |
| `@Notification_BellCloses` | ✅ Valid | Second bell click closes dropdown |
| `@Notification_PageLoads` | ✅ Valid | Full page shows list or empty state |
| `@Notification_MarkAllRead` | ✅ Valid | Mark-all-read succeeds without error |
| `@Notification_EmptyState` | ❌ Invalid (edge) | Empty-state message (graceful skip if account has items) |
| `@Notification_DropdownClosedByDefault` | ❌ Invalid (negative state) | Dropdown must NOT be visible before clicking the bell |
| `@Notification_RequiresAuth` | ❌ Invalid (unauthorised) | Direct access to `/notifications` without a session redirects to `/login` |

---

## Codebase Analysis

See [ANALYSIS_REPORT.md](ANALYSIS_REPORT.md) for the full findings including:
- Features fully implemented vs. partially vs. broken
- All bugs found and their locations
- Selector strategy rationale

### Critical findings summary

| Severity | Issue |
|----------|-------|
| 🔴 Critical | `@/lib/api`, `@/lib/store`, `@/lib/airports` did not exist — app could not compile |
| 🔴 Critical | Login API uses JSON body; FastAPI requires `application/x-www-form-urlencoded` with `username` field |
| 🟡 Medium | Profile save is mocked — no real API call is made |
| 🟡 Medium | Navbar shows hardcoded user, not authenticated user |
| 🟢 Minor | No frontend validation for actual weight > allowed weight |
| 🟢 Minor | Airport search not connected to backend IATA API |

---

## Technical Notes

### No `Thread.sleep()` Policy
All timing is handled exclusively through `WebDriverWait` with `ExpectedConditions`. Every Page Object method that interacts with an element begins with an explicit wait. Search for `// EXPLICIT WAIT` comments throughout the Page Object files.

### Screenshot on Failure
`Hooks.java` `@After` captures a timestamped PNG to `target/screenshots/` on any scenario failure and embeds it in the Extent Report via `MediaEntityBuilder.createScreenCaptureFromPath()`.

### Test Isolation
Each scenario gets a fresh Chrome browser (Hooks `@After` calls `TestBase.tearDown()` which quits the driver; `@Before` calls `TestBase.setUp()` to launch a new one).

### Known Bug Tag
Scenarios tagged `@KnownBug` are expected to pass (they test real behaviour), but their test name documents that the underlying feature has a known implementation gap. Use `not @KnownBug` to exclude them from a "clean" run.
