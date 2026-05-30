import ActivityLog from '../models/ActivityLog.js';

export const logActivity = async ({
  userId,
  sessionId,
  action,
  module,
  description,
  metadata = {},
  ipAddress,
}) => {
  try {
    await ActivityLog.create({
      userId,
      sessionId,
      action,
      module,
      description,
      metadata,
      ipAddress,
    });
  } catch (err) {
    console.error('Activity log failed:', err.message);
  }
};
