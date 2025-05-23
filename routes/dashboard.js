const express = require('express');
const router = express.Router();
const UserProfile = require('../models/userProfile');

// Middleware to check if the user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

// GET /dashboard
router.get('/', isLoggedIn, async (req, res) => {
  try {
    const userProfile = await UserProfile.findOne({ userId: req.user.googleId });

    res.render('dashboard', {
      user: req.user,
      profile: userProfile
    });
  } catch (err) {
    console.error('Error loading dashboard:', err);
    res.status(500).send('Server error');
  }
});

module.exports = router;

// GET /dashboard/preferences – show preference form
router.get('/preferences', isLoggedIn, async (req, res) => {
  try {
    const userProfile = await UserProfile.findOne({ userId: req.user.googleId });

    res.render('preferences', {
      profile: userProfile
    });
  } catch (err) {
    console.error('Error loading preferences page:', err);
    res.status(500).send('Server error');
  }
});

// POST /dashboard/preferences – update preferences
router.post('/preferences', isLoggedIn, async (req, res) => {
  try {
    await UserProfile.findOneAndUpdate(
      { userId: req.user.googleId },
      {
        preferences: {
          fontSize: req.body.fontSize,
          fontColor: req.body.fontColor,
          fontFamily: req.body.fontFamily,
          noteBackground: req.body.noteBackground
        }
      }
    );

    res.redirect('/dashboard');
  } catch (err) {
    console.error('Error updating preferences:', err);
    res.status(500).send('Server error');
  }
});
