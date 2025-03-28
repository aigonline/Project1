// controllers/courseLinkController.js
const CourseLink = require('../models/courseLink.js');
const Course = require('../models/course.js');
const User = require('../models/user.js');
const catchAsync = require('../utils/catchAsync.js');
const AppError = require('../utils/appError.js');

// Generate a new course link
exports.generateCourseLink = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  const { expiresIn, maxUses } = req.body;
  
  // Check if the course exists
  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError('No course found with that ID', 404));
  }
  
  // Check if user is the course instructor or an admin
  if (
    req.user.role !== 'admin' && 
    course.instructor.id.toString() !== req.user.id.toString()
  ) {
    return next(new AppError('You do not have permission to generate links for this course', 403));
  }
  
  // Calculate expiration date if provided
  let expiresAt;
  if (expiresIn) {
    // expiresIn should be in hours
    expiresAt = new Date(Date.now() + expiresIn * 60 * 60 * 1000);
  }
  
  // Create new course link
  const courseLink = await CourseLink.create({
    course: courseId,
    creator: req.user.id,
    expiresAt: expiresAt,
    maxUses: maxUses || null
  });
  
  // Return the created link
  res.status(201).json({
    status: 'success',
    data: {
      courseLink
    }
  });
});

// Get all course links for a course
exports.getCourseLinks = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  
  // Check if the course exists
  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError('No course found with that ID', 404));
  }
  
  // Check if user is the course instructor or an admin
  if (
    req.user.role !== 'admin' && 
    course.instructor.id.toString() !== req.user.id.toString()
  ) {
    return next(new AppError('You do not have permission to view links for this course', 403));
  }
  
  // Get all links for the course
  const courseLinks = await CourseLink.find({ course: courseId })
    .sort('-createdAt');
  
  res.status(200).json({
    status: 'success',
    results: courseLinks.length,
    data: {
      courseLinks
    }
  });
});

// Revoke a course link
exports.revokeCourseLink = catchAsync(async (req, res, next) => {
  const { linkId } = req.params;
  
  // Find the link
  const courseLink = await CourseLink.findById(linkId).populate('course');
  if (!courseLink) {
    return next(new AppError('No course link found with that ID', 404));
  }
  
  // Check if user is the course instructor or an admin
  if (
    req.user.role !== 'admin' && 
    courseLink.course.instructor.toString() !== req.user.id.toString()
  ) {
    return next(new AppError('You do not have permission to revoke this link', 403));
  }
  
  // Deactivate the link
  courseLink.isActive = false;
  await courseLink.save();
  
  res.status(200).json({
    status: 'success',
    data: {
      courseLink
    }
  });
});

// Join course via link
exports.joinCourseViaLink = catchAsync(async (req, res, next) => {
  if (!req.user) {
    // Optionally, redirect to login with a query parameter indicating the secure link token
    return res.redirect(`/login?redirect=/join/${req.params.token}`);
  }
  const { token } = req.params;
  
  // Find the link by token
  const courseLink = await CourseLink.findOne({ token }).populate('course');
  if (!courseLink) {
    return next(new AppError('Invalid or expired course link', 404));
  }
  
  // Check if the link is valid
  if (!courseLink.isActive) {
    return next(new AppError('This course link has been revoked', 400));
  }
  
  if (Date.now() > courseLink.expiresAt) {
    return next(new AppError('This course link has expired', 400));
  }
  
  if (courseLink.maxUses && courseLink.usedCount >= courseLink.maxUses) {
    return next(new AppError('This course link has reached its maximum uses', 400));
  }
  
  // Get the course
  const course = courseLink.course;
  
  // Check if user is already enrolled
  if (course.students.includes(req.user.id)) {
    return next(new AppError('You are already enrolled in this course', 400));
  }
  
  // Add user to course students
  course.students.push(req.user.id);
  await course.save();
  
  // Add course to user's enrolled courses
  const user = await User.findById(req.user.id);
  user.enrolledCourses.push(course._id);
  await user.save();
  
  // Increment the link's used count
  courseLink.usedCount += 1;
  await courseLink.save();
  
  res.status(200).json({
    status: 'success',
    message: 'Successfully enrolled in course',
    data: {
      course
    }
  });
});