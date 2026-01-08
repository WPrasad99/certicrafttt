const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');

module.exports = function (app) {
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:8080/auth/google/callback'
    }, async (accessToken, refreshToken, profile, done) => {
      // Minimal: lookup or create a User record
      const { User } = require('../models');
      const email = (profile.emails && profile.emails[0] && profile.emails[0].value) || null;
      let user = null;
      if (email) user = await User.findOne({ where: { email } });
      if (!user) {
        user = await User.create({ email, fullName: profile.displayName, provider: 'google' });
      }
      const out = { id: user.id, displayName: user.fullName, email: user.email };
      return done(null, out);
    }));

    app.use(passport.initialize());

    // Serialize/deserialize are not required for JWT flows, but left as placeholders
    passport.serializeUser((user, cb) => cb(null, user));
    passport.deserializeUser((obj, cb) => cb(null, obj));

    // Expose a helper to issue a JWT
    app.post('/auth/issue-token', (req, res) => {
      const user = req.body.user;
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
      res.json({ token });
    });
  } else {
    console.warn('Google OAuth not configured: GOOGLE_CLIENT_ID/SECRET missing. /auth/google will return 501.');
    app.get('/auth/google', (req, res) => res.status(501).json({ message: 'Google OAuth not configured on server' }));
    app.get('/auth/google/callback', (req, res) => res.status(501).json({ message: 'Google OAuth not configured on server' }));
  }
};