import mongoose from 'mongoose';
import { FIELD_TYPES } from '../config/constants.js';

const fieldSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, enum: FIELD_TYPES, required: true },
    required: { type: Boolean, default: false },
    options: [{ type: String }],
    order: { type: Number, default: 0 },
    placeholder: { type: String, default: '' },
  },
  { _id: true }
);

const studentFieldTemplateSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicSession',
      required: true,
      index: true,
    },
    fields: [fieldSchema],
    version: { type: Number, default: 1 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

studentFieldTemplateSchema.index({ sessionId: 1 }, { unique: true });

const StudentFieldTemplate = mongoose.model('StudentFieldTemplate', studentFieldTemplateSchema);
export default StudentFieldTemplate;
