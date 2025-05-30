const mongoose = require('mongoose');
const Note = require('../models/note');
const UserProfile = require('../models/userProfile');

describe('Notes API - GET /notes/:id', function () {
  const mockUser = {
    _id: new mongoose.Types.ObjectId(),
    username: 'testuser',
    googleId: 'mock-google-id-789'
  };

  let createdNote;

  beforeEach(async function () {
    app.request.user = mockUser;

    await Note.deleteMany({ owner: mockUser._id });
    await UserProfile.deleteMany({ userId: mockUser.googleId });

    await UserProfile.create({
      userId: mockUser.googleId,
      preferences: { fontSize: 14 }
    });

    createdNote = await Note.create({
      title: 'Single Note',
      content: 'Only one note content',
      category: 'Focus',
      owner: mockUser._id
    });
  });

  afterEach(function () {
    delete app.request.user;
  });

  it('should get a specific note by ID', async function () {
    const res = await chai.request(app).get(`/notes/${createdNote._id}`);
    expect(res).to.have.status(200);
    expect(res.text).to.include('Single Note');
    expect(res.text).to.include('Only one note content');
  });
});
