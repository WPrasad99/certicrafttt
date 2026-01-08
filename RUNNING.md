# Running the project in background (Docker Compose)

Prereqs:
- Docker Desktop installed and running
- (Optional) Docker Compose v2 (bundled with Docker Desktop)

Quick start:

- Start services (builds images if needed):

  ./scripts/start-services.sh

- Stop services:

  ./scripts/stop-services.sh

Notes:
- Backend is available at http://localhost:8080
- Frontend (static) is available at http://localhost:3000
- Use `docker compose logs -f <service>` to follow logs
- `docker compose up -d --build` runs services in background
