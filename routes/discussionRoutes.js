const express = require('express');
const discussionController = require('../controllers/discussionController.js');
const { protect } = require('../middleware/auth.js');
const { uploadMultiple } = require('../middleware/upload.js');

const router = express.Router();

router.get('/courses/:courseId/discussions', discussionController.getCourseDiscussions);

// Protect all routes
router.use(protect);

// Get popular discussions
router.get('/popular', discussionController.getPopularDiscussions);

router.get('/my-discussions', protect, discussionController.getMyDiscussions);

// Main discussion routes
router.route('/')
  .get(discussionController.getAllDiscussions)
  .post(uploadMultiple, discussionController.createDiscussion);

router.route('/:id')
  .get(discussionController.getDiscussion)
  .patch(discussionController.updateDiscussion)
  .delete(discussionController.deleteDiscussion);

// Reply routes
router.post('/:id/replies', uploadMultiple, discussionController.addReply);
router.delete('/:discussionId/replies/:replyId', discussionController.deleteReply);

module.exports = router;