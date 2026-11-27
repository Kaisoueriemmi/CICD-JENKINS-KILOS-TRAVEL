# CI/CD project: app scope, tests and pipeline

## Features in scope

The pipeline builds, tests and ships the **backend API** (FastAPI). Four features are in scope:

| Feature | Addresses | Logic that is tested |
|---|---|---|
| Auth | `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `GET /api/v1/auth/me` | password rules, hashing, JWT tokens |
| Baggage credit | `POST /api/v1/flights/`, `POST /api/v1/flights/{id}/credit`, `GET /api/v1/baggage/credit` | unused kg x flight-type multiplier (`app/services/baggage_credit.py`) |
| Wallet | `GET /api/v1/wallet/`, `GET /api/v1/wallet/stats`, `POST /api/v1/transactions/debit` | balance check, service fee, dashboard estimates |
| IATA lookup | `GET /api/v1/iata/airports`, `POST /api/v1/flights/lookup-allowance` | airport search, fallback flight-type rule |

Out of scope (they need paid API keys or system tools): Stripe payments and subscriptions, OCR ticket scanning, Amadeus, SMTP e-mails, push notifications, the Next.js frontend. They stay in the repo but are left out of the coverage measure (`backend/.coveragerc`).

## Health and smoke test

| Check | Request | Exact expected answer |
|---|---|---|
| Health | `GET /health` | `200`, `"status": "healthy"` |
| Smoke test | `GET /api/v1/baggage/credit?flight_type=international&allowed_kg=23&actual_kg=18` | `200`, `{"flight_type":"international","unused_kg":5.0,"credit_kg":7.5}` |

The smoke-test address is public (no login, no database), so it works right after a deployment.

## Tests

```
backend/tests/unit/   -> marker "unit": pure logic, no server, no database (25 tests)
backend/tests/http/   -> marker "http": calls the API over HTTP (17 tests)
```

The HTTP tests use a `client` fixture:
- `BASE_URL` not set: in-process app with an in-memory SQLite database (quick local run);
- `BASE_URL` set: a real running server (pipeline: local uvicorn, or the app container wired to PostgreSQL).

Run them from `backend/`:

```bash
pip install -r requirements.txt
pytest -m unit --junitxml=../build/test-results/unit.xml
pytest -m http --junitxml=../build/test-results/http.xml
# against a running server
BASE_URL=http://localhost:8000 pytest -m http
```

`RATE_LIMIT_ENABLED=false` turns the rate limiter off for automated tests (the register address allows 3 calls per minute).

## Pipeline (Jenkinsfile)

| Stage | Feature | What it does |
|---|---|---|
| Checkout | F1 | Jenkins reads the Jenkinsfile from Git ("Pipeline script from SCM") |
| Build | F2 | venv + `pip install -r backend/requirements.txt`, build archive in `build/dist/` |
| Code quality | bonus | `flake8` on the backend with the rules in `backend/.flake8` (line length 120); any finding makes the build yellow (so no image), report archived as `build/flake8.log` |
| Tests: Unit tests // HTTP tests | F3 | two parallel stages; the HTTP stage starts uvicorn and calls it (`ci/run_http_tests.sh`) |
| HTTP tests vs PostgreSQL | bonus | `ci/docker-compose.ci.yml`: app container + PostgreSQL container + a tests container |
| Coverage | bonus | unit tests + server-side coverage of the HTTP run, combined; yellow under 70 % |
| Docker image / Push | F7 / F8 | only when everything above is green; push wrapped in `timeout` + `retry(3)` |
| post always | F4, F6, F12 | `junit` reports, `archiveArtifacts ... fingerprint: true`, `cleanWs()` |

Failed tests make the build **yellow** (UNSTABLE) and the Docker stages are skipped. Tests that cannot run at all (import error, server not starting) make it **red**.

Automatic triggers: `pollSCM('H/5 * * * *')` (about every 5 minutes) and `cron('H 2 * * *')` (nightly). The whole pipeline stops after 30 minutes.

Coverage measured locally: **77 %** (threshold 70 %).

## Bugs fixed while writing the tests

- `register` crashed: `settings.FRONTEND_URL` did not exist.
- `transactions/debit` and `transfer` crashed: `Wallet.total_used_kg` does not exist (the column is `total_spent_kg`; transfers now count in `total_transferred_kg`).
- Old tests used passwords the app refuses, the wrong status code (200 instead of 201) and an address that does not exist (`/users/me` instead of `/auth/me`).
