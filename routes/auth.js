const express = require('express');
const passport = require('passport');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');

// Login for Google
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

// Login for Twitter
//router.get('/auth/twitter',
//  passport.authenticate('twitter')
//);

// Callback (what happens when Twitter is done processing)
//router.get('/auth/twitter/callback', 
  //passport.authenticate('twitter', { 
    failureRedirect: '/', 
  //  successRedirect: '/dashboard'
  //})
//);

// Login for Facebook
router.get('/auth/facebook',
  passport.authenticate('facebook')
);

// Callback (what happens when Facebook is done processing)
router.get('/auth/facebook/callback',
  passport.authenticate('facebook', {
    failureRedirect: '/',
    successRedirect: '/dashboard'
  })
);

// Login for Local Strategy
router.get('/signup', (req, res) => {
  res.render('signup');
});

// Signup route for email/password
router.post('/signup', async (req, res) => {
  const { displayName, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (!existingUser.password) {
        return res.send('This email is already linked to a Google or Facebook login. Please use that method to sign in.');
      } else {
      return res.send('An account with this email already exists. Please log in.');
     }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      displayName,
      email,
      password: hashedPassword
    });

    await newUser.save();
    res.redirect('/');
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).send('Something went wrong. Please try again.');
  }
});

router.get('/login', (req, res) => {
  res.render('login-email');
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.send('No account found with that email. Please sign up.');
    }

    if (!user.password) {
      return res.send('This account was created with Google or Facebook. Please use that login method.');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.send('Incorrect password. Please try again.');
    }

    // Log the user in manually
    req.login(user, (err) => {
      if (err) {
        console.error('Login error:', err);
        return res.status(500).send('Login failed.');
      }
      return res.redirect('/dashboard');
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send('Something went wrong. Please try again.');
  }
});

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