const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Kick off Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Callback
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/' }), (req, res) => {
  // Issue JWT and redirect to frontend with token
  const token = jwt.sign({ id: req.user.id, name: req.user.displayName }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
  // include some user info in query params for the frontend callback
  const q = new URLSearchParams({ token, fullName: req.user.displayName || '', email: req.user.email || '', id: req.user.id ? String(req.user.id) : '' });
  const redirectUrl = (process.env.FRONTEND_URL || 'http://localhost:5173') + `/?${q.toString()}`;
  res.redirect(redirectUrl);
});

module.exports = router;