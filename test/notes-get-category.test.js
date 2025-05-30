const mongoose = require('mongoose');
const Note = require('../models/note');
const UserProfile = require('../models/userProfile');

describe('Notes API - GET /notes/category/:category', function () {
  const mockUser = {
    _id: new mongoose.Types.ObjectId(),
    username: 'testuser',
    googleId: 'mock-google-id-101'
  };

  beforeEach(async function () {
    app.request.user = mockUser;

    await Note.deleteMany({ owner: mockUser._id });
    await UserProfile.deleteMany({ userId: mockUser.googleId });

    await UserProfile.create({
      userId: mockUser.googleId,
      preferences: { fontSize: 14 }
    });

    // Add multiple notes
    await Note.create([
      {
        title: 'Note One',
        content: 'This is a work note',
        category: 'Work',
        owner: mockUser._id
      },
      {
        title: 'Note Two',
        content: 'This is a personal note',
        category: 'Personal',
        owner: mockUser._id
      }
    ]);
  });

  afterEach(function () {
    delete app.request.user;
  });

  it('should get notes filtered by category', async function () {
    const res = await chai.request(app).get('/notes/category/Work');
    expect(res).to.have.status(200);
    expect(res.text).to.include('Note One');
    expect(res.text).to.not.include('Note Two');
  });
});
