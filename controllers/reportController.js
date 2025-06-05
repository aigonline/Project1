const Report = require('../models/report.js');
const catchAsync = require('../utils/catchAsync.js');
const AppError = require('../utils/appError.js');

exports.createReport = catchAsync(async (req, res, next) => {
  const { contentType, contentId, reason, details } = req.body;

  const report = await Report.create({
    reporter: req.user.id,
    contentType,
    contentId,
    reason,
    details
  });

  res.status(201).json({
    status: 'success',
    data: { report }
  });
});

exports.getReports = catchAsync(async (req, res, next) => {
  // Only admins can view reports
  if (req.user.role !== 'admin') {
    return next(new AppError('You do not have permission to view reports', 403));
  }

  const reports = await Report.find()
    .populate('reporter', 'firstName lastName email')
    .populate('reviewedBy', 'firstName lastName')
    .sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: reports.length,
    data: { reports }
  });
});

exports.updateReportStatus = catchAsync(async (req, res, next) => {
  const { status, reviewNotes } = req.body;
  const report = await Report.findByIdAndUpdate(req.params.id, {
    status,
    reviewNotes,
    reviewedBy: req.user.id,
    resolvedAt: status === 'resolved' ? Date.now() : undefined
  }, { new: true });

  res.status(200).json({
    status: 'success',
    data: { report }
  });
});