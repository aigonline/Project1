const Announcement = require('../models/announcement.js');
const catchAsync = require('../utils/catchAsync.js');
const AppError = require('../utils/appError.js');

exports.createAnnouncement = catchAsync(async (req, res, next) => {
  const { title, content, course } = req.body;

  const announcement = await Announcement.create({
    title,
    content,
    course,
    author: req.user.id
  });

  res.status(201).json({
    status: "success",
    data: { announcement },
  });
});

exports.getCourseAnnouncements = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;

  const announcements = await Announcement.find({ course: courseId })
    .populate({
      path: 'author',
      select: 'firstName lastName profilePicture' // ✅ Ensure these fields are selected
    });

  res.status(200).json({
    status: "success",
    results: announcements.length,
    data: { announcements },
  });
});

exports.getAllAnnouncements = catchAsync(async (req, res, next) => {
  // Assuming req.user contains the logged-in user and their role
  // and req.user.courses contains an array of course IDs the user is enrolled in or instructing

  let courseIds = [];

  if (req.user.role === 'instructor' || req.user.role === 'student') {
    // For both instructors and students, fetch announcements for their courses
    courseIds = req.user.courses || [];
  } else {
    // For admins or other roles, fetch all announcements
    courseIds = null;
  }

  let query = {};
  if (courseIds && courseIds.length > 0) {
    query = { course: { $in: courseIds } };
  }

  const announcements = await Announcement.find(query)
    .populate({
      path: 'author',
      select: 'firstName lastName profilePicture'
    })
    .populate({
            path: 'course',
            select: 'code name color'  // Make sure to select these fields
        });

  res.status(200).json({
    status: "success",
    results: announcements.length,
    data: { announcements },
  });
});
