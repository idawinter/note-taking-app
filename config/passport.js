const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User'); // ✅ make sure this path is correct
const UserProfile = require('../models/userProfile');
const TwitterStrategy = require('passport-twitter').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

//passport.use(new TwitterStrategy({
  //TWITTER_CONSUMER_KEY,
  //consumerSecret: process.env.//TWITTER_CONSUMER_SECRET,
  //callbackURL: "/auth/twitter///callback",
  //includeEmail: true
//},
  //function(token, tokenSecret, //profile, done) { 
  //  if (profile.emails[0]) {
  //    profile.email = profile.emails[0].value // Extract email from profile
  //  }
    // Mongo stuff
  //  return done(null,profile); // ✅ This is the Twitter profile, not a MongoDB user
  //}
//))

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

passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: "/auth/facebook/callback",
  profileFields: ['id', 'displayName', 'emails'] // Request user's email and name
},
async function(accessToken, refreshToken, profile, done) {
  try {
    let user = await User.findOne({ facebookId: profile.id });

    if (!user) {
      user = await User.create({
        facebookId: profile.id,
        displayName: profile.displayName,
        email: profile.emails?.[0]?.value || ''
      });
    }

    return done(null, user);
  } catch (err) {
    return done(err);
  }
}
));

passport.use(new LocalStrategy({
  usernameField: 'email', // We're using email instead of username
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return done(null, false, { message: 'No user found with that email.' });
    }

    if (!user.password) {
      return done(null, false, { message: 'Looks like you signed up using Google or Facebook. Try logging in with one of those instead.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return done(null, false, { message: 'Incorrect password.' });
    }

    return done(null, user);
  } catch (err) {
    return done(err);
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