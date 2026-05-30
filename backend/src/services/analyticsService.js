import Mark from '../models/Mark.js';
import Student from '../models/Student.js';
import Test from '../models/Test.js';
import { percentageToGrade, isPassing } from '../utils/gradeCalculator.js';

export const getClassAnalysis = async (sessionId, className, testId) => {
  const test = await Test.findOne({ _id: testId, sessionId, class: className });
  if (!test) return null;

  const students = await Student.find({ sessionId, class: className, isActive: true }).sort('rollNo');
  const marks = await Mark.find({ sessionId, testId });

  const markMap = new Map(marks.map((m) => [m.studentId.toString(), m]));

  const results = students.map((student) => {
    const mark = markMap.get(student._id.toString());
    return {
      studentId: student._id,
      name: student.name,
      rollNo: student.rollNo,
      totalObtained: mark?.totalObtained ?? 0,
      totalMax: mark?.totalMax ?? 0,
      percentage: mark?.percentage ?? 0,
      grade: percentageToGrade(mark?.percentage ?? 0),
      passed: isPassing(mark?.percentage ?? 0),
      subjects: mark?.subjects ?? [],
    };
  });

  results.sort((a, b) => b.percentage - a.percentage);
  results.forEach((r, i) => { r.rank = i + 1; });

  const validResults = results.filter((r) => r.totalMax > 0);
  const avgPercentage =
    validResults.length > 0
      ? Math.round(validResults.reduce((s, r) => s + r.percentage, 0) / validResults.length * 100) / 100
      : 0;

  const subjectToppers = {};
  test.subjects.forEach((sub) => {
    if (sub.type !== 'marks') return;
    let top = { name: '-', marks: 0 };
    results.forEach((r) => {
      const subMark = r.subjects.find((s) => s.subjectName === sub.name);
      if (subMark && !subMark.isAbsent && (subMark.marks ?? 0) > top.marks) {
        top = { name: r.name, marks: subMark.marks };
      }
    });
    subjectToppers[sub.name] = top;
  });

  return {
    test,
    students: results,
    stats: {
      totalStudents: students.length,
      appeared: validResults.length,
      passed: validResults.filter((r) => r.passed).length,
      failed: validResults.filter((r) => !r.passed).length,
      highest: validResults[0] || null,
      average: avgPercentage,
      subjectToppers,
    },
  };
};

export const getStudentAnalysis = async (sessionId, studentId) => {
  const student = await Student.findOne({ _id: studentId, sessionId, isActive: true });
  if (!student) return null;

  const marks = await Mark.find({ sessionId, studentId }).populate('testId', 'testName class examType subjects');
  const testPerformance = marks.map((m) => ({
    testId: m.testId?._id,
    testName: m.testId?.testName,
    examType: m.testId?.examType,
    totalObtained: m.totalObtained,
    totalMax: m.totalMax,
    percentage: m.percentage,
    grade: percentageToGrade(m.percentage),
    subjects: m.subjects,
    createdAt: m.updatedAt,
  }));

  testPerformance.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  return { student, testPerformance };
};
