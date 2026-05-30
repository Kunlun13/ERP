import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import Mark from '../models/Mark.js';
import Student from '../models/Student.js';
import Test from '../models/Test.js';
import {
  computeMarkTotals,
  validateAndClampMarks,
  formatMarkEntry,
} from '../services/markService.js';
import { logActivity } from '../services/activityService.js';
import { ACTIVITY_TYPES } from '../config/constants.js';

export const getMarksByTest = asyncHandler(async (req, res) => {
  const { testId, class: className, studentId } = req.query;

  const test = await Test.findOne({ _id: testId, sessionId: req.sessionId });
  if (!test) throw ApiError.notFound('Test not found');

  let students;
  if (studentId) {
    const student = await Student.findOne({
      _id: studentId,
      sessionId: req.sessionId,
      isActive: true,
    });
    if (!student) throw ApiError.notFound('Student not found');
    students = [student];
  } else {
    students = await Student.find({
      sessionId: req.sessionId,
      class: className || test.class,
      isActive: true,
    }).sort('rollNo');
  }

  const marks = await Mark.find({ sessionId: req.sessionId, testId });
  const markMap = new Map(marks.map((m) => [m.studentId.toString(), m]));

  const entries = students.map((student) => {
    const rawMark = markMap.get(student._id.toString());
    const formattedMark = formatMarkEntry(rawMark, test.subjects);

    return {
      student,
      mark: formattedMark,
      hasExisting: Boolean(rawMark),
    };
  });

  res.json({ success: true, data: { test, entries } });
});

export const getMarksByStudent = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  const student = await Student.findOne({
    _id: studentId,
    sessionId: req.sessionId,
    isActive: true,
  });
  if (!student) throw ApiError.notFound('Student not found');

  const marks = await Mark.find({ sessionId: req.sessionId, studentId }).populate(
    'testId',
    'testName class examType subjects'
  );

  const formatted = marks
    .filter((m) => m.testId)
    .map((m) => ({
      ...m.toObject(),
      subjects: formatMarkEntry(m, m.testId.subjects)?.subjects ?? [],
      hasExisting: true,
    }));

  res.json({ success: true, data: formatted });
});

export const saveMarks = asyncHandler(async (req, res) => {
  const { testId, studentId, subjects, remarks } = req.body;

  const student = await Student.findOne({
    _id: studentId,
    sessionId: req.sessionId,
    isActive: true,
  });
  if (!student) throw ApiError.notFound('Student not found');

  const test = await Test.findOne({ _id: testId, sessionId: req.sessionId });
  if (!test) throw ApiError.notFound('Test not found');

  validateAndClampMarks(subjects, test.subjects);
  const computed = computeMarkTotals(subjects, test.subjects);

  const mark = await Mark.findOneAndUpdate(
    { sessionId: req.sessionId, testId, studentId },
    {
      sessionId: req.sessionId,
      testId,
      studentId,
      subjects: computed.subjects,
      totalObtained: computed.totalObtained,
      totalMax: computed.totalMax,
      percentage: computed.percentage,
      remarks,
      enteredBy: req.user._id,
    },
    { new: true, upsert: true, runValidators: true }
  );

  res.json({
    success: true,
    data: formatMarkEntry(mark, test.subjects),
    message: 'Marks saved successfully',
  });
});

export const bulkSaveMarks = asyncHandler(async (req, res) => {
  const { testId, entries } = req.body;

  const test = await Test.findOne({ _id: testId, sessionId: req.sessionId });
  if (!test) throw ApiError.notFound('Test not found');

  const results = [];
  for (const entry of entries) {
    const student = await Student.findOne({
      _id: entry.studentId,
      sessionId: req.sessionId,
      isActive: true,
    });
    if (!student) continue;

    validateAndClampMarks(entry.subjects, test.subjects);
    const computed = computeMarkTotals(entry.subjects, test.subjects);
    const mark = await Mark.findOneAndUpdate(
      { sessionId: req.sessionId, testId, studentId: entry.studentId },
      {
        sessionId: req.sessionId,
        testId,
        studentId: entry.studentId,
        subjects: computed.subjects,
        totalObtained: computed.totalObtained,
        totalMax: computed.totalMax,
        percentage: computed.percentage,
        remarks: entry.remarks || '',
        enteredBy: req.user._id,
      },
      { new: true, upsert: true }
    );
    results.push(formatMarkEntry(mark, test.subjects));
  }

  await logActivity({
    userId: req.user._id,
    sessionId: req.sessionId,
    action: ACTIVITY_TYPES.UPDATE,
    module: 'marks',
    description: `Bulk saved marks for ${test.testName}`,
    metadata: { testId, count: results.length },
  });

  res.json({ success: true, data: results });
});
