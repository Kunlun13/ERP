import mongoose from 'mongoose';

const academicSessionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    startYear: { type: Number, required: true },
    endYear: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

academicSessionSchema.index({ isActive: 1 });

const AcademicSession = mongoose.model('AcademicSession', academicSessionSchema);
export default AcademicSession;
