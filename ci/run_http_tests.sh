#!/bin/sh
# F3 - HTTP (integration) tests: start the real app, call it over HTTP, stop it.
# The server runs under coverage.py so the code it executes counts in the
# coverage report (bonus: build turns yellow under 70 %).
# Usage (from the repo root): ci/run_http_tests.sh
# Exit code: the pytest exit code (1 = some tests failed).
set -u

ROOT=$(pwd)
VENV="$ROOT/.venv"
PORT="${HTTP_TEST_PORT:-8000}"
mkdir -p build/test-results build/coverage

cd backend
export RATE_LIMIT_ENABLED=false
export DATABASE_URL="sqlite:///$ROOT/build/http-tests.db"
rm -f "$ROOT/build/http-tests.db"

COVERAGE_FILE="$ROOT/build/coverage/.coverage.http" \
  "$VENV/bin/coverage" run -m uvicorn app.main:app --host 127.0.0.1 --port "$PORT" \
  > "$ROOT/build/http-server.log" 2>&1 &
SERVER_PID=$!

# Wait for /health (python image has no curl)
"$VENV/bin/python" - "$PORT" <<'PY'
import sys, time, urllib.request
url = f"http://127.0.0.1:{sys.argv[1]}/health"
for _ in range(60):
    try:
        urllib.request.urlopen(url, timeout=2)
        sys.exit(0)
    except Exception:
        time.sleep(1)
sys.exit("server did not answer on /health")
PY
if [ $? -ne 0 ]; then
  kill "$SERVER_PID" 2>/dev/null
  cat "$ROOT/build/http-server.log"
  exit 2
fi

BASE_URL="http://127.0.0.1:$PORT" "$VENV/bin/pytest" -m http \
  --junitxml="$ROOT/build/test-results/http.xml"
STATUS=$?

# SIGINT = clean uvicorn shutdown, so coverage.py writes its data file
kill -INT "$SERVER_PID" 2>/dev/null
wait "$SERVER_PID" 2>/dev/null
exit $STATUS
