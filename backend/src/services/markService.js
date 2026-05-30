import { calculatePercentage } from '../utils/gradeCalculator.js';
import ApiError from '../utils/ApiError.js';

/**
 * Merge saved mark subjects with current test subjects (handles test edits & ensures pre-fill).
 */
export const mergeMarkWithTestSubjects = (savedSubjects = [], testSubjects = []) => {
  return testSubjects.map((ts) => {
    const saved = savedSubjects.find(
      (s) => s.subjectName === ts.name || s.subjectName === ts.subjectName
    );

    if (!saved) {
      return {
        subjectName: ts.name,
        type: ts.type,
        marks: '',
        grade: '',
        isAbsent: false,
        maxMarks: ts.maxMarks,
      };
    }

    return {
      subjectName: ts.name,
      type: ts.type,
      marks: saved.isAbsent
        ? ''
        : saved.marks !== undefined && saved.marks !== null
          ? saved.marks
          : '',
      grade: saved.grade || '',
      isAbsent: Boolean(saved.isAbsent),
      maxMarks: ts.maxMarks,
    };
  });
};

export const formatMarkEntry = (mark, testSubjects) => {
  if (!mark) return null;

  return {
    _id: mark._id,
    subjects: mergeMarkWithTestSubjects(mark.subjects, testSubjects),
    remarks: mark.remarks || '',
    totalObtained: mark.totalObtained,
    totalMax: mark.totalMax,
    percentage: mark.percentage,
    updatedAt: mark.updatedAt,
  };
};

export const validateAndClampMarks = (subjects, testSubjects) => {
  const errors = [];

  subjects.forEach((sub) => {
    const testSub = testSubjects.find((t) => t.name === sub.subjectName);
    if (!testSub || testSub.type !== 'marks' || sub.isAbsent) return;

    const maxMarks = testSub.maxMarks || 100;
    const marks = Number(sub.marks);

    if (sub.marks !== '' && sub.marks != null && !Number.isNaN(marks)) {
      if (marks < 0) {
        errors.push(`${sub.subjectName}: marks cannot be negative`);
      } else if (marks > maxMarks) {
        errors.push(`${sub.subjectName}: marks cannot exceed ${maxMarks}`);
      }
    }
  });

  if (errors.length > 0) {
    throw ApiError.badRequest('Invalid marks', errors);
  }
};

export const computeMarkTotals = (subjects, testSubjects) => {
  let totalObtained = 0;
  let totalMax = 0;

  const computedSubjects = subjects.map((sub) => {
    const testSub = testSubjects.find((t) => t.name === sub.subjectName);
    if (!testSub) return sub;

    if (sub.isAbsent) {
      return { ...sub, marks: null, grade: 'AB' };
    }

    if (testSub.type === 'marks') {
      const maxMarks = testSub.maxMarks || 100;
      let marks = Number(sub.marks) || 0;
      if (marks < 0) marks = 0;
      if (marks > maxMarks) marks = maxMarks;

      totalObtained += marks;
      totalMax += maxMarks;
      return { ...sub, type: 'marks', maxMarks, marks };
    }

    return { ...sub, type: 'grade', grade: sub.grade || '' };
  });

  const percentage = calculatePercentage(totalObtained, totalMax);

  return {
    subjects: computedSubjects,
    totalObtained,
    totalMax,
    percentage,
  };
};
