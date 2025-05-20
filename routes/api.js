const express = require('express');
const router = express.Router();
const Note = require('../models/note');

// Middleware to protect the route
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: 'Unauthorized' });
}

// GET /api/notes — return user's notes as JSON
router.get('/api/notes', isLoggedIn, async (req, res) => {
  try {
    const notes = await Note.find({ owner: req.user._id });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// POST /api/notes — create a note from JSON
router.post('/api/notes', isLoggedIn, async (req, res) => {
  try {
    const { title, content, category } = req.body;
    const note = new Note({
      title,
      content,
      category,
      owner: req.user._id
    });
    await note.save();
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create note' });
  }
});

module.exports = router;
