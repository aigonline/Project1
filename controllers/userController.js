// In controllers/userController.js

const User = require('../models/user.js');
const Activity = require('../models/activity.js');
const Course = require('../models/course.js');
const Resource = require('../models/resource.js');
const Assignment = require('../models/assignment.js');
const Submission = require('../models/submission.js');
const catchAsync = require('../utils/catchAsync.js');
const AppError = require('../utils/appError.js');
const { recordActivity } = require('../middleware/activityTracker.js');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Configure multer storage for file uploads
const multerStorage = multer.memoryStorage();

// Filter to ensure only images are uploaded
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

// Setup multer upload
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Middleware for uploading user photo
exports.uploadUserPhoto = upload.single('avatar');

// Resize user photo to standard size
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  // Set filename
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(__dirname, '../public/uploads/users');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Process image
  await sharp(req.file.buffer)
    .resize(200, 200)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(path.join(uploadsDir, req.file.filename));

  next();
});

// Update current user data
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }

  // 2) Filtered out unwanted fields that are not allowed to be updated
  const filteredBody = filterObj(
    req.body,
    'firstName',
    'lastName',
    'email',
    'bio'
  );

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  // 4) Record activity
  recordActivity(
    req.user,
    'other',
    'Updated profile information',
    {}
  );

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

// Update user avatar
exports.updateAvatar = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please upload an image file.', 400));
  }

  // Update user with new photo filename
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { profileImage: `/uploads/users/${req.file.filename}` },
    { new: true }
  );

  // Record activity
  recordActivity(
    req.user,
    'other',
    'Updated profile picture',
    {}
  );

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

// Delete current user (set inactive flag)
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Update email notification settings
exports.updateEmailSettings = catchAsync(async (req, res, next) => {
  // Filter allowed fields
  const filteredBody = filterObj(
    req.body,
    'emailNotifications',
    'emailAssignmentReminders',
    'emailCourseAnnouncements',
    'emailDiscussionReplies'
  );

  // Update user with new email settings
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { notificationSettings: filteredBody },
    { new: true }
  );

  // Record activity
  recordActivity(
    req.user,
    'other',
    'Updated notification settings',
    {}
  );

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

// Update language preference
exports.updateLanguage = catchAsync(async (req, res, next) => {
  const { language, region } = req.body;

  if (!language) {
    return next(new AppError('Please provide a language preference.', 400));
  }

  // Update user with new language settings
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { 
      language,
      region: region || 'default'
    },
    { new: true }
  );

  // Record activity
  recordActivity(
    req.user,
    'other',
    'Updated language preferences',
    {}
  );

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

// User activity endpoints
exports.getUserActivity = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Get login count and last login from user record
  const { loginCount, lastLogin } = user;
  
  // Get recent activity (last 5 activities)
  const recentActivity = await Activity.find({ user: req.user.id })
    .sort({ timestamp: -1 })
    .limit(5);

  res.status(200).json({
    status: 'success',
    data: {
      loginCount: loginCount || 0,
      lastLogin,
      recentActivity
    }
  });
});

// Get detailed activity history
exports.getActivityHistory = catchAsync(async (req, res, next) => {
  // Get all user activities with pagination
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 50;
  const skip = (page - 1) * limit;
  
  const activities = await Activity.find({ user: req.user.id })
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(limit);
  
  const totalActivities = await Activity.countDocuments({ user: req.user.id });
  
  res.status(200).json({
    status: 'success',
    results: activities.length,
    data: {
      activities,
      pagination: {
        count: totalActivities,
        pages: Math.ceil(totalActivities / limit),
        page,
        limit
      }
    }
  });
});

// Get student performance data
exports.getStudentPerformance = catchAsync(async (req, res, next) => {
  // Check if user is a student
  if (req.user.role !== 'student') {
    return next(new AppError('Only students can access performance data', 403));
  }
  
  // Get student submissions
  const submissions = await Submission.find({ student: req.user.id })
    .populate({
      path: 'assignment',
      select: 'title dueDate pointsPossible course',
      populate: {
        path: 'course',
        select: 'name code'
      }
    });
  
  // Calculate statistics
  const completedAssignments = submissions.length;
  
  // Find all assignments from enrolled courses
  const enrolledCourses = req.user.enrolledCourses || [];
  const assignments = await Assignment.find({ 
    course: { $in: enrolledCourses },
    dueDate: { $lt: new Date() } // Only include past-due assignments
  });
  const totalAssignments = assignments.length;
  
  // Count on-time, late, and missed submissions
  const onTimeSubmissions = submissions.filter(submission => 
    new Date(submission.submittedAt) <= new Date(submission.assignment.dueDate)
  ).length;
  
  const lateSubmissions = submissions.filter(submission => 
    new Date(submission.submittedAt) > new Date(submission.assignment.dueDate)
  ).length;
  
  const missedAssignments = Math.max(0, totalAssignments - completedAssignments);
  
  // Calculate average grade
  let averageGrade = null;
  const gradedSubmissions = submissions.filter(submission => 
    submission.grade && submission.grade.score !== undefined
  );
  
  if (gradedSubmissions.length > 0) {
    const totalScore = gradedSubmissions.reduce((sum, submission) => 
      sum + (submission.grade.score / submission.assignment.pointsPossible) * 100, 0
    );
    averageGrade = totalScore / gradedSubmissions.length;
  }
  
  // Calculate course progress
  const courseProgress = await Promise.all(enrolledCourses.map(async (courseId) => {
    const course = await Course.findById(courseId);
    if (!course) return null;
    
    // Get all assignments for this course
    const courseAssignments = await Assignment.find({ 
      course: courseId,
      dueDate: { $lt: new Date() } // Only include past-due assignments for accurate progress
    });
    
    if (courseAssignments.length === 0) {
      return {
        _id: courseId,
        name: course.name,
        code: course.code,
        progress: 0
      };
    }
    
    // Get submissions for this course's assignments
    const courseSubmissions = submissions.filter(submission => 
      submission.assignment.course._id.toString() === courseId.toString()
    );
    
    // Calculate progress as percentage of completed assignments
    const progress = (courseSubmissions.length / courseAssignments.length) * 100;
    
    return {
      _id: courseId,
      name: course.name,
      code: course.code,
      progress: Math.round(progress)
    };
  }));
  
  // Filter out null values (courses that no longer exist)
  const validCourseProgress = courseProgress.filter(Boolean);
  
  res.status(200).json({
    status: 'success',
    data: {
      averageGrade,
      completedAssignments,
      totalAssignments,
      onTimeSubmissions,
      lateSubmissions,
      missedAssignments,
      courseProgress: validCourseProgress
    }
  });
});

