const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { User } = require('../models');
const auth = require('../middleware/auth');
const { encrypt } = require('../utils/encryption');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES = '7d';

// Helper: strip sensitive fields before sending user data
const safeUser = (user) => ({
  id: user.id,
  email: user.email,
  fullName: user.fullName,
  instituteName: user.instituteName,
  smtpUser: user.smtpUser,
  fromEmail: user.fromEmail,
  hasSmtpKey: !!user.smtpPassword
});

// ══════════════════════════════════════════════════════════════
//  REGISTER
// ══════════════════════════════════════════════════════════════
router.post('/register', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  try {
    const { email, fullName, password, instituteName } = req.body;

    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(400).json({ message: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password, 12); // 12 rounds for stronger hashing
    const user = await User.create({ email, fullName, passwordHash, instituteName });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    return res.status(201).json({ token, ...safeUser(user) });
  } catch (err) {
    console.error('[Register]', err.message);
    return res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
});

// ══════════════════════════════════════════════════════════════
//  LOGIN
// ══════════════════════════════════════════════════════════════
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    // Always run bcrypt even on missing user to prevent timing attacks
    const dummyHash = '$2a$12$invalidhashfortimingprotection000000000000000000000000';
    const ok = user
      ? await bcrypt.compare(password, user.passwordHash || '')
      : await bcrypt.compare(password, dummyHash);

    if (!user || !ok) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    return res.json({ token, ...safeUser(user) });
  } catch (err) {
    console.error('[Login]', err.message);
    return res.status(500).json({ message: 'Login failed. Please try again.' });
  }
});

// ══════════════════════════════════════════════════════════════
//  UPDATE SETTINGS
// ══════════════════════════════════════════════════════════════
router.put('/settings', auth, async (req, res) => {
  try {
    // Whitelist allowed fields — prevent mass assignment
    const { fullName, instituteName, smtpHost, smtpPort, smtpUser, smtpPassword, fromEmail } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (fullName !== undefined) user.fullName = String(fullName).trim().slice(0, 255);
    if (instituteName !== undefined) user.instituteName = String(instituteName).trim().slice(0, 255);
    if (smtpHost !== undefined) user.smtpHost = smtpHost || null;
    if (smtpPort !== undefined) user.smtpPort = smtpPort ? parseInt(smtpPort, 10) : null;
    if (smtpUser !== undefined) user.smtpUser = smtpUser || null;
    if (fromEmail !== undefined) user.fromEmail = fromEmail || null;

    if (smtpPassword !== undefined) {
      if (smtpPassword === '') {
        user.smtpPassword = null;
      } else if (smtpPassword !== '********') {
        user.smtpPassword = encrypt(smtpPassword);
      }
    }

    await user.save();
    return res.json(safeUser(user));
  } catch (err) {
    console.error('[Settings]', err.message);
    return res.status(500).json({ error: 'Failed to update settings' });
  }
});

// ══════════════════════════════════════════════════════════════
//  CHANGE PASSWORD — requires current password verification
// ══════════════════════════════════════════════════════════════
router.put('/change-password', auth, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Verify current password before allowing change
    const ok = await bcrypt.compare(currentPassword, user.passwordHash || '');
    if (!ok) return res.status(401).json({ error: 'Current password is incorrect' });

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await user.save();

    return res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('[ChangePassword]', err.message);
    return res.status(500).json({ error: 'Failed to update password' });
  }
});

// ══════════════════════════════════════════════════════════════
//  USER SEARCH — authenticated, returns minimal safe data only
// ══════════════════════════════════════════════════════════════
router.get('/search', auth, async (req, res) => {
  try {
    const { email } = req.query;
    if (!email || String(email).length < 3) return res.json([]);

    const { Op } = require('sequelize');
    const users = await User.findAll({
      where: { email: { [Op.like]: `%${email.slice(0, 100)}%` } },
      attributes: ['id', 'fullName', 'email'], // only return safe fields
      limit: 10
    });

    return res.json(users.map(u => ({ id: u.id, name: u.fullName, email: u.email })));
  } catch (err) {
    console.error('[UserSearch]', err.message);
    return res.status(500).json({ error: 'Search failed' });
  }
});

module.exports = router;