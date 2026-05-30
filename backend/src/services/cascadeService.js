import Mark from '../models/Mark.js';
import Student from '../models/Student.js';

/**
 * Remove all marks and related data when a student is deleted.
 */
export const cascadeDeleteStudent = async (sessionId, studentId) => {
  const markResult = await Mark.deleteMany({ sessionId, studentId });
  return { marksDeleted: markResult.deletedCount };
};

/**
 * Remove all marks when a test is deleted.
 */
export const cascadeDeleteTest = async (sessionId, testId) => {
  const markResult = await Mark.deleteMany({ sessionId, testId });
  return { marksDeleted: markResult.deletedCount };
};

/**
 * Clean up orphan marks (deleted students or missing tests).
 */
export const cleanupOrphanMarks = async (sessionId) => {
  const activeStudents = await Student.find({ sessionId, isActive: true }).select('_id');
  const activeIds = activeStudents.map((s) => s._id);

  const result = await Mark.deleteMany({
    sessionId,
    studentId: { $nin: activeIds },
  });

  return { marksDeleted: result.deletedCount };
};
