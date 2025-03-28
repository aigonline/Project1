// routes/courseLinkRoutes.js
const express = require('express');
const courseLinkController = require('../controllers/courseLinkController.js');
const { protect, restrictTo } = require('../middleware/auth.js');

const router = express.Router();

// Protect all routes
router.use(protect);
// Routes for course links
router.post('/courses/:courseId/links', restrictTo('instructor', 'admin'), courseLinkController.generateCourseLink);
router.get('/courses/:courseId/links', restrictTo('instructor', 'admin'), courseLinkController.getCourseLinks);
router.patch('/links/:linkId/revoke', restrictTo('instructor', 'admin'), courseLinkController.revokeCourseLink);
router.get('/join/:token', courseLinkController.joinCourseViaLink);
router.post('/join/:token', courseLinkController.joinCourseViaLink);

module.exports = router;