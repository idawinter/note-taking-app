const express = require('express');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();
require('./config/passport');
const noteRoutes = require('./routes/notes');
const apiRoutes = require('./routes/api');
const methodOverride = require('method-override');

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notes-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

app.set('view engine', 'ejs');
// if you delete this line, it will default to 'views' folder
app.set('views', path.join(__dirname, 'html')); 

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(methodOverride('_method'));

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/', require('./routes/auth'));

app.get('/', (req, res) => {
  res.render('login', { user: req.user });
});

app.get('/dashboard', isLoggedIn, (req, res) => {
  res.render('dashboard', { user: req.user });
});

app.use('/', noteRoutes);

app.use('/', apiRoutes);




// Middleware to check if user is authenticated
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to see the app`);
});