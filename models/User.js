const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: false
  },
  facebookId: {type: String, required: false},
  displayName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: false
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
