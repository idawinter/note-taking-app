const mongoose = require('mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const Note = require('../models/note');
const UserProfile = require('../models/userProfile');
const { expect } = chai;

chai.use(chaiHttp);

describe('Notes API - DELETE /notes/:id', function () {
  const mockUser = {
    _id: new mongoose.Types.ObjectId(),
    username: 'testuser',
    googleId: 'mock-google-id-789'
  };

  let noteToDelete;

  beforeEach(async function () {
    app.request.user = mockUser; // Fake login
    await Note.deleteMany({ owner: mockUser._id }); // Clean up old notes

    // Create one note to delete
    noteToDelete = await Note.create({
      title: 'Note to delete',
      content: 'Delete me',
      category: 'Testing',
      owner: mockUser._id
    });

    await UserProfile.create({
      userId: mockUser.googleId,
      preferences: { fontSize: 14 }
    });
  });

  afterEach(function () {
    delete app.request.user;
  });

  it('should delete a note by ID', async function () {
    const res = await chai.request(app).delete(`/notes/${noteToDelete._id}`);
    expect(res).to.have.status(200); // If you redirect, use 302
    const deleted = await Note.findById(noteToDelete._id);
    expect(deleted).to.be.null;
  });
});
