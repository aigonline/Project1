const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'A resource must have a title'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  isPinned: { 
    type: Boolean, 
    default: false 
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
    required: [true, 'A resource must belong to a course']
  },
  type: {
    type: String,
    enum: ['PDF', 'PPT', 'DOC', 'Video', 'Link', 'Other'],
    default: 'Other'
  },
  file: {
    fileName: String,
    filePath: String,
    fileType: String,
    fileSize: Number
  },
  link: {
    type: String
  },
  addedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A resource must have an author']
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  accessCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Pre middleware to populate course and addedBy
resourceSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'course',
    select: 'name code'
  }).populate({
    path: 'addedBy',
    select: 'firstName lastName'
  });
  next();
});

const Resource = mongoose.model('Resource', resourceSchema);

module.exports = Resource;