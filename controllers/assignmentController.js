const Assignment = require('../models/assignment.js');
const Submission = require('../models/submission.js');
const Course = require('../models/course.js');
const catchAsync = require('../utils/catchAsync.js');
const AppError = require('../utils/appError.js');
const APIFeatures = require('../utils/apiFeatures.js');

exports.getCourseAssignments = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;

  // Ensure the course exists
  const course = await Course.findById(courseId);
  if (!course) {
      return next(new AppError("Course not found", 404));
  }

  // Find assignments linked to the course
  const assignments = await Assignment.find({ course: courseId });

  res.status(200).json({
      status: "success",
      results: assignments.length,
      data: { assignments },
  });
});

// Get all assignments
exports.getAllAssignments = catchAsync(async (req, res, next) => {
  // Allow filtering by course
  let filter = {};
  if (req.params.courseId) filter = { course: req.params.courseId };
  
  const features = new APIFeatures(Assignment.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  
  const assignments = await features.query;

  res.status(200).json({
    status: 'success',
    results: assignments.length,
    data: {
      assignments
    }
  });
});

// Get assignment by ID
exports.getAssignment = catchAsync(async (req, res, next) => {
  const assignment = await Assignment.findById(req.params.id);

  if (!assignment) {
    return next(new AppError('No assignment found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      assignment
    }
  });
});

// Create new assignment
exports.createAssignment = catchAsync(async (req, res, next) => {
  // Check if the course exists
  const course = await Course.findById(req.body.course);
  
  if (!course) {
    return next(new AppError('No course found with that ID', 404));
  }
  
  // Check if user is the course instructor or an admin
  if (
    req.user.role !== 'admin' && 
    course.instructor.id.toString() !== req.user.id.toString()
  ) {
    return next(new AppError('You do not have permission to create assignments for this course', 403));
  }

  const newAssignment = await Assignment.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      assignment: newAssignment
    }
  });
});

// Update assignment
exports.updateAssignment = catchAsync(async (req, res, next) => {
  const assignment = await Assignment.findById(req.params.id);

  if (!assignment) {
    return next(new AppError('No assignment found with that ID', 404));
  }

  // Check if user is the course instructor or an admin
  const course = await Course.findById(assignment.course);
  
  if (
    req.user.role !== 'admin' && 
    course.instructor.id.toString() !== req.user.id.toString()
  ) {
    return next(new AppError('You do not have permission to update this assignment', 403));
  }

  const updatedAssignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      assignment: updatedAssignment
    }
  });
});

// Delete assignment
exports.deleteAssignment = catchAsync(async (req, res, next) => {
  const assignment = await Assignment.findById(req.params.id);

  if (!assignment) {
    return next(new AppError('No assignment found with that ID', 404));
  }

  // Check if user is the course instructor or an admin
  const course = await Course.findById(assignment.course);
  
  if (
    req.user.role !== 'admin' && 
    course.instructor.id.toString() !== req.user.id.toString()
  ) {
    return next(new AppError('You do not have permission to delete this assignment', 403));
  }

  await Assignment.findByIdAndDelete(req.params.id);
  
  // Also delete all submissions for this assignment
  await Submission.deleteMany({ assignment: req.params.id });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Submit assignment
exports.submitAssignment = catchAsync(async (req, res, next) => {
  // Check if assignment exists
  const assignment = await Assignment.findById(req.params.id);
  
  if (!assignment) {
    return next(new AppError('No assignment found with that ID', 404));
  }
  
  // Check if student is enrolled in the course
  const course = await Course.findById(assignment.course);
  
  if (!course.students.includes(req.user.id)) {
    return next(new AppError('You are not enrolled in this course', 403));
  }
  
  // Check if user has already submitted
  const existingSubmission = await Submission.findOne({
    assignment: req.params.id,
    student: req.user.id
  });
  
  if (existingSubmission) {
    return next(new AppError('You have already submitted this assignment', 400));
  }
  
  // Create submission object
  const submissionData = {
    assignment: req.params.id,
    student: req.user.id,
    textContent: req.body.textContent
  };
  
  // Add attachments if they exist
  if (req.files && req.files.length > 0) {
    submissionData.attachments = req.files.map(file => ({
      fileName: file.originalname,
      filePath: file.path,
      fileType: file.mimetype,
      fileSize: file.size
    }));
  }
  
  // Create submission
  const newSubmission = await Submission.create(submissionData);
  
  res.status(201).json({
    status: 'success',
    data: {
      submission: newSubmission
    }
  });
});

// Get submissions for an assignment
exports.getSubmissions = catchAsync(async (req, res, next) => {
  const assignment = await Assignment.findById(req.params.id);
  
  if (!assignment) {
    return next(new AppError('No assignment found with that ID', 404));
  }
  
  // Check permissions
  const course = await Course.findById(assignment.course);
  
  // Only instructor or admin can see all submissions
  if (
    req.user.role !== 'admin' && 
    course.instructor.id.toString() !== req.user.id.toString()
  ) {
    // Students can only see their own submissions
    const mySubmission = await Submission.findOne({
      assignment: req.params.id,
      student: req.user.id
    });
    
    return res.status(200).json({
      status: 'success',
      data: {
        submissions: mySubmission ? [mySubmission] : []
      }
    });
  }
  
  // Get all submissions for this assignment
  const submissions = await Submission.find({ assignment: req.params.id });
  
  res.status(200).json({
    status: 'success',
    results: submissions.length,
    data: {
      submissions
    }
  });
});

// Grade submission
exports.gradeSubmission = catchAsync(async (req, res, next) => {
  const submission = await Submission.findById(req.params.id);
  
  if (!submission) {
    return next(new AppError('No submission found with that ID', 404));
  }
  
  // Check if user is the course instructor or an admin
  const assignment = await Assignment.findById(submission.assignment);
  const course = await Course.findById(assignment.course);
  
  if (
    req.user.role !== 'admin' && 
    course.instructor.id.toString() !== req.user.id.toString()
  ) {
    return next(new AppError('You do not have permission to grade this submission', 403));
  }
  
  // Update submission with grade
  submission.status = 'graded';
  submission.grade = {
    score: req.body.score,
    feedback: req.body.feedback,
    gradedBy: req.user.id,
    gradedAt: Date.now()
  };
  
  await submission.save();
  
  res.status(200).json({
    status: 'success',
    data: {
      submission
    }
  });
});

exports.getMyAssignments = catchAsync(async (req, res, next) => {
  // Find courses where the current user is enrolled
  const courses = await Course.find({ students: req.user.id, instructor: req.user.id}).select('_id');
  const courseIds = courses.map(course => course._id);

  // Find assignments for any of those courses
  const assignments = await Assignment.find({ course: { $in: courseIds } }).populate('course', 'name code');

  res.status(200).json({
      status: 'success',
      results: assignments.length,
      data: { assignments }
  });
});


