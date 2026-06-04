import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';
import { logActivity } from '../services/activityService.js';
import { ACTIVITY_TYPES } from '../config/constants.js';

/**
 * Save / update attendance for a class on a specific date.
 * Body: { class, section?, date, subject?, records: [{ studentId, status, remarks }] }
 */
export const saveAttendance = asyncHandler(async (req, res) => {
  const { class: className, section = 'A', date, subject = '', records } = req.body;

  if (!className || !date || !Array.isArray(records) || records.length === 0) {
    throw ApiError.badRequest('Class, date and records are required');
  }

  const attendanceDate = new Date(date);
  attendanceDate.setHours(0, 0, 0, 0);

  const attendance = await Attendance.findOneAndUpdate(
    {
      sessionId: req.sessionId,
      class: className,
      section,
      date: attendanceDate,
      subject,
    },
    {
      sessionId: req.sessionId,
      class: className,
      section,
      date: attendanceDate,
      subject,
      takenBy: req.user._id,
      records: records.map((r) => ({
        studentId: r.studentId,
        status: r.status || 'present',
        remarks: r.remarks || '',
      })),
    },
    { new: true, upsert: true, runValidators: true }
  );

  await logActivity({
    userId: req.user._id,
    sessionId: req.sessionId,
    action: ACTIVITY_TYPES.UPDATE,
    module: 'attendance',
    description: `Saved attendance for class ${className}-${section} on ${attendanceDate.toDateString()}`,
    metadata: { attendanceId: attendance._id, count: records.length },
  });

  res.json({ success: true, data: attendance, message: 'Attendance saved successfully' });
});

/**
 * Get attendance for a class on a specific date.
 * Query: ?class=10&section=A&date=2026-06-03&subject=
 */
export const getAttendance = asyncHandler(async (req, res) => {
  const { class: className, section = 'A', date, subject = '' } = req.query;

  if (!className || !date) {
    throw ApiError.badRequest('Class and date are required');
  }

  const attendanceDate = new Date(date);
  attendanceDate.setHours(0, 0, 0, 0);

  const attendance = await Attendance.findOne({
    sessionId: req.sessionId,
    class: className,
    section,
    date: attendanceDate,
    subject,
  }).populate('records.studentId', 'name rollNo photo');

  // Also get the student list for the class so the frontend can show all students
  const students = await Student.find({
    sessionId: req.sessionId,
    class: className,
    section,
    isActive: true,
  })
    .select('name rollNo photo')
    .sort({ rollNo: 1 });

  res.json({
    success: true,
    data: {
      attendance: attendance || null,
      students,
    },
  });
});

/**
 * Get attendance records for a specific student.
 * Params: studentId
 * Query: ?class=10&month=2026-06 (optional filters)
 */
export const getStudentAttendance = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { month } = req.query;

  const student = await Student.findOne({
    _id: studentId,
    sessionId: req.sessionId,
    isActive: true,
  }).select('name rollNo class section photo');

  if (!student) throw ApiError.notFound('Student not found');

  // Build date filter if month is provided (e.g. "2026-06")
  const dateFilter = {};
  if (month) {
    const [year, mon] = month.split('-').map(Number);
    dateFilter.date = {
      $gte: new Date(year, mon - 1, 1),
      $lt: new Date(year, mon, 1),
    };
  }

  // Find all attendance docs that contain this student's record
  const attendanceDocs = await Attendance.find({
    sessionId: req.sessionId,
    class: student.class,
    section: student.section || 'A',
    'records.studentId': studentId,
    ...dateFilter,
  }).sort({ date: -1 });

  // Extract just this student's record from each doc
  const records = attendanceDocs.map((doc) => {
    const record = doc.records.find(
      (r) => r.studentId.toString() === studentId
    );
    return {
      date: doc.date,
      subject: doc.subject,
      status: record?.status || 'absent',
      remarks: record?.remarks || '',
    };
  });

  // Calculate summary stats
  const total = records.length;
  const present = records.filter((r) => r.status === 'present').length;
  const absent = records.filter((r) => r.status === 'absent').length;
  const late = records.filter((r) => r.status === 'late').length;
  const excused = records.filter((r) => r.status === 'excused').length;

  res.json({
    success: true,
    data: {
      student,
      records,
      summary: {
        total,
        present,
        absent,
        late,
        excused,
        percentage: total > 0 ? Math.round((present / total) * 100) : 0,
      },
    },
  });
});
