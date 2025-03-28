const express = require('express');
const assignmentController = require('../controllers/assignmentController.js');
const { protect, restrictTo } = require('../middleware/auth.js');
const upload = require('../middleware/upload.js');

const router = express.Router();

// Protect all routes
router.use(protect);

router.get('/courses/:courseId/assignments', assignmentController.getCourseAssignments);

router.get('/my-assignments', protect, assignmentController.getMyAssignments);

// Routes for all users
router.route('/')
  .get(assignmentController.getAllAssignments)
  .post(restrictTo('instructor', 'admin'), assignmentController.createAssignment);

router.route('/:id')
  .get(assignmentController.getAssignment)
  .patch(restrictTo('instructor', 'admin'), assignmentController.updateAssignment)
  .delete(restrictTo('instructor', 'admin'), assignmentController.deleteAssignment);

// Submission routes
router.post('/:id/submit', upload.array('files', 5), assignmentController.submitAssignment);
router.get('/:id/submissions', assignmentController.getSubmissions);
router.patch('/submissions/:id/grade', restrictTo('instructor', 'admin'), assignmentController.gradeSubmission);

module.exports = router;