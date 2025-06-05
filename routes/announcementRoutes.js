const express = require('express');
const { protect, restrictTo } = require('../middleware/auth.js');
const announcementController = require('../controllers/announcementController.js');

const router = express.Router();
router.use(protect);
router.route('/all').get(announcementController.getAllAnnouncements);
router.route('/').post(restrictTo('instructor', 'admin'), announcementController.createAnnouncement);
router.route('/:courseId').get(announcementController.getCourseAnnouncements);

module.exports = router;
