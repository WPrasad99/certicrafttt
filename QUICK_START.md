# ⚡ QUICK START GUIDE

## Prerequisites Checklist
- [ ] PostgreSQL installed and running
- [ ] Node.js 18+ installed
- [ ] npm (included with Node.js) installed

## 🚀 5-Minute Setup

### 1. Database Setup (2 minutes)
```powershell
# Open pgAdmin or psql
# Run these commands:
CREATE DATABASE certificate_system;

# Then run database-setup.sql in Query Tool
```

### 2. Start Application (3 minutes)
```powershell
# Run this command in PowerShell:
cd certificate-system
.\START.ps1
```

OR manually:

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```

### 3. Access Application
Open browser: **http://localhost:5173**

---

## 🎯 Demo Flow (5 minutes)

1. **Register** (30 sec)
   - Full Name: Your Name
   - Email: demo@example.com
   - Password: demo123
   - Institute: Demo University

2. **Create Event** (1 min)
   - Event Name: Tech Summit 2024
   - Date: Select today
   - Organizer: Your Name
   - Institute: Demo University

3. **Upload Participants** (1 min)
   - Click  "Manage" on your event
   - Upload `sample_participants.csv`
   - Verify 15 participants loaded

4. **Generate Certificates** (2 min)
   - Click "Generate Certificates"
   - Wait for processing
   - Switch to "Certificates" tab
   - See all statuses as "GENERATED"

5. **Download** (30 sec)
   - Download individual certificate (PDF)
   - Download all as ZIP

---

## 📁 File Locations

```
certificate-system/
├── backend/                 ← Node/Express API
├── frontend/               ← React UI
├── database-setup.sql      ← Database schema
├── sample_participants.csv ← Test data
├── START.ps1              ← Auto-start script
└── README.md              ← Full documentation
```

---

## ⚙️ Configuration

### Backend Database Password
Edit: `backend/.env` (or set environment variables)
```env
DB_PASSWORD=YOUR_PASSWORD
```

### Email (Optional)
Set in `backend/.env`:
```env
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

---

## 🐛 Common Issues

| Problem | Solution |
|---------|----------|
| Port 8080 in use | Stop other Node apps |
| Port 5173 in use | Stop other Vite/React apps |
| Database connection failed | Check PostgreSQL is running or set `DATABASE_URL` |
| Build failed | Run `npm install` |
| npm install failed | Delete `node_modules`, retry |

---

## 📞 Need Help?

1. Check `README.md` for detailed docs
2. See `DATABASE_SETUP.md` for DB help
3. Review `installation_guide.md` for prerequisites

---

**🎉 Ready to go! This is a production-ready, fully working system.**
