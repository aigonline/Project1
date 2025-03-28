const express = require('express');
const userController = require('../controllers/userController.js');
const { protect, restrictTo } = require('../middleware/auth.js');
const upload = require('../middleware/upload.js');
const assignmentController = require('../controllers/assignmentController.js');
const courseController = require('../controllers/courseController.js');
const discussionController = require('../controllers/discussionController.js');
const resourceController = require('../controllers/resourceController.js');

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);
// Get Discussions
router.get('/:courseId/discussions', discussionController.getCourseDiscussions);
//Get Resources
router.get('/:courseId/resources', resourceController.getCourseResources);
// Get assignments
router.get('/:courseId/assignments', assignmentController.getCourseAssignments);
// Routes for current user
router.patch('/updateMe', upload.single('profilePicture'), userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);

// Course routes
router.get('/my-courses', protect, courseController.getMyCourses);
router.get("/", courseController.getAllCourses);
router.delete('/:courseId/unenroll', courseController.unenrollFromCourse);

router.post('/', protect, restrictTo('instructor'), courseController.createCourse);
router.get('/:id', protect, courseController.getCourse); // Add this line
router.post('/enroll', courseController.enrollInCourse);
// Admin only routes
router.route('/')
  .get(userController.getAllUsers);

router.route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;