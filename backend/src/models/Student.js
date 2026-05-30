import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicSession',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    rollNo: { type: String, required: true, trim: true },
    class: { type: String, required: true, index: true },
    section: { type: String, default: 'A', trim: true },
    fatherName: { type: String, trim: true },
    motherName: { type: String, trim: true },
    mobileNo: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: { type: String, trim: true },
    bloodGroup: { type: String, trim: true },
    dob: { type: Date },
    gender: { type: String, enum: ['Male', 'Female', 'Other', ''], default: '' },
    photo: { type: String, default: '' },
    customFields: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Unique roll no per class/session only among active students (allows reuse after delete)
studentSchema.index(
  { sessionId: 1, class: 1, rollNo: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
);
studentSchema.index({ sessionId: 1, name: 'text', rollNo: 'text' });

const Student = mongoose.model('Student', studentSchema);
export default Student;
