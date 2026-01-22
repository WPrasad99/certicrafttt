const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const fs = require('fs');
const path = require('path');

const auth = require('../middleware/auth');

const logError = (err) => {
  const logPath = path.join(__dirname, '../../error.log');
  const msg = `${new Date().toISOString()} - ${err.message}\n${err.stack}\n\n`;
  fs.appendFileSync(logPath, msg);
};

router.post('/register', async (req, res) => {
  const { email, fullName, password, instituteName } = req.body;
  const exists = await User.findOne({ where: { email } });
  if (exists) return res.status(400).json({ message: 'Email already in use' });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, fullName, passwordHash, instituteName });
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'dev-secret');
  res.json({ token, id: user.id, email: user.email, fullName: user.fullName, instituteName: user.instituteName });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash || '');
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'dev-secret');
  res.json({ token, id: user.id, email: user.email, fullName: user.fullName, instituteName: user.instituteName });
});

router.put('/settings', auth, async (req, res) => {
  try {
    const { fullName, instituteName } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.fullName = fullName;
    user.instituteName = instituteName;
    await user.save();

    res.json({ id: user.id, email: user.email, fullName: user.fullName, instituteName: user.instituteName });
  } catch (error) {
    logError(error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.passwordHash) {
      const ok = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!ok) return res.status(401).json({ error: 'Current password incorrect' });
    } else if (user.provider !== 'local') {
      return res.status(400).json({ error: 'Cannot change password for social login accounts' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    logError(error);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

router.get('/search', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.json([]);
  const users = await User.findAll({
    where: {
      email: { [require('sequelize').Op.like]: `%${email}%` }
    },
    limit: 10
  });
  res.json(users.map(u => ({ id: u.id, name: u.fullName, email: u.email })));
});

module.exports = router;