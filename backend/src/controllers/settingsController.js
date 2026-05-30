import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import SchoolSettings from '../models/SchoolSettings.js';
import ActivityLog from '../models/ActivityLog.js';

export const getSettings = asyncHandler(async (req, res) => {
  let settings = await SchoolSettings.findOne({ sessionId: req.sessionId });

  if (!settings) {
    settings = await SchoolSettings.create({ sessionId: req.sessionId });
  }

  res.json({ success: true, data: settings });
});

export const updateSettings = asyncHandler(async (req, res) => {
  const settings = await SchoolSettings.findOneAndUpdate(
    { sessionId: req.sessionId },
    {
      ...req.body,
      ...(req.file && { logo: `/uploads/logos/${req.file.filename}` }),
    },
    { new: true, upsert: true, runValidators: true }
  );

  res.json({ success: true, data: settings });
});

export const getActivities = asyncHandler(async (req, res) => {
  const { limit = 20 } = req.query;
  const activities = await ActivityLog.find({ sessionId: req.sessionId })
    .populate('userId', 'name email')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));

  res.json({ success: true, data: activities });
});

export const getDashboardStats = asyncHandler(async (req, res) => {
  const Student = (await import('../models/Student.js')).default;
  const Test = (await import('../models/Test.js')).default;

  const [students, tests, activities] = await Promise.all([
    Student.countDocuments({ sessionId: req.sessionId, isActive: true }),
    Test.countDocuments({ sessionId: req.sessionId }),
    ActivityLog.find({ sessionId: req.sessionId })
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .limit(10),
  ]);

  const classes = await Student.distinct('class', { sessionId: req.sessionId, isActive: true });

  res.json({
    success: true,
    data: {
      students,
      tests,
      classes: classes.length,
      recentActivities: activities,
    },
  });
});
