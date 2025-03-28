const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.ObjectId, auto: true },
  content: {
    type: String,
    required: [true, 'A reply must have content']
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A reply must have an author']
  },
  attachments: [{
    fileName: String,
    filePath: String,
    fileType: String
  }],
  likes: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  isEdited: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const discussionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'A discussion must have a title'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'A discussion must have content']
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
    required: [true, 'A discussion must belong to a course']
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A discussion must have an author']
  },
  attachments: [{
    fileName: String,
    filePath: String,
    fileType: String
  }],
  isPinned: {
    type: Boolean,
    default: false
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  replies: [replySchema], // Real path
  views: {
    type: Number,
    default: 0
  },
  tags: [String]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual property for reply count
discussionSchema.virtual('replyCount').get(function() {
  return this.replies.length;
});

// Pre middleware to populate author and course
discussionSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'author',
    select: 'firstName lastName profilePicture'
  }).populate({
    path: 'course',
    select: 'name code'
  });

  // Populate authors in replies
  this.populate({
    path: 'replies.author',
    select: 'firstName lastName profilePicture'
  });

  next();
});

const Discussion = mongoose.model('Discussion', discussionSchema);

module.exports = Discussion;