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

//Google OAuth Strategy

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
      user = await User.create({
        googleId: profile.id,
        displayName: profile.displayName,
        email: profile.emails[0].value
      });
    }

    // Use user's MongoDB _id now for linking profile
    let userProfile = await UserProfile.findOne({ userId: user._id });

    if (!userProfile) {
      userProfile = await UserProfile.create({
        userId: user._id,
        email: profile.emails[0].value,
        displayName: profile.displayName,
        avatar: profile.photos[0].value
      });
    } else {
      userProfile.lastLogin = Date.now();
      await userProfile.save();
    }

    console.log("User logged in:", user);
    console.log("UserProfile:", userProfile);

    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

// Facebook OAuth Strategy

passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: "/auth/facebook/callback",
  profileFields: ['id', 'displayName', 'emails', 'photos'] // get email + photo
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

    // 🔧 Look for existing UserProfile by MongoDB _id
    let userProfile = await UserProfile.findOne({ userId: user._id });

    if (!userProfile) {
      userProfile = await UserProfile.create({
        userId: user._id,
        email: profile.emails?.[0]?.value || '',
        displayName: profile.displayName,
        avatar: profile.photos?.[0]?.value || ''
      });
    } else {
      userProfile.lastLogin = Date.now();
      await userProfile.save();
    }

    console.log("Facebook user logged in:", user);
    console.log("Facebook UserProfile:", userProfile);

    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

// Local Strategy for username/password login

passport.use(new LocalStrategy({
  usernameField: 'email', // We're using email instead of username
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    let user = await User.findOne({ email });

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

    // 🔧 Check if UserProfile exists for this user
    let userProfile = await UserProfile.findOne({ userId: user._id });

    if (!userProfile) {
      // Create a default UserProfile for local users
      userProfile = await UserProfile.create({
        userId: user._id,
        email: user.email,
        displayName: user.displayName || user.email.split('@')[0], // fallback to email prefix
        avatar: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.displayName || user.email.split('@')[0]),
      });
    } else {
      userProfile.lastLogin = Date.now();
      await userProfile.save();
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