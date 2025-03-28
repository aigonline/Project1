const User = require('../models/user.js');
const catchAsync = require('../utils/catchAsync.js');
const AppError = require('../utils/appError.js');
const APIFeatures = require('../utils/apiFeatures.js');

// Filtering user data for update
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// Get all users
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(User.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  
  const users = await features.query;

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
  const user = await User.findById(req.params.id).populate('enrolledCourses');

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

// Update user
exports.updateUser = catchAsync(async (req, res, next) => {
  // For security, don't allow password updates here - use updatePassword route
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not for password updates. Please use /updatePassword.', 400));
  }

  // Filter allowed fields
  const filteredBody = filterObj(req.body, 'firstName', 'lastName', 'email', 'bio', 'major', 'profilePicture');

  // Update user document
  const updatedUser = await User.findByIdAndUpdate(req.params.id, filteredBody, {
    new: true,
    runValidators: true
  });

  if (!updatedUser) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

// Delete user (deactivate)
exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, { active: false });

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Update current user profile
exports.updateMe = catchAsync(async (req, res, next) => {
  // Filter allowed fields
  const filteredBody = filterObj(req.body, 'firstName', 'lastName', 'email', 'bio', 'major');
  
  // Add profile picture if it exists
  if (req.file) filteredBody.profilePicture = req.file.filename;

  // Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

// Delete current user (deactivate)
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null
  });
});