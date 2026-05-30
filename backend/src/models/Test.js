import mongoose from 'mongoose';
import { MARK_TYPES, EXAM_TYPES } from '../config/constants.js';

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: Object.values(MARK_TYPES), required: true },
  maxMarks: { type: Number, default: 100 },
  passMarks: { type: Number, default: 33 },
});

const testSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicSession',
      required: true,
      index: true,
    },
    testName: { type: String, required: true, trim: true },
    class: { type: String, required: true, index: true },
    examType: { type: String, enum: EXAM_TYPES, default: 'Other' },
    subjects: { type: [subjectSchema], validate: [(v) => v.length > 0, 'At least one subject required'] },
    isPublished: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

testSchema.index({ sessionId: 1, class: 1, testName: 1 });

const Test = mongoose.model('Test', testSchema);
export default Test;
