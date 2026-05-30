import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { getClassAnalysis, getStudentAnalysis } from '../services/analyticsService.js';

export const classAnalysis = asyncHandler(async (req, res) => {
  const { class: className, testId } = req.query;
  if (!className || !testId) {
    throw ApiError.badRequest('Class and testId are required');
  }

  const analysis = await getClassAnalysis(req.sessionId, className, testId);
  if (!analysis) throw ApiError.notFound('Analysis data not found');

  res.json({ success: true, data: analysis });
});

export const studentAnalysis = asyncHandler(async (req, res) => {
  const analysis = await getStudentAnalysis(req.sessionId, req.params.studentId);
  if (!analysis) throw ApiError.notFound('Student not found');

  res.json({ success: true, data: analysis });
});
