import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import Test from '../models/Test.js';
import { logActivity } from '../services/activityService.js';
import { cascadeDeleteTest } from '../services/cascadeService.js';
import { ACTIVITY_TYPES } from '../config/constants.js';

export const getTests = asyncHandler(async (req, res) => {
  const { class: className } = req.query;
  const query = { sessionId: req.sessionId };
  if (className) query.class = className;

  const tests = await Test.find(query).sort({ createdAt: -1 });
  res.json({ success: true, data: tests });
});

export const getTest = asyncHandler(async (req, res) => {
  const test = await Test.findOne({ _id: req.params.id, sessionId: req.sessionId });
  if (!test) throw ApiError.notFound('Test not found');
  res.json({ success: true, data: test });
});

export const createTest = asyncHandler(async (req, res) => {
  const test = await Test.create({
    ...req.body,
    sessionId: req.sessionId,
    createdBy: req.user._id,
  });

  await logActivity({
    userId: req.user._id,
    sessionId: req.sessionId,
    action: ACTIVITY_TYPES.CREATE,
    module: 'tests',
    description: `Created test ${test.testName}`,
    metadata: { testId: test._id },
  });

  res.status(201).json({ success: true, data: test });
});

export const updateTest = asyncHandler(async (req, res) => {
  const test = await Test.findOneAndUpdate(
    { _id: req.params.id, sessionId: req.sessionId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!test) throw ApiError.notFound('Test not found');
  res.json({ success: true, data: test });
});

export const deleteTest = asyncHandler(async (req, res) => {
  const test = await Test.findOne({ _id: req.params.id, sessionId: req.sessionId });
  if (!test) throw ApiError.notFound('Test not found');

  const { marksDeleted } = await cascadeDeleteTest(req.sessionId, test._id);
  await Test.findByIdAndDelete(test._id);

  await logActivity({
    userId: req.user._id,
    sessionId: req.sessionId,
    action: ACTIVITY_TYPES.DELETE,
    module: 'tests',
    description: `Deleted test ${test.testName} and ${marksDeleted} mark record(s)`,
    metadata: { testId: test._id, marksDeleted },
  });

  res.json({
    success: true,
    message: 'Test and all related marks deleted',
    data: { marksDeleted },
  });
});


