import mongoose from 'mongoose';
import { isPassing } from '../utils/gradeCalculator.js';

export const toIdString = (id) => {
  if (!id) return '';
  if (typeof id === 'object' && typeof id.toString === 'function') return id.toString();
  return String(id);
};

const normalizeType = (type) => (type || '').toString().toLowerCase().trim();

export const findSavedSubject = (mark, subjectName) => {
  if (!mark?.subjects?.length) return null;
  const target = (subjectName || '').trim().toLowerCase();
  return mark.subjects.find((s) => {
    const name = (s.subjectName || s.name || '').trim().toLowerCase();
    return name === target;
  });
};

export const buildMarkMap = (marks) => {
  const map = new Map();
  marks.forEach((m) => map.set(toIdString(m.testId), m));
  return map;
};

const getMarkForTest = (markMap, testId) => markMap.get(toIdString(testId)) || null;

const formatMarksValue = (subMark) => {
  if (!subMark) return '';
  if (subMark.isAbsent) return 'AB';
  if (subMark.marks !== undefined && subMark.marks !== null && subMark.marks !== '') {
    return Number(subMark.marks);
  }
  return '';
};

const formatGradeValue = (subMark) => {
  if (!subMark) return '';
  if (subMark.isAbsent) return 'AB';
  return subMark.grade || '';
};

const normalizeExamType = (examType) =>
  (examType || '').toString().trim().toUpperCase().replace(/\s+/g, '_');

const MARKS_EXAM_TYPES = new Set([
  'MARKS',
  'MARK',
  'MARK_BASED',
  'MARK-BASED',
  'MARKBASED',
]);

const GRADE_EXAM_TYPES = new Set([
  'GRADE',
  'GRADES',
  'GRADE_BASED',
  'GRADE-BASED',
  'GRADEBASED',
]);

const isMarksExamType = (et) => MARKS_EXAM_TYPES.has(et);
const isGradeExamType = (et) => GRADE_EXAM_TYPES.has(et);

/** Fallback when examType is not MARKS/GRADE (legacy tests) */
export const inferTestType = (test) => {
  const subs = test.subjects || [];
  if (!subs.length) return 'MARKS';
  const allMarks = subs.every((s) => normalizeType(s.type) === 'marks');
  const allGrade = subs.every((s) => normalizeType(s.type) === 'grade');
  if (allMarks) return 'MARKS';
  if (allGrade) return 'GRADE';
  return 'MIXED';
};

export const classifyMarksTests = (tests) =>
  tests.filter((t) => {
    const et = normalizeExamType(t.examType);
    const tt = normalizeExamType(t.type || t.testType);
    if (isMarksExamType(et) || isMarksExamType(tt)) return true;
    if (isGradeExamType(et) && !isMarksExamType(tt)) {
      return (t.subjects || []).some((s) => normalizeType(s.type) === 'marks');
    }
    const type = inferTestType(t);
    return type === 'MARKS' || type === 'MIXED';
  });

export const classifyGradeTests = (tests) =>
  tests.filter((t) => {
    const et = normalizeExamType(t.examType);
    const tt = normalizeExamType(t.type || t.testType);
    if (isGradeExamType(et) || isGradeExamType(tt)) return true;
    if (isMarksExamType(et) && !isGradeExamType(tt)) {
      return (t.subjects || []).some((s) => normalizeType(s.type) === 'grade');
    }
    const type = inferTestType(t);
    return type === 'GRADE' || type === 'MIXED';
  });

