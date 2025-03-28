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
