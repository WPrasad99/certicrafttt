require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { sequelize } = require('./models');

const app = express();

// ══════════════════════════════════════════════════════════════
//  SECURITY HEADERS (helmet)
// ══════════════════════════════════════════════════════════════
app.use(helmet());

// ══════════════════════════════════════════════════════════════
//  CORS — strict origin whitelist
// ══════════════════════════════════════════════════════════════
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];
if (process.env.FRONTEND_URL) {
  const base = process.env.FRONTEND_URL.replace(/\/$/, '');
  allowedOrigins.push(base, base + '/');
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Render health checks)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    console.warn('[CORS] Blocked origin:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Pre-flight OPTIONS for all routes
app.options('*', cors());

// ══════════════════════════════════════════════════════════════
//  BODY PARSING — size limit raised to support large participant uploads
// ══════════════════════════════════════════════════════════════
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ══════════════════════════════════════════════════════════════
//  GLOBAL RATE LIMITER — broad DoS / bot protection
//  500 requests per 15 minutes per IP
//  (Dashboard fires ~4 concurrent calls on load + polls every 30s)
// ══════════════════════════════════════════════════════════════
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api', globalLimiter);

// ══════════════════════════════════════════════════════════════
//  AUTH-SPECIFIC RATE LIMITERS — brute-force & credential stuffing protection
// ══════════════════════════════════════════════════════════════
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 10,                     // max 10 login attempts per window per IP
  skipSuccessfulRequests: true, // don't count successful logins against the limit
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please wait 15 minutes before trying again.' }
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 5,                     // max 5 registrations per hour per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many accounts created from this IP, please try again after an hour.' }
});

// ══════════════════════════════════════════════════════════════
//  HEALTH CHECK — public, unauthenticated
// ══════════════════════════════════════════════════════════════
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// ══════════════════════════════════════════════════════════════
//  AUTH ROUTES
// ══════════════════════════════════════════════════════════════
require('./auth/passport')(app);
app.use('/auth', require('./routes/auth'));

// Apply auth-specific rate limiters
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth/register', registerLimiter);
app.use('/api/auth', require('./routes/users'));

// ══════════════════════════════════════════════════════════════
//  API ROUTES
// ══════════════════════════════════════════════════════════════
app.get('/api', (req, res) => res.json({ message: 'CertiCraft API' }));
app.use('/api/events', require('./routes/events'));
app.use('/api/events/:eventId/participants', require('./routes/participants'));
app.use('/api/events/:eventId/template', require('./routes/templates'));
app.use('/api/certificates', require('./routes/certificates'));
app.use('/api/collaboration', require('./routes/collaboration'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/users', require('./routes/users'));

// ══════════════════════════════════════════════════════════════
//  GLOBAL ERROR HANDLER — never leak internal details
// ══════════════════════════════════════════════════════════════
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  // Specific known errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ══════════════════════════════════════════════════════════════
//  SERVER START
// ══════════════════════════════════════════════════════════════
const PORT = process.env.PORT || 8080;

async function start() {
  try {
    await sequelize.authenticate();
    // SECURITY/STABILITY: Do NOT use sync({ alter: true }) in production — it runs ALTER TABLE
    // on every startup and can cause lock contention and schema corruption during concurrent restarts.
    // Use sequelize-cli migrations for schema changes in production.
    // sync({ force: false }) only creates missing tables, never alters existing ones.
    await sequelize.sync({ force: false });
  } catch (err) {
    console.error('[DB] Connection failed:', err.message);
  }
  app.listen(PORT, () => console.log(`[Server] Listening on port ${PORT}`));
}

start();
