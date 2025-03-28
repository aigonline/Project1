const express = require('express');
const authController = require('../controllers/authController.js');
const { protect } = require('../middleware/auth.js');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.get('/me', protect, authController.getMe);
router.patch('/updatePassword', protect, authController.updatePassword);

module.exports = router;