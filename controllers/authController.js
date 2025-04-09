const jwt = require('jsonwebtoken');
const User = require('../models/user.js');
const AppError = require('../utils/appError.js');
const catchAsync = require('../utils/catchAsync.js');

// Helper function to create JWT token
const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// Helper function to send token response
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };
  
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

// Register user
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role || 'student'
  });

  createSendToken(newUser, 201, res);
});

// Login user
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  // Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  createSendToken(user, 200, res);
});

// Logout user
exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ status: 'success' });
};

// Get current user
exports.getMe = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user
    }
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // Validate request body
  if (!req.body.currentPassword || !req.body.newPassword) {
    return next(new AppError('Please provide both current and new passwords.', 400));
  }

  // Get user from DB with password field
  const user = await User.findById(req.user.id).select('+password');
  
  if (!user) {
    return next(new AppError('User not found.', 404));
  }

  // Check if the current password is correct
  const isMatch = await user.correctPassword(req.body.currentPassword, user.password);
  if (!isMatch) {
    return next(new AppError('Your current password is incorrect.', 401));
  }

  // Update password
  user.password = req.body.newPassword;
  await user.save();

  // Re-authenticate the user and send a new token
  createSendToken(user, 200, res);
});


