const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A course must have a name'],
    trim: true,
    maxlength: [100, 'A course name cannot be more than 100 characters']
  },
  code: {
    type: String,
    required: [true, 'A course must have a code'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  instructor: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A course must have an instructor']
  },
  color: {
    type: String,
    default: 'bg-blue-500' // Default color class from Tailwind CSS
  },
  image: {
    type: String,
    default: 'default-course.jpg'
  },
  enrollmentCode: {
    type: String,
    unique: true
  },
  allowEnrollment: {
    type: Boolean,
    default: true
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  students: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    default: [] 
  }],
  startDate: Date,
  endDate: Date,
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual properties for assignments, resources, etc.
courseSchema.virtual('assignments', {
  ref: 'Assignment',
  foreignField: 'course',
  localField: '_id'
});

courseSchema.virtual('resources', {
  ref: 'Resource',
  foreignField: 'course',
  localField: '_id'
});

courseSchema.virtual('discussions', {
  ref: 'Discussion',
  foreignField: 'course',
  localField: '_id'
});

// Pre middleware to populate instructor
courseSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'instructor',
    select: 'firstName lastName email profilePicture'
  });
  next();
});

// Generate enrollment code before save
courseSchema.pre('save', function(next) {
  if (this.isNew && !this.enrollmentCode) {
    // Generate a random 6-character alphanumeric code
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.enrollmentCode = code;
  }
  next();
});
const Course = mongoose.model('Course', courseSchema);

module.exports = Course;