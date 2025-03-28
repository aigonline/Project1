const express = require('express');
const userController = require('../controllers/userController.js');
const { protect, restrictTo } = require('../middleware/auth.js');
const upload = require('../middleware/upload.js');

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

// Routes for current user
router.patch('/updateMe', upload.single('profilePicture'), userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);

// Admin only routes
router.use(restrictTo('admin'));
router.route('/')
  .get(userController.getAllUsers);

router.route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;