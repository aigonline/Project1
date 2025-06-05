const express = require('express');
const reportController = require('../controllers/reportController.js');
const { protect, restrictTo } = require('../middleware/auth.js');

const router = express.Router();

router.use(protect);

router.post('/', reportController.createReport);
router.get('/', restrictTo('admin'), reportController.getReports);
router.patch('/:id', restrictTo('admin'), reportController.updateReportStatus);

module.exports = router;