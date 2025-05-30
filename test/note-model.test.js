const { expect } = require('chai');
const mongoose = require('mongoose');
const Note = require('../models/note');

describe('Note Model', function () {
  const validNoteData = {
    title: 'Test Note',
    content: 'This is a test note',
    category: 'Testing',
    owner: new mongoose.Types.ObjectId()
  };

  it('should create a note with valid data', function () {
    const note = new Note(validNoteData);
    expect(note).to.have.property('title', validNoteData.title);
    expect(note).to.have.property('content', validNoteData.content);
    expect(note).to.have.property('category', validNoteData.category);
    expect(note).to.have.property('owner', validNoteData.owner);
  });

  it('should fail validation when content is missing', function () {
    const invalidNote = new Note({
      title: 'Missing content',
      owner: new mongoose.Types.ObjectId()
    });
  
    const error = invalidNote.validateSync();
    expect(error.errors.content).to.exist;
  });

  it('should set category to undefined when not provided', function () {
    const noteWithoutCategory = new Note({
      title: 'No category',
      content: 'Still valid',
      owner: new mongoose.Types.ObjectId()
    });
  
    expect(noteWithoutCategory).to.have.property('category').that.is.undefined;
  });
  
  
});

