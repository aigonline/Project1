const express = require('express');
const resourceController = require('../controllers/resourceController.js');
const { protect, restrictTo } = require('../middleware/auth.js');
const upload = require('../middleware/upload.js');

const router = express.Router();

// Protect all routes
router.use(protect);
// Get resources by course
router.get('courses/:courseId/resources', resourceController.getCourseResources);
// Get resources by type
router.get('/type/:type', resourceController.getResourcesByType);
router.post('courses/:courseId/resources', upload.single('file'), resourceController.createResource);
router.get('/popular', resourceController.getPopularResources);
// Get resources uploaded by current user
router.get('/my-resources', resourceController.getMyResources);
router.patch('/:id/pin', protect, restrictTo('instructor', 'admin'), resourceController.togglePin);
router.patch('/:id/like', protect, resourceController.toggleLike);
// Main resource routes
router.route('/')
  .get(resourceController.getAllResources)
  .post(upload.single('file'), resourceController.createResource);

router.route('/:id')
  .get(resourceController.getResource)
  .patch(upload.single('file'), resourceController.updateResource)
  .delete(resourceController.deleteResource);

module.exports = router;