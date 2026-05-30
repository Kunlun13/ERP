import mongoose from 'mongoose';

const schoolSettingsSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicSession',
      required: true,
      unique: true,
      index: true,
    },
    schoolName: { type: String, default: 'My School' },
    address: { type: String, default: '' },
    contact: { type: String, default: '' },
    email: { type: String, default: '' },
    logo: { type: String, default: '' },
    principalName: { type: String, default: '' },
    passPercentage: { type: Number, default: 33 },
    classes: [{ type: String }],
    sections: [{ type: String }],
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'light' },
    // Future-ready fields
    feeManagementEnabled: { type: Boolean, default: false },
    attendanceEnabled: { type: Boolean, default: true },
    notificationsEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const SchoolSettings = mongoose.model('SchoolSettings', schoolSettingsSchema);
export default SchoolSettings;
