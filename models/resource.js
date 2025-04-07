const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A comment must have an author']
    },
    content: {
      type: String,
      required: [true, 'Comment cannot be empty']
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'A resource must have a title'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    type: {
      type: String,
      required: [true, 'Resource type is required'],
      enum: ['file', 'link', 'text'],
    },
    category: {
      type: String,
      enum: ['lecture', 'reading', 'exercise', 'assignment', 'reference', 'other'],
      default: 'other'
    },
    file: {
      fileName: String,
      filePath: String,
      fileType: String,
      fileSize: Number
    },
    link: {
      type: String,
      validate: {
        validator: function(val) {
          // Only validate if type is link
          return this.type !== 'link' || /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(val);
        },
        message: 'Please provide a valid URL'
      }
    },
    content: {
      type: String,
      validate: {
        validator: function(val) {
          // Content is required only for text resources
          return this.type !== 'text' || (val && val.trim().length > 0);
        },
        message: 'Content is required for text resources'
      }
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'A resource must belong to a course']
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A resource must have an author']
    },
    isVisible: {
      type: Boolean,
      default: true
    },
    viewCount: {
      type: Number,
      default: 0
    },
    isPinned: {
      type: Boolean,
      default: false
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    comments: [commentSchema],
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better query performance
resourceSchema.index({ course: 1 });
resourceSchema.index({ addedBy: 1 });
resourceSchema.index({ isPinned: -1, createdAt: -1 });

// Auto-populate references
resourceSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'addedBy',
    select: 'firstName lastName email'
  }).populate({
    path: 'course',
    select: 'name code color instructor'
  }).populate({
    path: 'comments.user',
    select: 'firstName lastName email'
  });
  
  next();
});

const Resource = mongoose.model('Resource', resourceSchema);

module.exports = Resource;