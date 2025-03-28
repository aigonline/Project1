const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  assignment: {
    type: mongoose.Schema.ObjectId,
    ref: 'Assignment',
    required: [true, 'A submission must belong to an assignment']
  },
  student: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A submission must belong to a student']
  },
  textContent: {
    type: String
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
  submittedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'late', 'graded', 'returned'],
    default: 'submitted'
  },
  grade: {
    score: Number,
    feedback: String,
    gradedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    gradedAt: Date
  },
  isLate: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Pre middleware to populate assignment and student
submissionSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'assignment',
    select: 'title dueDate pointsPossible'
  }).populate({
    path: 'student',
    select: 'firstName lastName email'
  });
  next();
});

// Check if submission is late
submissionSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('submittedAt')) {
    this.populate('assignment')
      .then(() => {
        if (this.submittedAt > this.assignment.dueDate) {
          this.isLate = true;
          this.status = 'late';
        }
        next();
      })
      .catch(err => next(err));
  } else {
    next();
  }
});

const Submission = mongoose.model('Submission', submissionSchema);

module.exports = Submission;