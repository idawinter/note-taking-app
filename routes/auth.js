const express = require('express');
const passport = require('passport');
const router = express.Router();

// Login
router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Callback (what happens when Google is done processing)
router.get('/auth/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: '/', 
    successRedirect: '/dashboard'
  })
);

// Logging out
router.get('/logout', (req, res) => {
  req.logout(function(err) {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).send('Logout failed');
    }
    req.session.destroy(() => {
      res.clearCookie('connect.sid'); // Optional: clear the session cookie manually
      res.redirect('/');
    });
  });
});


module.exports = router;