import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Student from '../models/Student.js';
import { cascadeDeleteStudent } from '../services/cascadeService.js';

dotenv.config();

/**
 * One-time cleanup: hard-delete all inactive students and their orphan marks.
 * Run: node src/utils/cleanupInactiveStudents.js
 */
const cleanup = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const inactive = await Student.find({ isActive: false });

  let marksRemoved = 0;
  for (const student of inactive) {
    const { marksDeleted } = await cascadeDeleteStudent(student.sessionId, student._id);
    marksRemoved += marksDeleted;
    await Student.findByIdAndDelete(student._id);
  }

  console.log(`Removed ${inactive.length} inactive student(s), ${marksRemoved} mark record(s)`);
  process.exit(0);
};

cleanup().catch((err) => {
  console.error(err);
  process.exit(1);
});
