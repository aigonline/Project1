const express = require('express');
const resourceController = require('../controllers/resourceController.js');
const authMiddleware = require('../middleware/auth.js');
const { uploadFile } = require('../middleware/upload.js'); // Your file upload middleware

const router = express.Router({ mergeParams: true });

// Protect all routes
router.use(authMiddleware.protect);

// create resource route
router.post('/:courseId', uploadFile, resourceController.createResource);
// Resource routes
router.route('/')
  .get(resourceController.getAllResources);

router.route('/:id')
  .get(resourceController.getResource)
  .patch(resourceController.updateResource)
  .delete(resourceController.deleteResource);

// Interaction routes
router.post('/:id/like', resourceController.likeResource);
router.delete('/:id/unlike', resourceController.unlikeResource);

router.post('/:id/pin', authMiddleware.restrictTo('instructor', 'admin'), resourceController.pinResource);
router.delete('/:id/pin', authMiddleware.restrictTo('instructor', 'admin'), resourceController.unpinResource);

router.post('/:id/view', resourceController.recordResourceView);

// Comment routes
router.route('/:id/comments')
  .post(resourceController.addComment);

router.route('/:id/comments/:commentId')
  .patch(resourceController.updateComment)
  .delete(resourceController.deleteComment);

// Mounting in other files:
// app.use('/api/v1/resources', resourceRoutes);
// app.use('/api/v1/courses/:courseId/resources', resourceRoutes);

module.exports = router;