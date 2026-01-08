const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const fs = require('fs');
const path = require('path');

const logError = (err) => {
  const logPath = path.join(__dirname, '../../error.log');
  const msg = `${new Date().toISOString()} - ${err.message}\n${err.stack}\n\n`;
  fs.appendFileSync(logPath, msg);
};

router.post('/register', async (req, res) => {
  const { email, fullName, password } = req.body;
  const exists = await User.findOne({ where: { email } });
  if (exists) return res.status(400).json({ message: 'Email already in use' });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, fullName, passwordHash });
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'dev-secret');
  res.json({ token, id: user.id, email: user.email, fullName: user.fullName });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(401).json({ message: 'Invalid' });
  const ok = await bcrypt.compare(password, user.passwordHash || '');
  if (!ok) return res.status(401).json({ message: 'Invalid' });
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'dev-secret');
  res.json({ token, id: user.id, email: user.email, fullName: user.fullName });
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