const buildMarksMatrixTable = (marksTests, markMap) => {
  const testColumns = marksTests.map((test, index) => {
    const label =
      normalizeExamType(test.examType) === 'MARKS' && test.testName
        ? test.testName.trim()
        : `M${index + 1}`;
    return {
      testId: toIdString(test._id),
      testName: test.testName,
      testNumber: index + 1,
      columnLabel: label,
      examType: test.examType || '',
      type: 'MARKS',
    };
  });

  const subjectNamesSet = new Set();
  marksTests.forEach((test) => {
    (test.subjects || []).forEach((sub) => {
      if (normalizeType(sub.type) === 'marks') subjectNamesSet.add(sub.name);
    });
  });

  const subjectWiseMarks = {};
  const subjectRows = [...subjectNamesSet].map((subjectName) => {
    const cells = {};
    const byTest = {};
    let totalObtained = 0;

    testColumns.forEach((col) => {
      const test = marksTests.find((t) => toIdString(t._id) === col.testId);
      const testSub = (test?.subjects || []).find(
        (s) => s.name === subjectName && normalizeType(s.type) === 'marks'
      );

      if (!testSub) {
        cells[col.testId] = { obtained: '', display: '-', max: 0 };
        byTest[col.columnLabel] = '-';
        return;
      }

      const mark = getMarkForTest(markMap, col.testId);
      const subMark = findSavedSubject(mark, subjectName);
      const obtained = formatMarksValue(subMark);
      const max = testSub.maxMarks ?? 100;

      cells[col.testId] = { obtained, display: obtained === '' ? '-' : obtained, max };
      byTest[col.columnLabel] = obtained === '' ? '-' : obtained;

      if (obtained !== '' && obtained !== 'AB') {
        totalObtained += Number(obtained) || 0;
      }
    });

    subjectWiseMarks[subjectName] = { ...byTest, total: totalObtained };

    return {
      subjectName,
      cells,
      totalMarks: totalObtained,
    };
  });

  const columnTotals = {};
  testColumns.forEach((col) => {
    columnTotals[col.columnLabel] = subjectRows.reduce((sum, row) => {
      const cell = row.cells[col.testId];
      const v = cell?.obtained;
      if (v === '' || v === 'AB' || v == null) return sum;
      return sum + (Number(v) || 0);
    }, 0);
  });

  const grandTotal = subjectRows.reduce((s, r) => s + (r.totalMarks || 0), 0);
  let grandMax = 0;
  marksTests.forEach((test) => {
    const mark = getMarkForTest(markMap, test._id);
    (test.subjects || [])
      .filter((s) => normalizeType(s.type) === 'marks')
      .forEach((sub) => {
        const subMark = findSavedSubject(mark, sub.name);
        if (subMark && !subMark.isAbsent && subMark.marks != null && subMark.marks !== '') {
          grandMax += sub.maxMarks ?? 100;
        }
      });
  });
  if (grandMax === 0) {
    subjectRows.forEach((row) => {
      testColumns.forEach((col) => {
        const cell = row.cells[col.testId];
        if (cell?.obtained !== '' && cell?.obtained !== 'AB') {
          grandMax += cell.max || 100;
        }
      });
    });
  }

  const grandPercentage =
    grandMax > 0 ? Math.round((grandTotal / grandMax) * 10000) / 100 : 0;

  return {
    tableType: 'marks',
    testColumns,
    subjectRows,
    subjectWiseMarks,
    columnTotals,
    grandTotal,
    grandMax,
    grandPercentage,
  };
};

const buildMarksSection = (marksTable, passPercentage = 33) => {
  if (!marksTable) return null;
  const passMark = passPercentage ?? 33;
  const overallResult = isPassing(marksTable.grandPercentage, passMark) ? 'PASS' : 'FAIL';

  return {
    columns: marksTable.testColumns.map((c) => ({
      testId: c.testId,
      code: c.columnLabel,
      header: c.columnLabel,
    })),
    rows: marksTable.subjectRows.map((row) => ({
      subject: row.subjectName,
      marks: marksTable.testColumns.map((col) => {
        const cell = row.cells[col.testId];
        const v = cell?.display ?? cell?.obtained;
        if (v === '' || v == null) return '-';
        return String(v);
      }),
      total: row.totalMarks ?? 0,
    })),
    footer: {
      grandTotal: marksTable.grandTotal ?? 0,
      percentage: marksTable.grandPercentage ?? 0,
      overallResult,
    },
  };
};

const buildGradeSection = (gradeTable) => {
  if (!gradeTable) return null;
  return {
    columns: gradeTable.testColumns.map((c) => ({
      testId: c.testId,
      code: c.columnLabel,
      header: c.columnLabel,
    })),
    rows: gradeTable.subjectRows.map((row) => ({
      subject: row.subjectName,
      grades: gradeTable.testColumns.map((col) => {
        const cell = row.cells[col.testId];
        const v = cell?.display ?? cell?.grade;
        if (v === '' || v == null) return '-';
        return String(v);
      }),
    })),
  };
};

const buildGradeMatrixTable = (gradeTests, markMap) => {
  const testColumns = gradeTests.map((test, index) => {
    const label =
      normalizeExamType(test.examType) === 'GRADE' && test.testName
        ? test.testName.trim()
        : `G${index + 1}`;
    return {
      testId: toIdString(test._id),
      testName: test.testName,
      testNumber: index + 1,
      columnLabel: label,
      examType: test.examType || '',
      type: 'GRADE',
    };
  });

  const subjectNamesSet = new Set();
  gradeTests.forEach((test) => {
    (test.subjects || []).forEach((sub) => {
      if (normalizeType(sub.type) === 'grade') subjectNamesSet.add(sub.name);
    });
  });

  const subjectWiseGrades = {};
  const subjectRows = [...subjectNamesSet].map((subjectName) => {
    const cells = {};
    const byTest = {};

    testColumns.forEach((col) => {
      const test = gradeTests.find((t) => toIdString(t._id) === col.testId);
      const hasSubject = (test?.subjects || []).some(
        (s) => s.name === subjectName && normalizeType(s.type) === 'grade'
      );
      if (!hasSubject) {
        cells[col.testId] = { grade: '', display: '-' };
        byTest[col.columnLabel] = '-';
        return;
      }
      const mark = getMarkForTest(markMap, col.testId);
      const subMark = findSavedSubject(mark, subjectName);
      const grade = formatGradeValue(subMark);
      cells[col.testId] = { grade, display: grade === '' ? '-' : grade };
      byTest[col.columnLabel] = grade === '' ? '-' : grade;
    });

    subjectWiseGrades[subjectName] = byTest;
    return { subjectName, cells };
  });

  return {
    tableType: 'grade',
    layout: 'matrix',
    title: 'Grade Based Examination',
    testColumns,
    subjectRows,
    subjectWiseGrades,
  };
};

