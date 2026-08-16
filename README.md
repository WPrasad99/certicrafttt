# CertiCraft

[![Status: Production Ready](https://img.shields.io/badge/Status-Production--Ready-brightgreen)](https://github.com/WPrasad99/certicrafttt)
[![Tech: Node/React](https://img.shields.io/badge/Tech-Node%20%2F%20React-blue)](https://github.com/WPrasad99/certicrafttt)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)
[![Live Demo](https://img.shields.io/badge/Live-Demo-ff69b4)](https://certicraft-frontend.onrender.com)

CertiCraft is an enterprise-grade platform designed to automate the creation, distribution, and cryptographic verification of digital certificates. Built for organizers, institutions, and businesses that demand speed, high-fidelity design, and robust security.

**[Live Demo](https://certicraft-frontend.onrender.com)**

---

## Architecture Overview

CertiCraft is built on a modern, decoupled architecture designed for scale and security.

```mermaid
graph TD
    Client[Web Client - React/Vite]
    LB[Load Balancer / Ingress - Render]
    API[Node.js / Express API]
    DB[(PostgreSQL - Supabase)]
    Storage[(Object Storage - Supabase)]
    SMTP[Email Gateway - Brevo/Resend]

    Client <--> |HTTPS / REST| LB
    LB <--> API
    API <--> |Sequelize ORM / Connection Pool| DB
    API <--> |File I/O| Storage
    API --> |SMTP Batch Delivery| SMTP
```

## Core Workflows

The platform simplifies complex operational pipelines into a seamless, few-click experience.

```mermaid
sequenceDiagram
    participant O as Organizer
    participant S as CertiCraft API
    participant D as Database
    participant M as SMTP Gateway
    participant P as Participant

    O->>S: 1. Upload Base Template (PNG)
    S->>D: Store Template Metadata
    O->>S: 2. Upload Participant Roster (CSV)
    S->>D: Bulk Insert Participants
    O->>S: 3. Configure Placement & Trigger Generation
    S->>S: Generate PDFs & Verification IDs
    S->>D: Save Certificate Records
    O->>S: 4. Trigger Email Dispatch
    S->>M: Non-blocking Batch Send
    M->>P: Deliver Cryptographically Signed Certificates
    P->>S: 5. Scan QR / Verify Authenticity
    S-->>P: Return Verification Payload
```

---

## Platform Features

### 1. High-Fidelity Generation Engine
- **Visual Template Designer**: Interactive web canvas to position dynamic text (names, dates) exactly where you need them on uploaded templates.
- **Bulk Processing Pipeline**: Capable of processing large participant CSVs efficiently.
- **Pixel-Perfect Output**: Server-side PDF compilation ensures consistent formatting across all issued documents.

### 2. Cryptographic Verification System
- **Immutable Verification IDs**: Each certificate is stamped with a unique UUID.
- **Integrated QR Codes**: Industry-standard QR codes embedded natively into generated PDFs.
- **Public Verification Portal**: Instant, fraud-proof authenticity checks accessible via mobile or desktop.

### 3. Enterprise Security & Hardening
- **Strict Authentication**: JWT-based session management coupled with Google OAuth2.
- **Defense in Depth**: Integrated `helmet` security headers, strict CORS policies, and rate-limiting across authentication and public endpoints.
- **Data Integrity**: Cryptographically secured database configurations, comprehensive parameterized queries, and strict input validation layers protecting against XSS, mass-assignment, and injection.

### 4. Collaboration & Multi-Tenancy
- **Event Workspaces**: Invite collaborators to assist with participant management and certificate generation.
- **Strict Data Isolation**: Advanced Row-Level Security logic implemented in the application layer ensures users only access resources they own or have been explicitly granted access to.

---

## Deployment Configuration

CertiCraft is container-ready and configured for PaaS deployments such as Render and Supabase.

### System Requirements
- Node.js >= 18.x
- PostgreSQL >= 14.x
- Valid SMTP Configuration (Brevo, Resend, or Google Workspace)

### 1. Environment Variables

Create a `.env` file in the `backend/` directory. Strict validation ensures the server will halt if critical cryptographic keys are missing.

```env
# Server & Database
PORT=8080
FRONTEND_URL=https://your-frontend.com
DATABASE_URL=postgresql://user:pass@host:port/dbname?sslmode=require

# Cryptography (CRITICAL)
# Must be a 64-character hex string (32 bytes)
ENCRYPTION_KEY=your_secure_encryption_key_here
# Strong random string for JWT signing
JWT_SECRET=your_secure_jwt_secret_here

# Email Delivery
MAIL_HOST=smtp-relay.brevo.com
MAIL_PORT=2525
MAIL_USERNAME=your_smtp_username
MAIL_PASSWORD=your_smtp_password
FROM_EMAIL="Organization Name <noreply@domain.com>"

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=https://your-backend.com/auth/google/callback
```

### 2. Initialization

```bash
# Clone repository
git clone https://github.com/WPrasad99/certicrafttt.git
cd certicrafttt

# Initialize Backend
cd backend
npm ci
npm start

# Initialize Frontend
cd ../frontend
npm ci
npm run build
npm start
```

---

## API Structure

The platform exposes a standard RESTful API protected by bearer tokens. 

- `/api/auth` - Authentication, OAuth, Password Reset
- `/api/events` - Event CRUD, Template Management
- `/api/participants` - Roster Management, CSV Uploads
- `/api/certificates` - PDF Generation, Status Polling, Verification
- `/api/collaboration` - Access Control, Messaging, Invitations

---

## Automated Security Audits

The platform includes GitHub Actions workflows that automatically run `npm audit` on both the frontend and backend on every push to `main` and on a weekly schedule. The application is maintained against strict vulnerability standards.

## License

Distributed under the MIT License. See `LICENSE` for more information.
