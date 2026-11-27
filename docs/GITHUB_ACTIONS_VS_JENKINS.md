# GitHub Actions vs Jenkins (bonus)

`.github/workflows/ci.yml` runs the same CI as the first stages of the `Jenkinsfile`
on every push and pull request: **Build**, then **Unit tests** and **HTTP tests** in
parallel. Jenkins keeps everything that comes after the tests: Docker image, push to
Docker Hub, staging, production with approval, e-mail.

## Same pipeline, two tools

| Jenkinsfile | GitHub Actions (`ci.yml`) |
|---|---|
| `stage('Build')` | job `build` |
| `parallel { stage('Unit tests') ... stage('HTTP tests') }` | jobs `unit-tests` and `http-tests`, both `needs: build`, so they run at the same time |
| `ci/run_http_tests.sh` | the same script, unchanged |
| `junit` step: results in the "Test Result" page | JUnit XML kept as downloadable artifacts |
| `pollSCM` every 5 min + nightly `cron` | `on: push` and `pull_request`: starts at once, no polling |
| `options { timeout(30 min) }` | `timeout-minutes: 15` on each job |
| `disableConcurrentBuilds()` | `concurrency` with `cancel-in-progress` |
| `cleanWs()` | nothing to clean: each job gets a fresh virtual machine |

## Differences

| | Jenkins | GitHub Actions |
|---|---|---|
| Where it runs | Our own server (Kais's PC through Tailscale), our agents | GitHub's machines (`ubuntu-latest`), nothing to install |
| Setup and upkeep | We install, configure (casc.yaml), update plugins, back up | None: one YAML file in the repo |
| Availability | Only when the host PC is on | Always on |
| Sharing files between steps | One workspace per agent; `stash` / `unstash` between agents | Every job starts empty: dependencies installed again (pip cache), files passed as artifacts |
| Visible in GitHub | No check on the commit or the pull request | A green or red check on each commit and pull request |
| Manual approval | `input` step (production) | Needs "environments" with required reviewers |
| Access to our Docker host and Mailpit | Yes (staging 8081, production 8082, Mailpit) | No: GitHub's machines cannot reach our private network |
| Cost | Free, but our machine | Free for public repositories |

## Why we keep both

- **GitHub Actions** gives fast feedback on every branch and pull request, before
  review, without depending on the Jenkins host being on.
- **Jenkins** stays the delivery pipeline: it is the only one that can reach our
  Docker host, deploy to staging and production, wait for the approval and send
  the Mailpit e-mail.
