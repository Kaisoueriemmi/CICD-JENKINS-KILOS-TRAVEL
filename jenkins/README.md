# Shared Jenkins (Docker)

One Jenkins for the whole team, in a Docker container, configured as code.

| File | Role |
|---|---|
| `Dockerfile` | Jenkins LTS + Docker client + Compose plugin + plugins |
| `plugins.txt` | Plugins (Pipeline, Blue Ocean, Docker Pipeline, JUnit, Workspace Cleanup, Email Extension...) |
| `casc.yaml` | Users (kais, nesrine, amine), credentials `github-creds` and `dockerhub-creds`, Mailpit, job `kilostravel-pipeline` |
| `docker-compose.jenkins.yml` | Jenkins (8080) + Mailpit (8025 web, 1025 SMTP) |
| `.env.example` | Secrets to fill in `.env` (never committed) |

## Start

```bash
cd jenkins
cp .env.example .env      # fill in passwords and tokens
docker compose -f docker-compose.jenkins.yml up -d --build
```

- Jenkins: http://HOST:8080 (one login per member)
- Mailpit: http://HOST:8025
- Team access: Tailscale to the host PC, or a small VPS

Check that Jenkins can use Docker:

```bash
docker exec kilostravel-jenkins docker ps
```

## Backup

```bash
docker run --rm -v jenkins_jenkins_home:/data -v "$PWD":/backup alpine \
  tar czf /backup/jenkins_home-$(date +%F).tgz -C /data .
```

(The volume name is `<folder>_jenkins_home`: check it with `docker volume ls`.)

## Changing the config

`casc.yaml` is re-applied at each start. Edit it, then `up -d --build`.
Every change goes through a pull request, like the rest of the code.
