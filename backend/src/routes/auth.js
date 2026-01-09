const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Kick off Google OAuth
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  prompt: 'select_account'
}));

// Callback
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/' }), (req, res) => {
  // Issue JWT and redirect to frontend with token
  const token = jwt.sign({ id: req.user.id, name: req.user.displayName }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });

  // Create query params
  const q = new URLSearchParams({ token, fullName: req.user.displayName || '', email: req.user.email || '', id: req.user.id ? String(req.user.id) : '' });

  // Construct redirect URL
  const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
  const redirectUrl = `${frontendUrl}/oauth/callback?${q.toString()}`;

  console.log('Google Auth Success! Redirecting to:', redirectUrl);
  res.redirect(redirectUrl);
});

module.exports = router;