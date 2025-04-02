const Resource = require('../models/resource.js');
const Course = require('../models/course.js');
const catchAsync = require('../utils/catchAsync.js');
const AppError = require('../utils/appError.js');
const APIFeatures = require('../utils/apiFeatures.js');

// Get all resources
exports.getAllResources = catchAsync(async (req, res, next) => {
  // Allow filtering by course
  let filter = {};
  if (req.params.courseId) filter = { course: req.params.courseId };
  
  const features = new APIFeatures(Resource.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  
  const resources = await features.query;

  res.status(200).json({
    status: 'success',
    results: resources.length,
    data: {
      resources
    }
  });
});

// Get resources by course

exports.getCourseResources = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;

  // Ensure the course exists
  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError('No course found with that ID', 404));
  }

  // Find resources linked to the course
  const resources = await Resource.find({ course: courseId });

  res.status(200).json({
    status: 'success',
    results: resources.length,
    data: { resources }
  });
});


// Get resource by ID
exports.getResource = catchAsync(async (req, res, next) => {
  const resource = await Resource.findById(req.params.id);

  if (!resource) {
    return next(new AppError('No resource found with that ID', 404));
  }
  
  // Increment access count
  resource.accessCount += 1;
  await resource.save();

  res.status(200).json({
    status: 'success',
    data: {
      resource
    }
  });
});

// Create new resource
exports.createResource = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  // Check if the course exists
  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError('No course found with that ID', 404));
  }
  
  // Set user as the resource creator
  req.body.addedBy = req.user.id;
  
  // Determine if a file was uploaded or a link was provided
  if (req.file) {
    // File resource: attach file details
    req.body.file = {
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileType: req.file.mimetype,
      fileSize: req.file.size
    };
  } else if (req.body.link) {
    // Link resource: validate URL
    if (!validator.isURL(req.body.link)) {
      return next(new AppError('Invalid URL provided', 400));
    }
    // If a valid link is provided, ensure file field is not set
    req.body.link = req.body.link;
  } else {
    // If neither file nor link is provided, return an error
    return next(new AppError('Please provide either a file or a link for the resource', 400));
  }
  
  // Create the resource in the database
  const newResource = await Resource.create(req.body);
  
  res.status(201).json({
    status: 'success',
    data: {
      resource: newResource
    }
  });
});
// Update resource
exports.updateResource = catchAsync(async (req, res, next) => {
  const resource = await Resource.findById(req.params.id);

  if (!resource) {
    return next(new AppError('No resource found with that ID', 404));
  }

  // Check if user is the resource creator, course instructor, or an admin
  if (
    req.user.role !== 'admin' && 
    resource.addedBy.toString() !== req.user.id.toString()
  ) {
    const course = await Course.findById(resource.course);
    if (course.instructor.id.toString() !== req.user.id.toString()) {
      return next(new AppError('You do not have permission to update this resource', 403));
    }
  }

  // Handle file upload
  if (req.file) {
    req.body.file = {
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileType: req.file.mimetype,
      fileSize: req.file.size
    };
  }

  const updatedResource = await Resource.findByIdAndUpdate(req.params.id, req.body, {
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

// Delete resource
exports.deleteResource = catchAsync(async (req, res, next) => {
  const resource = await Resource.findById(req.params.id);

  if (!resource) {
    return next(new AppError('No resource found with that ID', 404));
  }

  // Check if user is the resource creator, course instructor, or an admin
  if (
    req.user.role !== 'admin' && 
    resource.addedBy.toString() !== req.user.id.toString()
  ) {
    const course = await Course.findById(resource.course);
    if (course.instructor.id.toString() !== req.user.id.toString()) {
      return next(new AppError('You do not have permission to delete this resource', 403));
    }
  }

  await Resource.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Get resources by type
exports.getResourcesByType = catchAsync(async (req, res, next) => {
  const { type } = req.params;
  
  const resources = await Resource.find({ type });

  res.status(200).json({
    status: 'success',
    results: resources.length,
    data: {
      resources
    }
  });
});

// Get my uploaded resources
// Get resources from all courses the current user is enrolled in
exports.getMyResources = catchAsync(async (req, res, next) => {
  // For students, get the courses they are enrolled in.
  // (For instructors, you might want to show resources they uploaded instead.)
  const courses = await Course.find({ students: req.user.id, instructor: req.user.id }).select('_id');
  const courseIds = courses.map(course => course._id);

  // Find resources for any of those courses
  const resources = await Resource.find({ course: { $in: courseIds } }).populate('course', 'name code');

  res.status(200).json({
    status: 'success',
    results: resources.length,
    data: { resources }
  });
});
exports.getPopularResources = catchAsync(async (req, res, next) => {
  const resources = await Resource.find().sort({ accessCount: -1 }).limit(5);

  res.status(200).json({
    status: 'success',
    results: resources.length,
    data: { resources }
  });
});
exports.togglePin = catchAsync(async (req, res, next) => {
  const resource = await Resource.findById(req.params.id);
  if (!resource) return next(new AppError('Resource not found', 404));

  resource.isPinned = !resource.isPinned;
  await resource.save();

  res.status(200).json({
      status: 'success',
      message: `Resource ${resource.isPinned ? 'pinned' : 'unpinned'}`,
      data: { resource }
  });
});
exports.toggleLike = catchAsync(async (req, res, next) => {
  const resource = await Resource.findById(req.params.id);
  if (!resource) return next(new AppError('Resource not found', 404));

  // Check if the user has already liked the resource
  const isLiked = resource.likes.includes(req.user.id);

  if (isLiked) {
    // Unlike the resource
    resource.likes = resource.likes.filter(userId => userId.toString() !== req.user.id);
  } else {
    // Like the resource
    resource.likes.push(req.user.id);
  }

  await resource.save();

  res.status(200).json({
      status: 'success',
      message: `Resource ${isLiked ? 'unliked' : 'liked'}`,
      data: { resource }
  });
});