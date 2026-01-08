# Certificate Generation System

## Overview
A comprehensive system for generating, managing, and distributing digital certificates with QR code verification.

## Features
- ✅ Event Management
- ✅ Bulk Certificate Generation
- ✅ QR Code Verification
- ✅ Email Distribution
- ✅ Real-time Status Tracking
- ✅ OAuth Authentication

## Technology Stack
- **Backend**: Node/Express, PostgreSQL
- **Frontend**: React + Vite
- **Email**: JavaMail with Gmail SMTP
- **Authentication**: JWT + OAuth2

## Quick Start

### Local Development

1. **Prerequisites**:
   - Java 17+
   - PostgreSQL
   - Node.js 16+

2. **Database Setup**:
   ```sql
   CREATE DATABASE certificate_system;
   ```

3. **Backend**:
   ```bash
   cd backend
npm run dev
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

Visit: `http://localhost:5173`

## Run in background (recommended)

Use Docker Compose to run both backend and frontend as background services.

- Start: `./scripts/start-services.sh` (runs `docker compose up -d --build`)
- Stop: `./scripts/stop-services.sh` (runs `docker compose down`)

Backend: http://localhost:8080 — Frontend: http://localhost:3000

## Deployment

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for complete deployment instructions.

## Environment Variables

See `.env.example` files in backend and frontend directories.

## License

MIT
