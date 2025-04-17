const express = require('express'); // Importing express for routing
const userController = require('../controllers/userController.js');
const authController = require('../controllers/authController.js');
const auth = require('../middleware/auth.js'); // Middleware for authentication and authorization
// Middleware for authentication and authorization
const upload = require('../middleware/upload.js'); // Middleware for handling file uploads
const router = express.Router();

// Auth routes (not requiring authentication)
router.post('/signup', authController.signup);
router.post('/login', authController.login);
//router.post('/forgotPassword', authController.forgotPassword);
//router.patch('/resetPassword/:token', authController.resetPassword);




// Current user routes
router.get('/me', auth.protect, authController.getMe); // Get current user details
router.patch('/updateMe', auth.protect, userController.updateMe);
router.delete('/deleteMe', auth.protect, userController.deleteMe);
router.patch('/updateMyPassword', auth.protect, authController.updatePassword);

// Activity and analytics routes
router.get('/me/activity', auth.protect, userController.getUserActivity);
router.get('/me/activity/history', auth.protect, userController.getActivityHistory);
router.get('/me/performance', auth.protect, userController.getStudentPerformance);
router.get('/me/teaching', auth.protect, userController.getInstructorStats);
router.post('/verifyToken', userController.verifyToken);
// Avatar upload route
router.patch(
    '/updateAvatar',
    upload.single('avatar'), // 'avatar' is the field name in the form
    userController.resizeUserPhoto, // Optional middleware to resize the image
    userController.updateAvatar
);

// Email and notification settings
router.patch('/updateEmailSettings', auth.protect, userController.updateEmailSettings);
router.patch('/updateLanguage', auth.protect, userController.updateLanguage);

// Restrict access to admin-only routes
router.use(auth.restrictTo('instructor', 'admin'));

// Admin routes for user management
router.route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser);

router.route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = router;