// Get instructor teaching statistics
exports.getInstructorStats = catchAsync(async (req, res, next) => {
  // Check if user is an instructor
  if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
    return next(new AppError('Only instructors can access teaching statistics', 403));
  }
  
  // Get instructor's courses
  const courses = await Course.find({ instructor: req.user.id });
  const courseIds = courses.map(course => course._id);
  
  // Count total students (unique students across all courses)
  let totalStudents = 0;
  
  if (courseIds.length > 0) {
    // Use aggregation to count unique student IDs
    const uniqueStudentsResult = await User.aggregate([
      {
        $match: {
          enrolledCourses: { $in: courseIds }
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 }
        }
      }
    ]);
    
    totalStudents = uniqueStudentsResult.length > 0 ? uniqueStudentsResult[0].count : 0;
  }
  
  // Count resources and assignments
  const totalResources = await Resource.countDocuments({ course: { $in: courseIds } });
  const totalAssignments = await Assignment.countDocuments({ course: { $in: courseIds } });
  
  // Get average grade across all courses
  let averageGrade = null;
  
  if (courseIds.length > 0) {
    // Get all assignment IDs for the instructor's courses
    const assignmentIds = await Assignment.find({ course: { $in: courseIds } })
      .distinct('_id');
    
    if (assignmentIds.length > 0) {
      // Get all submissions for these assignments that have been graded
      const gradedSubmissions = await Submission.aggregate([
        {
          $match: {
            assignment: { $in: assignmentIds },
            'grade.score': { $exists: true }
          }
        },
        {
          $lookup: {
            from: 'assignments',
            localField: 'assignment',
            foreignField: '_id',
            as: 'assignmentData'
          }
        },
        {
          $unwind: '$assignmentData'
        },
        {
          $project: {
            scorePercentage: {
              $multiply: [
                { $divide: ['$grade.score', '$assignmentData.pointsPossible'] },
                100
              ]
            }
          }
        },
        {
          $group: {
            _id: null,
            averageGrade: { $avg: '$scorePercentage' }
          }
        }
      ]);
      
      if (gradedSubmissions.length > 0) {
        averageGrade = gradedSubmissions[0].averageGrade;
      }
    }
  }
  
  // Calculate student engagement per course
  const studentEngagement = await Promise.all(courses.map(async (course) => {
    // Skip courses with no students
    if (!course.students || course.students.length === 0) {
      return {
        _id: course._id,
        name: course.name,
        code: course.code,
        engagement: 0
      };
    }
    
    // Count activities for this course
    const activityCount = await Activity.countDocuments({
      course: course._id,
      type: { $in: ['submission', 'resource', 'discussion'] }
    });
    
    // Calculate engagement score (activities per student, scaled)
    // This is a simplified metric - in a real app, you might use more sophisticated algorithms
    const engagementRatio = activityCount / course.students.length;
    
    // Scale to a percentage (0-100)
    // Assuming 10 activities per student is 100% engagement (adjust as needed)
    const maxActivitiesPerStudent = 10;
    const engagement = Math.min(Math.round((engagementRatio / maxActivitiesPerStudent) * 100), 100);
    
    return {
      _id: course._id,
      name: course.name,
      code: course.code,
      engagement
    };
  }));
  
  // Get recent activities in instructor's courses
  const recentActivity = await Activity.find({ 
    course: { $in: courseIds },
    type: { $in: ['submission', 'discussion', 'resource'] }
  })
    .sort({ timestamp: -1 })
    .limit(5)
    .populate({
      path: 'user',
      select: 'firstName lastName'
    });
  
  res.status(200).json({
    status: 'success',
    data: {
      totalStudents,
      totalCourses: courses.length,
      totalResources,
      totalAssignments,
      averageGrade,
      studentEngagement,
      recentActivity
    }
  });
});

// Get all users (admin only)
exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find();

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users
    }
  });
});

// Get user by ID
exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

// Create new user (admin only)
exports.createUser = catchAsync(async (req, res) => {
  const newUser = await User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role
  });

  res.status(201).json({
    status: 'success',
    data: {
      user: newUser
    }
  });
});

// Update user (admin only)
exports.updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

// Delete user (admin only)
exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Helper function to filter object
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};