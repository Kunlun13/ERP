import mongoose from 'mongoose';

const attendanceRecordSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'excused'],
      required: true,
      default: 'present',
    },
    remarks: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const attendanceSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicSession',
      required: true,
      index: true,
    },
    class: { type: String, required: true, trim: true, index: true },
    section: { type: String, trim: true, default: 'A' },
    date: { type: Date, required: true, index: true },
    subject: { type: String, trim: true, default: '' },
    takenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    records: [attendanceRecordSchema],
  },
  { timestamps: true }
);

// One attendance record per class/section/date/subject per session
attendanceSchema.index(
  { sessionId: 1, class: 1, section: 1, date: 1, subject: 1 },
  { unique: true }
);

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
