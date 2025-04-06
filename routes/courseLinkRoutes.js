const express = require('express');
const courseLinkController = require('../controllers/courseLinkController.js');
const auth = require('../middleware/auth.js'); 

const router = express.Router();

// Protect all routes
router.use(auth.protect);

// Course link routes
router.post('/courses/:courseId/links', 
  auth.restrictTo('instructor', 'admin'), 
  courseLinkController.generateCourseLink
);

router.get('/courses/:courseId/links', 
  auth.restrictTo('instructor', 'admin'), 
  courseLinkController.getCourseLinks
);

router.patch('/links/:linkId/revoke', 
  auth.restrictTo('instructor', 'admin'), 
  courseLinkController.revokeCourseLink
);

router.post('/join/:token', auth.protect, courseLinkController.joinCourseViaLink);

module.exports = router;