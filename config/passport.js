const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User'); // ✅ make sure this path is correct

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback",
  scope: ['profile', 'email'],
}, 

async (accessToken, refreshToken, profile, done) => {
  try {
    // Look for an existing user with this Google ID
    let user = await User.findOne({ googleId: profile.id });

    if (!user) {
      // If not found, create a new user
      user = await User.create({
        googleId: profile.id,
        displayName: profile.displayName,
        email: profile.emails[0].value
      });
    }

    return done(null, user); // ✅ This is now a MongoDB user, not just the Google profile
  } catch (err) {
    return done(err, null);
  }
}));

// Serialize the MongoDB user ID into the session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize the user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});