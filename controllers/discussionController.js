const Discussion = require('../models/discussion.js');
const Course = require('../models/course.js');
const catchAsync = require('../utils/catchAsync.js');
const AppError = require('../utils/appError.js');
const APIFeatures = require('../utils/apiFeatures.js');

exports.getCourseDiscussions = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;

  // Ensure the course exists
  const course = await Course.findById(courseId);
  if (!course) {
      return next(new AppError("Course not found", 404));
  }

  // Find discussions linked to the course
  const discussions = await Discussion.find({ course: courseId });

  res.status(200).json({
      status: "success",
      results: discussions.length,
      data: { discussions },
  });
});
// Get all discussions
exports.getAllDiscussions = catchAsync(async (req, res, next) => {
  // Allow filtering by course
  let filter = {};
  if (req.params.courseId) filter = { course: req.params.courseId };
  
  const features = new APIFeatures(Discussion.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  
  const discussions = await features.query;

  res.status(200).json({
    status: 'success',
    results: discussions.length,
    data: {
      discussions
    }
  });
});

// Get discussion by ID
exports.getDiscussion = catchAsync(async (req, res, next) => {
  const discussion = await Discussion.findById(req.params.id);

  if (!discussion) {
    return next(new AppError('No discussion found with that ID', 404));
  }
  
  // Increment views
  discussion.views += 1;
  await discussion.save();

  res.status(200).json({
    status: 'success',
    data: {
      discussion
    }
  });
});

// Create new discussion
exports.createDiscussion = catchAsync(async (req, res, next) => {
  const { title, content, course } = req.body;

  // Ensure the course exists
  const courseExists = await Course.findById(course).populate('instructor', '_id'); // ✅ Ensure only ID is populated

  if (!courseExists) {
    return next(new AppError("Course not found", 404));
  }

  // Fix the instructor check ✅
  const isInstructor = courseExists.instructor._id.toString() === req.user.id.toString();
  const isEnrolled = courseExists.students.some(id => id.toString() === req.user.id.toString());



  if (!isEnrolled && !isInstructor && req.user.role !== 'admin') {
    return next(new AppError('You must be enrolled or the instructor to create a discussion', 403));
  }


  // Create discussion
  const discussion = await Discussion.create({
    title,
    content,
    course,
    author: req.user.id,
  });

  res.status(201).json({
    status: "success",
    data: { discussion },
  });
});


// Update discussion
exports.updateDiscussion = catchAsync(async (req, res, next) => {
  const discussion = await Discussion.findById(req.params.id);

  if (!discussion) {
    return next(new AppError('No discussion found with that ID', 404));
  }

  // Check if user is the author or an instructor/admin
  if (
    discussion.author.id.toString() !== req.user.id.toString() &&
    req.user.role !== 'admin'
  ) {
    const course = await Course.findById(discussion.course);
    if (course.instructor.id.toString() !== req.user.id.toString()) {
      return next(new AppError('You do not have permission to update this discussion', 403));
    }
  }
  


  const updatedDiscussion = await Discussion.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      discussion: updatedDiscussion
    }
  });
});

// Delete discussion
exports.deleteDiscussion = catchAsync(async (req, res, next) => {
  console.log("🔍 Attempting to delete discussion with ID:", req.params.id);

  // Fetch the discussion and populate the author field
  const discussion = await Discussion.findById(req.params.id).populate('author');

  if (!discussion) {
    console.error("❌ Discussion not found!");
    return next(new AppError('No discussion found with that ID', 404));
  }

  // Check if user is the author, course instructor, or admin
  if (
    discussion.author && discussion.author._id.toString() !== req.user.id.toString() &&
    req.user.role !== 'admin'
  ) {
    console.log("🔍 Checking if user is the instructor...");
    const course = await Course.findById(discussion.course);
    if (!course || course.instructor.toString() !== req.user.id.toString()) {
      return next(new AppError('You do not have permission to delete this discussion', 403));
    }
  }

  await Discussion.findByIdAndDelete(req.params.id);
  
  // ✅ Send a proper JSON response
  res.status(200).json({
    status: 'success',
    message: 'Discussion deleted successfully'
  });
});

