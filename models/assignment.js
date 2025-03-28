const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'An assignment must have a title'],
    trim: true,
    maxlength: [100, 'An assignment title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'An assignment must have a description']
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
    required: [true, 'An assignment must belong to a course']
  },
  dueDate: {
    type: Date,
    required: [true, 'An assignment must have a due date']
  },
  pointsPossible: {
    type: Number,
    default: 100
  },
  attachments: [{
    fileName: String,
    filePath: String,
    fileType: String,
    fileSize: Number,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  submissionType: {
    type: String,
    enum: ['text', 'file', 'both'],
    default: 'both'
  },
  allowLateSubmissions: {
    type: Boolean,
    default: false
  },
  published: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual property for submissions
assignmentSchema.virtual('submissions', {
  ref: 'Submission',
  foreignField: 'assignment',
  localField: '_id'
});

// Pre middleware to populate course
assignmentSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'course',
    select: 'name code instructor'
  });
  next();
});

const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = Assignment;