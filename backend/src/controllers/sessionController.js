import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import AcademicSession from '../models/AcademicSession.js';
import SchoolSettings from '../models/SchoolSettings.js';
import { logActivity } from '../services/activityService.js';
import { ACTIVITY_TYPES } from '../config/constants.js';

export const getSessions = asyncHandler(async (req, res) => {
  const sessions = await AcademicSession.find().sort({ startYear: -1 });
  res.json({ success: true, data: sessions });
});

export const createSession = asyncHandler(async (req, res) => {
  const { name, startYear, endYear } = req.body;

  const exists = await AcademicSession.findOne({ name });
  if (exists) throw ApiError.badRequest('Session already exists');

  const session = await AcademicSession.create({
    name,
    startYear,
    endYear,
    createdBy: req.user._id,
  });

  await SchoolSettings.create({
    sessionId: session._id,
    classes: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    sections: ['A', 'B', 'C'],
  });

  await logActivity({
    userId: req.user._id,
    sessionId: session._id,
    action: ACTIVITY_TYPES.CREATE,
    module: 'sessions',
    description: `Created academic session ${name}`,
  });

  res.status(201).json({ success: true, data: session });
});

export const getSession = asyncHandler(async (req, res) => {
  const session = await AcademicSession.findById(req.params.id);
  if (!session) throw ApiError.notFound('Session not found');
  res.json({ success: true, data: session });
});

export const updateSession = asyncHandler(async (req, res) => {
  const session = await AcademicSession.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!session) throw ApiError.notFound('Session not found');
  res.json({ success: true, data: session });
});

export const deleteSession = asyncHandler(async (req, res) => {
  const session = await AcademicSession.findByIdAndDelete(req.params.id);
  if (!session) throw ApiError.notFound('Session not found');
  res.json({ success: true, message: 'Session deleted' });
});
