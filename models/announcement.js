const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'An announcement must have a title'],
    trim: true,
  },
  content: {
    type: String,
    required: [true, 'An announcement must have content'],
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
    required: [true, 'An announcement must belong to a course'],
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'An announcement must have an author'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

const Announcement = mongoose.model('Announcement', announcementSchema);
module.exports = Announcement;
