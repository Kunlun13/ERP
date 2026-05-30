import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import AcademicSession from '../models/AcademicSession.js';

/**
 * Ensures sessionId is present and valid for session-scoped operations.
 * Reads from header X-Session-Id or query/body sessionId.
 */
export const requireSession = asyncHandler(async (req, res, next) => {
  const sessionId =
    req.headers['x-session-id'] ||
    req.query.sessionId ||
    req.body.sessionId;

  if (!sessionId) {
    throw ApiError.badRequest('Academic session is required. Please select a session.');
  }

  const session = await AcademicSession.findById(sessionId);
  if (!session) {
    throw ApiError.notFound('Academic session not found');
  }

  req.sessionId = sessionId;
  req.academicSession = session;
  next();
});
