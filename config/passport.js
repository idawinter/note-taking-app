const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User'); // ✅ make sure this path is correct
const UserProfile = require('../models/userProfile');

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
      // Find or create the UserProfile
    let userProfile = await UserProfile.findOne({ userId: profile.id });

    if (!userProfile) {
    // If no profile exists, create it with default preferences
      userProfile = await UserProfile.create({
        userId: profile.id,
        email: profile.emails[0].value,
        displayName: profile.displayName,
        avatar: profile.photos[0].value
      });
    } else {
        // Update lastLogin if profile exists
        userProfile.lastLogin = Date.now();
        await userProfile.save();
      }

    // Log the user and profile information
    console.log("User logged in:", user);
    console.log("UserProfile:", userProfile);


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