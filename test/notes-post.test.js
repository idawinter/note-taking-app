const mongoose = require('mongoose');
const Note = require('../models/note');
const UserProfile = require('../models/userProfile');

describe('Notes API - POST /notes', function () {
  const mockUser = { 
    _id: new mongoose.Types.ObjectId(), 
    username: 'testuser',
    googleId: 'mock-google-id-456'
  };

  beforeEach(async function () {
    app.request.user = mockUser; // simulate being logged in
    await Note.deleteMany({ owner: mockUser._id }); // start clean

    // Add profile preferences since the template might expect it
    await UserProfile.create({
      userId: mockUser.googleId,
      preferences: { fontSize: 14 }
    });
  });

  afterEach(function () {
    delete app.request.user;
  });

  it('should create a new note and redirect', async function () {
    const res = await chai.request(app)
      .post('/notes')
      .type('form') // mimic form submission
      .send({
        title: 'New Test Note',
        content: 'Some test content.',
        category: 'Testing'
      });

    expect(res).to.have.status(200); // or 302 if it redirects
    expect(res.redirects.length).to.be.above(0);
  });

  it('should return 400 when creating a note without required fields', async function () {
    const res = await chai.request(app)
      .post('/notes')
      .type('form')
      .send({
        // Missing title and content
        category: 'Empty Note'
      });
  
    expect(res).to.have.status(400); // Our app should return 400 from the catch block
  });
  
});
