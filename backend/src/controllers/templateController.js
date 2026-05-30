import asyncHandler from '../utils/asyncHandler.js';
import StudentFieldTemplate from '../models/StudentFieldTemplate.js';
import { logActivity } from '../services/activityService.js';
import { ACTIVITY_TYPES } from '../config/constants.js';

export const getTemplate = asyncHandler(async (req, res) => {
  let template = await StudentFieldTemplate.findOne({ sessionId: req.sessionId });

  if (!template) {
    template = await StudentFieldTemplate.create({
      sessionId: req.sessionId,
      fields: [
        { key: 'name', label: 'Student Name', type: 'text', required: true, order: 0 },
        { key: 'fatherName', label: "Father's Name", type: 'text', required: true, order: 1 },
        { key: 'motherName', label: "Mother's Name", type: 'text', required: false, order: 2 },
        { key: 'mobileNo', label: 'Mobile No', type: 'text', required: true, order: 3 },
        { key: 'email', label: 'Email', type: 'email', required: false, order: 4 },
        { key: 'address', label: 'Address', type: 'textarea', required: false, order: 5 },
        { key: 'dob', label: 'Date of Birth', type: 'date', required: false, order: 6 },
        { key: 'gender', label: 'Gender', type: 'dropdown', options: ['Male', 'Female', 'Other'], required: false, order: 7 },
        { key: 'bloodGroup', label: 'Blood Group', type: 'dropdown', options: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'], required: false, order: 8 },
        { key: 'photo', label: 'Photo', type: 'image', required: false, order: 9 },
      ],
      createdBy: req.user._id,
    });
  }

  res.json({ success: true, data: template });
});

export const saveTemplate = asyncHandler(async (req, res) => {
  const { fields } = req.body;

  const template = await StudentFieldTemplate.findOneAndUpdate(
    { sessionId: req.sessionId },
    { fields, updatedBy: req.user._id, $inc: { version: 1 } },
    { new: true, upsert: true, runValidators: true }
  );

  await logActivity({
    userId: req.user._id,
    sessionId: req.sessionId,
    action: ACTIVITY_TYPES.UPDATE,
    module: 'studentTemplate',
    description: 'Updated student field template',
  });

  res.json({ success: true, data: template });
});
