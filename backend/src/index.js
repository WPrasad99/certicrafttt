require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

const app = express();
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// initialize auth (Google OAuth)
require('./auth/passport')(app);
app.use('/auth', require('./routes/auth'));

// user auth routes
app.use('/api/auth', require('./routes/users'));

// basic route placeholders
app.get('/api', (req, res) => res.json({ message: 'CertiCraft API (Node/Express)' }));

// Register routes
app.use('/api/events', require('./routes/events'));
app.use('/api/events/:eventId/participants', require('./routes/participants'));
app.use('/api/events/:eventId/template', require('./routes/templates'));
app.use('/api/certificates', require('./routes/certificates'));
app.use('/api/collaboration', require('./routes/collaboration'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/users', require('./routes/users'));

const PORT = process.env.PORT || 8080;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connected');
    await sequelize.sync();
    app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
  } catch (err) {
    console.error('Database connection/sync failed:', err.message);
    // process.exit(1); // Allow server to start even if sync fails (e.g. existing data conflicts)
  }
}

start();
