const Resource = require('../models/resource.js');
const Course = require('../models/course.js');
const catchAsync = require('../utils/catchAsync.js');
const AppError = require('../utils/appError.js');
const APIFeatures = require('../utils/apiFeatures.js');
const validator = require('validator');

// Get all resources
const { uploadFile, deleteFile } = require('../utils/fileHandler.js');

// Get all resources the user has access to
exports.getAllResources = catchAsync(async (req, res, next) => {
  // Find all courses the user has access to
  let courseIds = [];
  
  if (req.user.role === 'student') {
    // Students can only see resources from courses they're enrolled in
    courseIds = req.user.enrolledCourses || [];
  } else if (req.user.role === 'instructor') {
    // Instructors can see resources from courses they teach
    const instructorCourses = await Course.find({ instructor: req.user.id }).select('_id');
    courseIds = instructorCourses.map(course => course._id);
  } else if (req.user.role === 'admin') {
    // Admins can see all resources
    const allCourses = await Course.find().select('_id');
    courseIds = allCourses.map(course => course._id);
  }
  
  // Students can only see visible resources
  const visibilityFilter = req.user.role === 'student' ? { isVisible: true } : {};
  
  // Get resources with pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 100;
  const skip = (page - 1) * limit;
  
  // Sort by pinned first, then by creation date
  const resources = await Resource.find({
    course: { $in: courseIds },
    ...visibilityFilter
  })
    .sort({ isPinned: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);
  
  res.status(200).json({
    status: 'success',
    results: resources.length,
    data: {
      resources
    }
  });
});

// Get resources for a specific course
exports.getCourseResources = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  
  // Check if course exists
  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError('No course found with that ID', 404));
  }
  
  // Check if user has access to the course
  const hasAccess = 
    req.user.role === 'instructor' || 
    course.instructor.toString() === req.user.id.toString() || 
    course.students.some(student => student.toString() === req.user.id.toString());
  
  if (!hasAccess) {
    return next(new AppError('You do not have permission to access resources for this course', 403));
  }
  
  // Students can only see visible resources
  const visibilityFilter = req.user.role === 'student' ? { isVisible: true } : {};
  
  // Get resources for the course
  const resources = await Resource.find({
    course: courseId,
    ...visibilityFilter
  }).sort({ isPinned: -1, createdAt: -1 });
  
  res.status(200).json({
    status: 'success',
    results: resources.length,
    data: {
      resources
    }
  });
});

// Get a single resource
exports.getResource = catchAsync(async (req, res, next) => {
  const resource = await Resource.findById(req.params.id);
  
  if (!resource) {
    return next(new AppError('No resource found with that ID', 404));
  }
  
  // Check if user has access to the course that contains this resource
  const course = await Course.findById(resource.course);
  
  if (!course) {
    return next(new AppError('Course not found for this resource', 404));
  }
  
  const hasAccess = 
    req.user.role === 'instructor' || 
    course.instructor.toString() === req.user.id.toString() || 
    course.students.some(student => student.toString() === req.user.id.toString());
  
  if (!hasAccess) {
    return next(new AppError('You do not have permission to access this resource', 403));
  }
  
  // If student, verify the resource is visible
  if (req.user.role === 'student' && !resource.isVisible) {
    return next(new AppError('This resource is not available', 403));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      resource
    }
  });
});

// Create a new resource
exports.createResource = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  
  // Check if the course exists
  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError('No course found with that ID', 404));
  }
  
  // Check if user can add resources to this course
  const canAddResources = 
    req.user.role === 'instructor' || 
    course.instructor.toString() === req.user.id.toString();
  
  if (!canAddResources) {
    return next(new AppError('You do not have permission to add resources to this course', 403));
  }
  
  // Set user as the resource creator and course
  req.body.addedBy = req.user.id;
  req.body.course = courseId;
  
  // Handle file uploads
  if (req.file) {
    // File resource: attach file details
    req.body.type = 'file';
    req.body.file = {
      fileName: req.file.originalname,
      filePath: req.file.path, // This will be set by your file handler middleware
      fileType: req.file.mimetype,
      fileSize: req.file.size
    };
  } else if (req.body.link) {
    // Link resource: validate URL
    req.body.type = 'link';
  } else if (req.body.content) {
    // Text resource
    req.body.type = 'text';
  } else {
    // If no file, link, or content is provided, return an error
    return next(new AppError('Please provide a file, link, or content for the resource', 400));
  }
  
  // Create the resource
  const newResource = await Resource.create(req.body);
  
  res.status(201).json({
    status: 'success',
    data: {
      resource: newResource
    }
  });
});