export const buildGroupedReportTables = (tests, markMap) => {
  const tables = [];
  const marksTests = classifyMarksTests(tests);
  const gradeTests = classifyGradeTests(tests);

  if (marksTests.length > 0) tables.push(buildMarksMatrixTable(marksTests, markMap));
  if (gradeTests.length > 0) tables.push(buildGradeMatrixTable(gradeTests, markMap));

  return tables;
};

export const buildFullReportPayload = ({
  student,
  schoolSettings,
  academicSession,
  tests,
  marks,
  config = {},
}) => {
  const markMap = buildMarkMap(marks);
  const marksTests = classifyMarksTests(tests);
  const gradeTests = classifyGradeTests(tests);
  const tables = buildGroupedReportTables(tests, markMap);

  const marksTable = tables.find((t) => t.tableType === 'marks');
  const gradeTable = tables.find((t) => t.tableType === 'grade');
  const passPercentage =
    schoolSettings?.passPercentage ?? config.passPercentage ?? 33;
  const marksSection = buildMarksSection(marksTable, passPercentage);
  const gradeSection = buildGradeSection(gradeTable);

  const attendance = config.attendance || {};
  const attendancePercentage =
    attendance.totalDays > 0
      ? Math.round((attendance.presentDays / attendance.totalDays) * 10000) / 100
      : null;

  return {
    student: {
      _id: student._id,
      name: student.name,
      rollNo: student.rollNo,
      admissionNo: student.rollNo,
      class: student.class,
      section: student.section || 'A',
      dob: student.dob,
      gender: student.gender,
      fatherName: student.fatherName,
      motherName: student.motherName,
      mobileNo: student.mobileNo,
      email: student.email,
      address: student.address,
      photo: student.photo || '',
      bloodGroup: student.bloodGroup,
      // Spread all custom fields so report card can access any dynamic field
      ...(student.customFields instanceof Map
        ? Object.fromEntries(student.customFields)
        : (student.customFields || {})),
    },
    school: {
      name: schoolSettings?.schoolName || config.schoolHeader?.schoolName || 'School Name',
      schoolName: schoolSettings?.schoolName || config.schoolHeader?.schoolName || 'School Name',
      address: schoolSettings?.address || config.schoolHeader?.address || '',
      contact: schoolSettings?.contact || config.schoolHeader?.contact || '',
      email: schoolSettings?.email || '',
      logo: schoolSettings?.logo || config.schoolHeader?.logo || '',
      principalName: schoolSettings?.principalName || '',
      diseCode: schoolSettings?.diseCode || '',
      district: schoolSettings?.district || '',
      block: schoolSettings?.block || '',
      state: schoolSettings?.state || '',
    },
    academicYear: academicSession?.name || '',
    marksTests: marksTests.map((t, i) => {
      const table = tables.find((tb) => tb.tableType === 'marks');
      const col = table?.testColumns?.[i];
      return {
        id: toIdString(t._id),
        name: t.testName,
        code: col?.columnLabel || `M${i + 1}`,
        type: 'MARKS',
        examType: t.examType,
      };
    }),
    gradeTests: gradeTests.map((t, i) => {
      const table = tables.find((tb) => tb.tableType === 'grade');
      const col = table?.testColumns?.[i];
      return {
        id: toIdString(t._id),
        name: t.testName,
        code: col?.columnLabel || `G${i + 1}`,
        type: 'GRADE',
        examType: t.examType,
      };
    }),
    subjectWiseMarks: marksTable?.subjectWiseMarks || {},
    subjectWiseGrades: gradeTable?.subjectWiseGrades || {},
    marksSection: marksSection
      ? { ...marksSection, footerColspan: marksSection.columns.length + 1 }
      : null,
    gradeSection,
    tables,
    passPercentage,
    attendance: {
      enabled: attendance.enabled !== false,
      totalDays: attendance.totalDays ?? 200,
      presentDays: attendance.presentDays ?? 180,
      percentage: attendancePercentage,
    },
    remarks: config.remarks || '',
    footer: config.footer || 'Best wishes for your future endeavors.',
    marksRecordsFound: marks.length,
    generatedAt: new Date(),
  };
};

export const toObjectIds = (ids) =>
  ids.map((id) => (mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id));
