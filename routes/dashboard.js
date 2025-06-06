const express = require('express');
const router = express.Router();
const UserProfile = require('../models/userProfile');
const Note = require('../models/note');

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
    const userId = req.user._id;

    const userProfile = await UserProfile.findOne({ userId: req.user._id });

    const recentNotes = await Note.find({ owner: userId })
      .sort({ createdAt: -1 })
      .limit(3);

    const categories = await Note.distinct('category', { owner: userId });

    // Clone req.user and add avatar if it exists in profile

    console.log('REQ.USER:', req.user);

    const user = {
      ...req.user,
      displayName: userProfile?.displayName || req.user.displayName || req.user.email || 'User',
      avatar: userProfile?.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userProfile?.displayName || req.user.displayName || req.user.email || 'User')
    };

    res.render('dashboard', {
      user,
      profile: userProfile,
      recentNotes,
      categories
    });
  } catch (err) {
    console.error('Error loading dashboard:', err);
    res.status(500).send('Server error');
  }
});

// GET /dashboard/preferences – show preference form
router.get('/preferences', isLoggedIn, async (req, res) => {
  try {
    const userProfile = await UserProfile.findOne({ userId: req.user._id });

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
      { userId: req.user._id },
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

// GET /dashboard/stats – show user activity summary
router.get('/stats', isLoggedIn, async (req, res) => {
  try {
    const totalNotes = await Note.countDocuments({ owner: req.user._id });

    const categoryCounts = await Note.aggregate([
      { $match: { owner: req.user._id } },
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    const recentNotes = await Note.find({ owner: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5);

    res.render('stats', {
      totalNotes,
      categoryCounts,
      recentNotes
    });
  } catch (err) {
    console.error("Error loading stats:", err);
    res.status(500).send('Server error');
  }
});


module.exports = router;