// Update a resource
exports.updateResource = catchAsync(async (req, res, next) => {
  const resourceId = req.params.id;
  
  // Get the resource
  const resource = await Resource.findById(resourceId);
  if (!resource) {
    return next(new AppError('No resource found with that ID', 404));
  }
  
  // Check if user can update this resource
  const canUpdate = 
    req.user.role === 'instructor' || 
    resource.addedBy.toString() === req.user.id.toString();
  
  if (!canUpdate) {
    return next(new AppError('You do not have permission to update this resource', 403));
  }
  
  // Determine which fields can be updated
  const allowedFields = ['title', 'description', 'category', 'isVisible'];
  
  // Add type-specific fields
  if (resource.type === 'link') {
    allowedFields.push('link');
  } else if (resource.type === 'text') {
    allowedFields.push('content');
  }
  
  // Filter the request body to only include allowed fields
  const filteredBody = {};
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      filteredBody[key] = req.body[key];
    }
  });
  
  // Update the updatedAt timestamp
  filteredBody.updatedAt = Date.now();
  
  // Update the resource
  const updatedResource = await Resource.findByIdAndUpdate(resourceId, filteredBody, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    status: 'success',
    data: {
      resource: updatedResource
    }
  });
});

// Delete a resource
exports.deleteResource = catchAsync(async (req, res, next) => {
  const resourceId = req.params.id;
  
  // Get the resource
  const resource = await Resource.findById(resourceId);
  
  if (!resource) {
    return next(new AppError('No resource found with that ID', 404));
  }
  
  // Check if user can delete this resource
  const canDelete = 
    req.user.role === 'instructor' || 
    resource.addedBy.toString() === req.user.id.toString();
  
  if (!canDelete) {
    return next(new AppError('You do not have permission to delete this resource', 403));
  }
  
  // If it's a file resource, delete the file from storage
  if (resource.type === 'file' && resource.file && resource.file.filePath) {
    await deleteFile(resource.file.filePath);
  }
  
  // Delete the resource from the database
  await Resource.findByIdAndDelete(resourceId);
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Like a resource
exports.likeResource = catchAsync(async (req, res, next) => {
  const resourceId = req.params.id;
  
  // Find the resource
  const resource = await Resource.findById(resourceId);
  
  if (!resource) {
    return next(new AppError('No resource found with that ID', 404));
  }
  
  // Check if user has access to this resource
  const course = await Course.findById(resource.course);
  const hasAccess = 
    req.user.role === 'instructor' || 
    course.instructor.toString() === req.user.id.toString() || 
    course.students.some(student => student.toString() === req.user.id.toString());
  
  if (!hasAccess) {
    return next(new AppError('You do not have permission to like this resource', 403));
  }
  
  // Check if user already liked the resource
  if (resource.likes.includes(req.user.id)) {
    return next(new AppError('You have already liked this resource', 400));
  }
  
  // Add user to likes array
  resource.likes.push(req.user.id);
  await resource.save();
  
  res.status(200).json({
    status: 'success',
    data: {
      likes: resource.likes.length
    }
  });
});

// Unlike a resource
exports.unlikeResource = catchAsync(async (req, res, next) => {
  const resourceId = req.params.id;
  
  // Find the resource
  const resource = await Resource.findById(resourceId);
  
  if (!resource) {
    return next(new AppError('No resource found with that ID', 404));
  }
  
  // Check if user has liked the resource
  if (!resource.likes.includes(req.user.id)) {
    return next(new AppError('You have not liked this resource', 400));
  }
  
  // Remove user from likes array
  resource.likes = resource.likes.filter(id => id.toString() !== req.user.id.toString());
  await resource.save();
  
  res.status(200).json({
    status: 'success',
    data: {
      likes: resource.likes.length
    }
  });
});

// Pin a resource (instructor only)
exports.pinResource = catchAsync(async (req, res, next) => {
  const resourceId = req.params.id;
  
  // Find the resource
  const resource = await Resource.findById(resourceId);
  
  if (!resource) {
    return next(new AppError('No resource found with that ID', 404));
  }
  
  // Check if user is instructor of the course or admin
  const course = await Course.findById(resource.course);
  const canPin = 
    req.user.role === 'instructor' || 
    course.instructor.toString() === req.user.id.toString();
  
  if (!canPin) {
    return next(new AppError('Only instructors can pin resources', 403));
  }
  
  // Set pinned status
  resource.isPinned = true;
  await resource.save();
  
  res.status(200).json({
    status: 'success',
    data: {
      resource
    }
  });
});

// Unpin a resource
exports.unpinResource = catchAsync(async (req, res, next) => {
  const resourceId = req.params.id;
  
  // Find the resource
  const resource = await Resource.findById(resourceId);
  
  if (!resource) {
    return next(new AppError('No resource found with that ID', 404));
  }
  
  // Check if user is instructor of the course or admin
  const course = await Course.findById(resource.course);
  const canUnpin = 
    req.user.role === 'instructor' || 
    course.instructor.toString() === req.user.id.toString();
  
  if (!canUnpin) {
    return next(new AppError('Only instructors can unpin resources', 403));
  }
  
  // Remove pinned status
  resource.isPinned = false;
  await resource.save();
  
  res.status(200).json({
    status: 'success',
    data: {
      resource
    }
  });
});

// Record a resource view
exports.recordResourceView = catchAsync(async (req, res, next) => {
  const resourceId = req.params.id;
  
  // Find and update the resource view count
  const resource = await Resource.findByIdAndUpdate(
    resourceId,
    { $inc: { viewCount: 1 } },
    { new: true }
  );
  
  if (!resource) {
    return next(new AppError('No resource found with that ID', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      viewCount: resource.viewCount
    }
  });
});

// Add a comment to a resource
exports.addComment = catchAsync(async (req, res, next) => {
  const resourceId = req.params.id;
  const { content } = req.body;
  
  if (!content || !content.trim()) {
    return next(new AppError('Comment cannot be empty', 400));
  }
  
  // Find the resource
  const resource = await Resource.findById(resourceId);
  
  if (!resource) {
    return next(new AppError('No resource found with that ID', 404));
  }
  
  // Check if user has access to this resource
  const course = await Course.findById(resource.course);
  const hasAccess = 
    req.user.role === 'instructor' || 
    course.instructor.toString() === req.user.id.toString() || 
    course.students.some(student => student.toString() === req.user.id.toString());
  
  if (!hasAccess) {
    return next(new AppError('You do not have permission to comment on this resource', 403));
  }
  
  // Add comment
  const newComment = {
    user: req.user.id,
    content,
    createdAt: Date.now()
  };
  
  resource.comments.push(newComment);
  await resource.save();
  
  // Return the updated resource with populated comment user
  const updatedResource = await Resource.findById(resourceId);
  
  res.status(201).json({
    status: 'success',
    data: {
      resource: updatedResource
    }
  });
});

// Update a comment
exports.updateComment = catchAsync(async (req, res, next) => {
  const { id: resourceId, commentId } = req.params;
  const { content } = req.body;
  
  if (!content || !content.trim()) {
    return next(new AppError('Comment cannot be empty', 400));
  }
  
  // Find the resource
  const resource = await Resource.findById(resourceId);
  
  if (!resource) {
    return next(new AppError('No resource found with that ID', 404));
  }
  
  // Find the comment
  const comment = resource.comments.id(commentId);
  
  if (!comment) {
    return next(new AppError('No comment found with that ID', 404));
  }
  
  // Check if user is the comment author or admin
  if (comment.user.toString() !== req.user.id.toString() && req.user.role !== 'instructor') {
    return next(new AppError('You can only edit your own comments', 403));
  }
  
  // Update the comment
  comment.content = content;
  comment.updatedAt = Date.now();
  await resource.save();
  
  // Return the updated resource with populated comment user
  const updatedResource = await Resource.findById(resourceId);
  
  res.status(200).json({
    status: 'success',
    data: {
      resource: updatedResource
    }
  });
});

// Delete a comment
exports.deleteComment = catchAsync(async (req, res, next) => {
  const { id: resourceId, commentId } = req.params;
  
  // Find the resource
  const resource = await Resource.findById(resourceId);
  
  if (!resource) {
    return next(new AppError('No resource found with that ID', 404));
  }
  
  // Find the comment
  const comment = resource.comments.id(commentId);
  
  if (!comment) {
    return next(new AppError('No comment found with that ID', 404));
  }
  
  // Check if user is the comment author, resource owner, course instructor, or admin
  const isCommentAuthor = comment.user.toString() === req.user.id.toString();
  const isResourceOwner = resource.addedBy.toString() === req.user.id.toString();
  const isCourseInstructor = typeof resource.course.instructor === 'object' 
    ? resource.course.instructor._id.toString() === req.user.id.toString()
    : resource.course.instructor.toString() === req.user.id.toString();
  const isAdmin = req.user.role === 'admin';
  
  if (!(isCommentAuthor || isResourceOwner || isCourseInstructor || isAdmin)) {
    return next(new AppError('You do not have permission to delete this comment', 403));
  }
  
  // Remove the comment
  resource.comments.pull(commentId);
  await resource.save();
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});