# 🎓 CertiCraft: The Ultimate Certificate Ecosystem

[![Status: Production Ready](https://img.shields.io/badge/Status-Production--Ready-brightgreen)](https://github.com/WPrasad99/certicrafttt)
[![Tech: Node/React](https://img.shields.io/badge/Tech-Node%20%2F%20React-blue)](https://github.com/WPrasad99/certicrafttt)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

CertiCraft is a high-performance, professional-grade platform designed to automate the creation, distribution, and verification of digital certificates. Built for organizers who demand speed, reliability, and security.

---

## 📑 Table of Contents
1. [Project Overview](#-project-overview)
2. [Key Features](#-key-features)
3. [Quick Start (5 Mins)](#-quick-start-5-mins)
4. [System Architecture](#-system-architecture)
5. [Configuration & Setup](#-configuration--setup)
6. [QR Verification System](#-qr-verification-system)
7. [Deployment Guide](#-deployment-guide)
8. [Troubleshooting](#-troubleshooting)

---

## 🌟 Project Overview
CertiCraft solves the bottleneck of regional and global event management by providing a seamless interface to generate hundreds of certificates in seconds. Every certificate is uniquely identifiable and instantly verifiable via QR code, ensuring zero fraud and maximum trust.

### Why CertiCraft?
- **Bulk Processing**: Upload CSV/Excel and generate hundreds of certificates instantly.
- **High Fidelity**: Pixel-perfect PNG templates with elegant typography.
- **Mobile First**: Fully responsive dashboard and verification portal.
- **Smart Verification**: Industry-standard QR codes for instant authenticity checks.

---

## ✨ Key Features
- **Event Dashboard**: Manage multiple events, participants, and templates in one place.
- **Interactive Template Designer**: Click-to-place name positioning on any image.
- **Automated Emailing**: SMTP integration for direct certificate delivery.
- **Secure Authentication**: Traditional JWT-based login + Google OAuth2.
- **Real-time Status**: Track generation and email status for every participant.

---

## 🚀 Quick Start (5 Mins)

### 1. Database Setup
```sql
-- Open pgAdmin/psql
CREATE DATABASE certificate_system;
-- Execute 'database-setup.sql' in this database
```

### 2. Launch Application
```powershell
# PowerShell (Root Directory)
.\START.ps1
```
*Alternatively:*
- **Backend:** `cd backend && npm run dev`
- **Frontend:** `cd frontend && npm run dev`

### 3. Access
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🏗️ System Architecture

### Tech Stack
- **Frontend**: React.js, Vite, Vanilla CSS (Modern UI)
- **Backend**: Node.js, Express, Sequelize ORM
- **Database**: PostgreSQL
- **Security**: JWT, Passport.js (Google OAuth2)
- **Email**: Nodemailer (SMTP/Gmail)

---

## ⚙️ Configuration & Setup

### Database
Update `backend/.env` with your PostgreSQL credentials:
```env
DB_NAME=certificate_system
DB_USER=postgres
DB_PASSWORD=YOUR_PASSWORD
DB_HOST=localhost
DB_PORT=5432
```

### Email (Nodemailer)
Generate a **Google App Password** for automated mailing:
```env
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=abcd efgh ijkl mnop
```

### Google OAuth2
Setup credentials in Google Cloud Console:
- **Redirect URI**: `http://localhost:8080/api/login/oauth2/code/google`
- **Keys**: `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

---

## 🔍 QR Verification System
Every certificate generates a unique UUID stored in the database.
- **URL Pattern**: `http://<your-ip>:5173/verify/<uuid>`
- **Workflow**: 
  1. Scan QR on certificate.
  2. Redirects to public verification portal.
  3. Displays authenticity confirmation and participant data.

---

## 🌐 Firewall Config (For Mobile Demo)
To scan QR codes from your phone while running locally, ensure ports **5173** and **8080** are open:
```powershell
New-NetFirewallRule -DisplayName "React Frontend" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Node Backend" -Direction Inbound -LocalPort 8080 -Protocol TCP -Action Allow
```

---

## ☁️ Deployment Guide
The project is configured for **Render** (Frontend/Backend) and **Supabase** (Database/Storage).
1. **GitHub**: Push code to your repo.
2. **Backend (Web Service)**: Root `backend`, Build `npm install`, Start `npm start`.
3. **Frontend (Static Site)**: Root `frontend`, Build `npm run build`, Publish `dist`.
4. **Environment Variables**: Update `VITE_API_BASE_URL` and `DATABASE_URL`.

---

## 🛠️ Troubleshooting

| Issue | Solution |
| :--- | :--- |
| **Login Fails** | Ensure backend is running and DB is connected. |
| **Email Fails** | Check App Password and restart backend. |
| **QR Scan Timeout** | Verify Firewall settings and Wi-Fi network. |
| **No Templates** | Upload a PNG in the event dashboard first! |

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

*Crafted with ❤️ for the Global Developer Community.*
