import mongoose from 'mongoose';

const tableColumnSchema = new mongoose.Schema({
  key: String,
  label: String,
  visible: { type: Boolean, default: true },
  isTotal: { type: Boolean, default: false },
  isPercentage: { type: Boolean, default: false },
});

const reportTableSchema = new mongoose.Schema({
  title: { type: String, required: true },
  testIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Test' }],
  showTotal: { type: Boolean, default: true },
  showPercentage: { type: Boolean, default: true },
  showGrade: { type: Boolean, default: true },
  columns: [tableColumnSchema],
  order: { type: Number, default: 0 },
});

const reportTemplateSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicSession',
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    schoolHeader: {
      schoolName: { type: String, default: 'School Name' },
      address: { type: String, default: '' },
      contact: { type: String, default: '' },
      logo: { type: String, default: '' },
      principalSignature: { type: String, default: '' },
      teacherSignature: { type: String, default: '' },
    },
    studentInfoLabels: { type: Map, of: String, default: {} },
    tables: [reportTableSchema],
    sections: [{
      id: String,
      type: { type: String, enum: ['header', 'studentInfo', 'table', 'attendance', 'coCurricular', 'remarks', 'footer'] },
      visible: { type: Boolean, default: true },
      order: { type: Number, default: 0 },
      content: { type: mongoose.Schema.Types.Mixed },
    }],
    attendance: {
      enabled: { type: Boolean, default: false },
      totalDays: { type: Number, default: 0 },
      presentDays: { type: Number, default: 0 },
    },
    coCurricular: {
      enabled: { type: Boolean, default: false },
      activities: [{ name: String, grade: String }],
    },
    footer: { type: String, default: '' },
    remarks: { type: String, default: '' },
    isDefault: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

reportTemplateSchema.index({ sessionId: 1, name: 1 });

const ReportTemplate = mongoose.model('ReportTemplate', reportTemplateSchema);
export default ReportTemplate;