// Add reply to discussion
exports.addReply = catchAsync(async (req, res, next) => {
  const discussion = await Discussion.findById(req.params.id);
  
  if (!discussion) {
    return next(new AppError('No discussion found with that ID', 404));
  }
  
  // Check if discussion is locked
  if (discussion.isLocked) {
    return next(new AppError('This discussion is locked and cannot receive new replies', 403));
  }
  
  // Check if user is enrolled in the course or is the instructor
  const course = await Course.findById(discussion.course);
  const isEnrolled = course.students.some(id => id.toString() === req.user.id.toString());
  const isInstructor = course.instructor.id.toString() === req.user.id.toString();
  
  if (!isEnrolled && !isInstructor && req.user.role !== 'admin') {
    return next(new AppError('You must be enrolled in the course to reply to this discussion', 403));
  }
  
  // Create reply object
  const reply = {
    content: req.body.content,
    author: req.user.id
  };
  
  // Add attachments if they exist
  if (req.files && req.files.length > 0) {
    reply.attachments = req.files.map(file => ({
      fileName: file.originalname,
      filePath: file.path,
      fileType: file.mimetype
    }));
  }
  
  // Add reply to discussion
  discussion.replies.push(reply);
  await discussion.save();
  
  // Return updated discussion
  res.status(200).json({
    status: 'success',
    data: {
      discussion
    }
  });
});

// Delete reply
exports.deleteReply = catchAsync(async (req, res, next) => {
  console.log("🔍 Request received to delete reply...");
  console.log("🔍 Full `req.params` object:", req.params);  // ✅ Debugging Log

  const { discussionId, replyId } = req.params;

  // 🛑 Check if `discussionId` or `replyId` is missing
  if (!discussionId || !replyId) {
      console.error("❌ Missing discussionId or replyId in request.");
      return next(new AppError('Invalid request. Discussion ID or Reply ID is missing.', 400));
  }

  console.log("🔍 Received discussionId:", discussionId);
  console.log("🔍 Received replyId:", replyId);

  // Find the discussion
  const discussion = await Discussion.findById(discussionId);
  if (!discussion) {
      console.error("❌ Discussion not found in database.");
      return next(new AppError('Discussion not found', 404));
  }

  // Find the reply index
  const replyIndex = discussion.replies.findIndex(r => r._id.toString() === replyId);
  if (replyIndex === -1) {
      console.error("❌ Reply not found in this discussion.");
      return next(new AppError('Reply not found', 404));
  }

  // Remove the reply
  discussion.replies.splice(replyIndex, 1);
  await discussion.save();

  console.log("✅ Reply deleted successfully.");
  res.status(200).json({
    status: 'success',
    message: 'Discussion deleted successfully'
  });
});




// Get popular discussions
exports.getPopularDiscussions = catchAsync(async (req, res, next) => {
  // Find courses where the current user is enrolled
  const courses = await Course.find({ students: req.user.id }).select('_id');
  const courseIds = courses.map(course => course._id);

  const discussions = await Discussion.find( {course: { $in: courseIds }})
    .sort({ views: -1, 'replies.length': -1 })
    .limit(5);
  
  res.status(200).json({
    status: 'success',
    results: discussions.length,
    data: {
      discussions
    }
  });
});

exports.getMyDiscussions = catchAsync(async (req, res, next) => {
  // Find courses where the current user is enrolled
  const courses = await Course.find({ students: req.user.id, instructor: req.user.id }).select('_id');
  const courseIds = courses.map(course => course._id);

  // Find discussions for any of those courses
  const discussions = await Discussion.find({ course: { $in: courseIds } }).populate('course', 'name code');

  res.status(200).json({
      status: 'success',
      results: discussions.length,
      data: { discussions }
  });
});