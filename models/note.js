const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // this connects each note to a user
    required: true
  },
  category: { 
    type: String,
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Note', noteSchema);
