import mongoose from 'mongoose';

const studentDocumentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicSession',
      required: true,
      index: true,
    },
    documentType: {
      type: String,
      enum: [
        'Aadhar Card',
        'Birth Certificate',
        'Medical Report',
        'ID Proof',
        'Transfer Certificate',
        'Passport',
        'Vaccination Certificate',
        'Other',
      ],
      required: true,
    },
    title: { type: String, trim: true },
    filePath: { type: String, required: true },
    fileName: { type: String, required: true },
    fileSize: { type: Number },
    mimeType: { type: String },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Index for efficient queries
studentDocumentSchema.index({ studentId: 1, sessionId: 1 });
studentDocumentSchema.index({ sessionId: 1 });

const StudentDocument = mongoose.model('StudentDocument', studentDocumentSchema);
export default StudentDocument;
