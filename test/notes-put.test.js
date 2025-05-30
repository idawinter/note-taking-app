const mongoose = require('mongoose');
const Note = require('../models/note');
const UserProfile = require('../models/userProfile');

describe('Notes API - PUT /notes/:id', function () {
  const mockUser = {
    _id: new mongoose.Types.ObjectId(),
    username: 'testuser',
    googleId: 'mock-google-id-456'
  };

  let createdNote;

  beforeEach(async function () {
    app.request.user = mockUser;

    await Note.deleteMany({ owner: mockUser._id });

    createdNote = await Note.create({
      title: 'Original Title',
      content: 'Original Content',
      category: 'Old Category',
      owner: mockUser._id
    });

    await UserProfile.create({
      userId: mockUser.googleId,
      preferences: { fontSize: 14 }
    });
  });

  afterEach(async function () {
    delete app.request.user;
    await Note.deleteMany({ owner: mockUser._id });
    await UserProfile.deleteMany({ userId: mockUser.googleId });
  });

  it('should update an existing note', async function () {
    const res = await chai.request(app)
      .put(`/notes/${createdNote._id}?_method=PUT`)
      .type('form')
      .send({
        title: 'Updated Title',
        content: 'Updated Content',
        category: 'New Category'
      });

    expect(res).to.have.status(200);
    
    const updatedNote = await Note.findById(createdNote._id);
    expect(updatedNote.title).to.equal('Updated Title');
    expect(updatedNote.content).to.equal('Updated Content');
    expect(updatedNote.category).to.equal('New Category');
  });
});
