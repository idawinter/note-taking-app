const mongoose = require('mongoose');
const Note = require('../models/note');
const UserProfile = require('../models/userProfile');


describe('Notes API - GET /notes', function () {
  const mockUser = { _id: new mongoose.Types.ObjectId(), 
    username: 'testuser',
    googleId: 'mock-google-id-123'
  };

  beforeEach(async function () {
    app.request.user = mockUser; // Fake being logged in
    await Note.deleteMany({ owner: mockUser._id }); // Clean slate
    await Note.create({
      title: 'Note A',
      content: 'This is a test note',
      category: 'Testing',
      owner: mockUser._id
    });

    await UserProfile.create({
      userId: mockUser.googleId,
      preferences: { fontSize: 16 } // or whatever default your template expects
    });
    
  });

  afterEach(function () {
    delete app.request.user;
  });

  it('should get all notes for the logged-in user', async function () {
    const res = await chai.request(app).get('/notes');
    expect(res).to.have.status(200);
    expect(res.text).to.include('Note A'); // because EJS renders HTML, we check the text
  });
});
