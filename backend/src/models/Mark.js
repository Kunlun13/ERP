import mongoose from 'mongoose';

const subjectMarkSchema = new mongoose.Schema({
  subjectName: { type: String, required: true },
  type: { type: String, enum: ['marks', 'grade'], required: true },
  marks: { type: Number },
  maxMarks: { type: Number },
  grade: { type: String },
  isAbsent: { type: Boolean, default: false },
});

const markSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicSession',
      required: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test',
      required: true,
      index: true,
    },
    subjects: [subjectMarkSchema],
    totalObtained: { type: Number, default: 0 },
    totalMax: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    remarks: { type: String, default: '' },
    enteredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

markSchema.index({ sessionId: 1, studentId: 1, testId: 1 }, { unique: true });

const Mark = mongoose.model('Mark', markSchema);
export default Mark;
