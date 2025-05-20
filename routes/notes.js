const express = require('express');
const router = express.Router();
const Note = require('../models/note');
//commented out line 5 because files doesn't need to import isLoggedIn anymore
//const { isLoggedIn } = require('./auth-middleware'); // We’ll create this or use what’s already in app.js

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

// Show form to create a new note
router.get('/notes/new', isLoggedIn, (req, res) => {
  res.render('new-note'); // You'll create new-note.ejs later
});

// Handle form submission to create a new note
router.post('/notes', isLoggedIn, async (req, res) => {
  try {
    console.log("Logged-in user:", req.user);

    const { title, content, category } = req.body;
    const note = new Note({
      title,
      content,
      category,
      owner: req.user._id
    });
    await note.save();
    res.redirect('/notes');
  } catch (err) {
    console.error(err);
    res.send('Error creating note');
  }
});

// Show all notes that belong to the logged-in user
router.get('/notes', isLoggedIn, async (req, res) => {
  try {
    const notes = await Note.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.render('notes', { notes });
  } catch (err) {
    console.error(err);
    res.send('Error fetching notes');
  }
});

// Show a specific note by ID
router.get('/notes/:id', isLoggedIn, async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!note) {
      return res.status(404).send('Note not found');
    }

    res.render('note', { note }); // You'll create note.ejs
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading note');
  }
});

router.get('/notes/:id/edit', isLoggedIn, async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, owner: req.user._id });
    if (!note) return res.status(404).send('Note not found');
    res.render('edit-note', { note });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading note for editing');
  }
});

router.put('/notes/:id', isLoggedIn, async (req, res) => {
  try {
    await Note.updateOne(
      { _id: req.params.id, owner: req.user._id },
      {
        title: req.body.title,
        content: req.body.content,
        category: req.body.category // if you're using categories
      }
    );
    res.redirect('/notes');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating note');
  }
});

router.delete('/notes/:id', isLoggedIn, async (req, res) => {
  try {
    await Note.deleteOne({ _id: req.params.id, owner: req.user._id });
    res.redirect('/notes');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting note');
  }
});

// Filter notes by category
router.get('/notes/category/:category', isLoggedIn, async (req, res) => {
  try {
    const notes = await Note.find({
      owner: req.user._id,
      category: req.params.category
    }).sort({ createdAt: -1 });

    res.render('notes', { notes });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error filtering notes by category');
  }
});


module.exports = router;
