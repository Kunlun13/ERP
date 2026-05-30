import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ReportTemplate from '../models/ReportTemplate.js';
import Mark from '../models/Mark.js';
import Student from '../models/Student.js';
import Test from '../models/Test.js';
import SchoolSettings from '../models/SchoolSettings.js';
import AcademicSession from '../models/AcademicSession.js';
import {
  buildFullReportPayload,
  toObjectIds,
} from '../services/reportService.js';

export const getTemplates = asyncHandler(async (req, res) => {
  const templates = await ReportTemplate.find({ sessionId: req.sessionId }).sort({ createdAt: -1 });
  res.json({ success: true, data: templates });
});

export const getTemplate = asyncHandler(async (req, res) => {
  const template = await ReportTemplate.findOne({ _id: req.params.id, sessionId: req.sessionId });
  if (!template) throw ApiError.notFound('Template not found');
  res.json({ success: true, data: template });
});

export const saveTemplate = asyncHandler(async (req, res) => {
  const template = await ReportTemplate.findOneAndUpdate(
    { _id: req.params.id, sessionId: req.sessionId },
    { ...req.body, createdBy: req.user._id },
    { new: true, upsert: !req.params.id || req.params.id === 'new', runValidators: true }
  );
  res.json({ success: true, data: template });
});

export const createTemplate = asyncHandler(async (req, res) => {
  const template = await ReportTemplate.create({
    ...req.body,
    sessionId: req.sessionId,
    createdBy: req.user._id,
  });
  res.status(201).json({ success: true, data: template });
});

export const deleteTemplate = asyncHandler(async (req, res) => {
  await ReportTemplate.findOneAndDelete({ _id: req.params.id, sessionId: req.sessionId });
  res.json({ success: true, message: 'Template deleted' });
});

export const generateReport = asyncHandler(async (req, res) => {
  const { studentId, testIds, templateId, customConfig } = req.body;

  if (!testIds?.length) {
    throw ApiError.badRequest('Select at least one test');
  }

  const student = await Student.findOne({
    _id: studentId,
    sessionId: req.sessionId,
    isActive: true,
  }).lean();

  if (!student) throw ApiError.notFound('Student not found');

  let template = null;
  if (templateId) {
    template = await ReportTemplate.findOne({ _id: templateId, sessionId: req.sessionId });
  }

  const config = customConfig || template || {};
  const testObjectIds = toObjectIds(testIds);

  const [tests, marks, schoolSettings, academicSession] = await Promise.all([
    Test.find({ _id: { $in: testObjectIds }, sessionId: req.sessionId }).sort({ testName: 1 }).lean(),
    Mark.find({ sessionId: req.sessionId, studentId, testId: { $in: testObjectIds } }).lean(),
    SchoolSettings.findOne({ sessionId: req.sessionId }).lean(),
    AcademicSession.findById(req.sessionId).lean(),
  ]);

  if (!tests.length) {
    throw ApiError.badRequest('No valid tests found for this session');
  }

  const reportData = buildFullReportPayload({
    student,
    schoolSettings,
    academicSession,
    tests,
    marks,
    config: {
      ...config,
      schoolHeader: {
        schoolName: schoolSettings?.schoolName,
        address: schoolSettings?.address,
        contact: schoolSettings?.contact,
        logo: schoolSettings?.logo,
        ...config.schoolHeader,
      },
      attendance: config.attendance,
      remarks: config.remarks || template?.remarks,
      footer: config.footer,
    },
  });

  res.json({
    success: true,
    data: {
      ...reportData,
      schoolHeader: reportData.school,
      hasMarksData: marks.length > 0,
    },
  });
});
