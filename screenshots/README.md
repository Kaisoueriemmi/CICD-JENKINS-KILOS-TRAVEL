# Screenshots - proof of each result

The graders can check the pipeline here without running it again.
One PNG per line, with the exact file name below. Take them on the shared Jenkins
(http://HOST:8080), on Docker Hub and in Mailpit (http://HOST:8025).

| # | File | What it shows | Feature | Status |
|---|---|---|---|---|
| 1 | `01-blueocean-green-parallel.png` | Blue Ocean: a green run, "Unit tests" and "HTTP tests" side by side | F3 | ✅ |
| 2 | `02-test-result-page.png` | "Test Result" page of a run (59 tests: 25 unit + 17 HTTP + 17 HTTP vs PostgreSQL) | F4 | ✅ |
| 3 | `03-yellow-run-docker-skipped.png` + `03b-yellow-run-failed-test.png` | Run #9, yellow: one test broken on purpose, "Docker image" and "Push to Docker Hub" skipped; its Test Result page (1 failed, 59 passed) | F4 | ✅ |
| 4 | `04-artifacts-fingerprint.png` | Recorded fingerprints of the archived artifacts (`.tar.gz`, test XML, coverage) | F6 | ✅ |
| 5 | `05-coverage-report.png` | Coverage report (77 %, threshold 70 %) | bonus | ✅ |
| 6 | `06-dockerhub-tags.png` | Docker Hub: "Tags" tab of `nesrinebousrih/kilostravel-backend`, tag `1.0.10` pushed by run #10 | F7, F8 | ✅ |
| 7 | `07-docker-ps-staging-prod.png` | `docker ps` with staging (8081) and production (8082) | F9, F10 | ⬜ |
| 8 | `08-app-staging.png` | The app in the browser on staging: `http://HOST:8081/health` | F9 | ⬜ |
| 9 | `09-app-production.png` | The app in the browser on production: `http://HOST:8082/health` | F10 | ⬜ |
| 10 | `10-approval-input.png` | The "Deploy to production?" approval step | F10 | ⬜ |
| 11 | `11-mailpit-email.png` | Mailpit: "[KilosTravel] SUCCESS - version 1.0.10 (build #10)" sent to the team | F11 | ✅ |
| 12 | `12-github-contributors.png` | GitHub Insights > Contributors: all three members | history | ⬜ |
| 13 | `13-github-merged-prs.png` | GitHub pull requests: every change merged through a reviewed PR | history | ⬜ |

Tick a line (⬜ -> ✅) in the same pull request that adds its PNG.

## How to get each one

- **1** Blue Ocean > `kilostravel-pipeline` > last green run.
- **2** Classic UI > run > "Test Result".
- **3** Run #9 is a Jenkins **Replay** of run #8: the replayed Jenkinsfile writes one failing
  test after the checkout, so nothing broken ever goes to Git. To do it again by hand,
  add a failing test, for example in `backend/tests/unit/`:
  ```python
  import pytest

  @pytest.mark.unit
  def test_broken_on_purpose():
      assert 1 == 2
  ```
  Push, wait for the yellow run, take the stage view, then delete the test.
  Checked locally: pytest then exits with code 1, so `markTestResult` marks the
  build UNSTABLE and the `when { currentBuild.currentResult == 'SUCCESS' }`
  stages are skipped.
- **4, 5** Run page > "Build Artifacts", then `build/coverage/html/index.html` in the artifacts.
- **7** On the Jenkins host: `docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Ports}}"`.
- **8, 9** Smoke-test address, expected answer
  `{"flight_type":"international","unused_kg":5.0,"credit_kg":7.5}`:
  `/api/v1/baggage/credit?flight_type=international&allowed_kg=23&actual_kg=18`.
- **12, 13** GitHub repository > Insights > Contributors, and Pull requests > Closed.

Lines 6 to 11 need the stages of Nesrine (F7, F8, F11) and Amine (F9, F10) first.
