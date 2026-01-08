# Backend (Node/Express)

This backend replaces the previous Spring Boot implementation and provides:
- PostgreSQL with Sequelize
- Google OAuth (Passport)
- Local auth (register/login)
- Endpoints for Events, Participants, Certificates (basic stubs)

Run locally:
1. Copy `.env.example` to `.env` and set DB credentials
2. Start DB (docker compose includes postgres)
3. From `backend/` run `npm install` then `npm run dev` (uses nodemon)
