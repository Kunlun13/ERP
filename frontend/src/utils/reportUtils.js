// /**
//  * Report data processing — builds marks/grade table structures for PDF render.
//  */

// const MARKS_EXAM_TYPES = new Set([
//   'MARKS',
//   'MARK',
//   'MARK_BASED',
//   'MARK-BASED',
//   'MARKBASED',
//   'MARK_BASED_TEST',
// ]);

// const GRADE_EXAM_TYPES = new Set([
//   'GRADE',
//   'GRADES',
//   'GRADE_BASED',
//   'GRADE-BASED',
//   'GRADEBASED',
//   'GRADE_BASED_TEST',
// ]);

// const normalizeExamType = (examType) =>
//   (examType || '').toString().trim().toUpperCase().replace(/\s+/g, '_');

// const normalizeSubjectType = (type) =>
//   (type || '').toString().trim().toLowerCase();

// export const isMarksBasedTest = (test) => {
//   if (!test) return false;
//   const et = normalizeExamType(test.examType);
//   const tt = normalizeExamType(test.type || test.testType);
//   if (MARKS_EXAM_TYPES.has(et) || MARKS_EXAM_TYPES.has(tt)) return true;
//   if (GRADE_EXAM_TYPES.has(et) && !GRADE_EXAM_TYPES.has(tt)) {
//     return (test.subjects || []).some((s) => normalizeSubjectType(s.type) === 'marks');
//   }
//   const subs = test.subjects || [];
//   if (!subs.length) return false;
//   return subs.some((s) => normalizeSubjectType(s.type) === 'marks');
// };

// export const isGradeBasedTest = (test) => {
//   if (!test) return false;
//   const et = normalizeExamType(test.examType);
//   const tt = normalizeExamType(test.type || test.testType);
//   if (GRADE_EXAM_TYPES.has(et) || GRADE_EXAM_TYPES.has(tt)) return true;
//   if (MARKS_EXAM_TYPES.has(et) && !MARKS_EXAM_TYPES.has(tt)) {
//     return (test.subjects || []).some((s) => normalizeSubjectType(s.type) === 'grade');
//   }
//   const subs = test.subjects || [];
//   if (!subs.length) return false;
//   return subs.some((s) => normalizeSubjectType(s.type) === 'grade');
// };

// /** Separate selected tests — uses examType, testType, and subject types */
// export const splitTestsByCategory = (tests = []) => {
//   const marksBasedTests = [];
//   const gradeBasedTests = [];

//   tests.forEach((test) => {
//     const marks = isMarksBasedTest(test);
//     const grade = isGradeBasedTest(test);
//     if (marks) marksBasedTests.push(test);
//     if (grade) gradeBasedTests.push(test);
//   });

//   return { marksBasedTests, gradeBasedTests };
// };

// const displayMark = (v) => {
//   if (v === '' || v == null || v === undefined) return '-';
//   if (v === 'AB' || v === 'ab') return 'AB';
//   return String(v);
// };

// const sumMarks = (values) =>
//   values.reduce((sum, v) => {
//     if (v === '-' || v === 'AB' || v === '' || v == null) return sum;
//     const n = Number(v);
//     return sum + (Number.isNaN(n) ? 0 : n);
//   }, 0);

// const testToColumnMeta = (test, index, prefix) => {
//   const name = (test.testName || test.name || '').trim();
//   const code = test.code || name || `${prefix}${index + 1}`;
//   return {
//     testId: String(test._id || test.id || ''),
//     code,
//     header: code,
//     name,
//   };
// };

// function buildMarksRowsFromTable(marksTable, columnMetas) {
//   if (!marksTable?.testColumns?.length) return [];

//   const columns = marksTable.testColumns.map((col, i) => ({
//     testId: String(col.testId),
//     code: columnMetas[i]?.code || col.columnLabel || `M${i + 1}`,
//   }));

//   const subjectNames = new Set();
//   (marksTable.subjectRows || []).forEach((r) => subjectNames.add(r.subjectName));

//   return [...subjectNames].map((subject) => {
//     const row = marksTable.subjectRows.find((r) => r.subjectName === subject);
//     const marks = columns.map((col) => {
//       const cell = row?.cells?.[col.testId];
//       const v = cell?.display ?? cell?.obtained;
//       return displayMark(v);
//     });
//     const total = row?.totalMarks ?? sumMarks(marks);
//     const keyed = { subject, marks, total };
//     columns.forEach((col, i) => {
//       keyed[col.code] = marks[i];
//     });
//     return keyed;
//   });
// }

// function buildMarksRowsFromSubjectWise(subjectWiseMarks, columnCodes) {
//   const subjects = Object.keys(subjectWiseMarks || {});
//   return subjects.map((subject) => {
//     const data = subjectWiseMarks[subject] || {};
//     const marks = columnCodes.map((code) => displayMark(data[code]));
//     const total = data.total ?? sumMarks(marks);
//     const keyed = { subject, marks, total };
//     columnCodes.forEach((code, i) => {
//       keyed[code] = marks[i];
//     });
//     return keyed;
//   });
// }

// function collectMarksSubjects(marksTests, apiData) {
//   const names = new Set();
//   marksTests.forEach((t) => {
//     (t.subjects || []).forEach((s) => {
//       if (normalizeSubjectType(s.type) === 'marks') names.add(s.name);
//     });
//   });
//   Object.keys(apiData.subjectWiseMarks || {}).forEach((n) => names.add(n));
//   const marksTable = apiData.tables?.find((t) => t.tableType === 'marks');
//   (marksTable?.subjectRows || []).forEach((r) => names.add(r.subjectName));
//   return [...names];
// }

// function buildMarksSection(apiData, selectedMarksTests = []) {
//   const marksTests =
//     apiData.marksTests?.length > 0
//       ? apiData.marksTests
//       : selectedMarksTests.map((t, i) => testToColumnMeta(t, i, 'M'));

//   const marksTable = apiData.tables?.find((t) => t.tableType === 'marks');

//   let columnMetas = [];
//   if (marksTable?.testColumns?.length) {
//     columnMetas = marksTable.testColumns.map((col, i) => ({
//       testId: String(col.testId),
//       code: marksTests[i]?.code || col.columnLabel || `M${i + 1}`,
//       header: marksTests[i]?.code || col.columnLabel || `M${i + 1}`,
//     }));
//   } else if (marksTests.length) {
//     columnMetas = marksTests.map((t, i) =>
//       typeof t.code === 'string'
//         ? { testId: String(t.id || t.testId || ''), code: t.code, header: t.code }
//         : testToColumnMeta(t, i, 'M')
//     );
//   }

//   if (!columnMetas.length) return null;

//   let rows = [];
//   if (marksTable?.subjectRows?.length) {
//     rows = buildMarksRowsFromTable(marksTable, marksTests);
//   } else if (Object.keys(apiData.subjectWiseMarks || {}).length) {
//     rows = buildMarksRowsFromSubjectWise(
//       apiData.subjectWiseMarks,
//       columnMetas.map((c) => c.code)
//     );
//   } else if (selectedMarksTests.length) {
//     const subjects = collectMarksSubjects(selectedMarksTests, apiData);
//     rows = subjects.map((subject) => {
//       const marks = columnMetas.map(() => '-');
//       const keyed = { subject, marks, total: 0 };
//       columnMetas.forEach((col, i) => {
//         keyed[col.code] = marks[i];
//       });
//       return keyed;
//     });
//   }

//   const grandTotal =
//     marksTable?.grandTotal ?? rows.reduce((s, r) => s + (Number(r.total) || 0), 0);
//   const percentage = marksTable?.grandPercentage ?? 0;
//   const passPct = apiData.passPercentage ?? 33;
//   const overallResult =
//     marksTable?.overallResult ??
//     (percentage >= passPct ? 'PASS' : 'FAIL');

//   return {
//     columns: columnMetas,
//     rows,
//     footer: {
//       grandTotal,
//       percentage,
//       overallResult: String(overallResult).toUpperCase().includes('PASS')
//         ? 'PASS'
//         : 'FAIL',
//     },
//     footerColspan: columnMetas.length + 1,
//   };
// }

// function buildGradeRowsFromTable(gradeTable, columnMetas) {
//   if (!gradeTable?.testColumns?.length) return [];

//   const columns = gradeTable.testColumns.map((col, i) => ({
//     testId: String(col.testId),
//     code: columnMetas[i]?.code || col.columnLabel || `G${i + 1}`,
//   }));

//   const subjectNames = new Set();
//   (gradeTable.subjectRows || []).forEach((r) => subjectNames.add(r.subjectName));

//   return [...subjectNames].map((subject) => {
//     const row = gradeTable.subjectRows.find((r) => r.subjectName === subject);
//     const grades = columns.map((col) => {
//       const cell = row?.cells?.[col.testId];
//       const v = cell?.display ?? cell?.grade;
//       return displayMark(v);
//     });
//     const keyed = { subject, grades };
//     columns.forEach((col, i) => {
//       keyed[col.code] = grades[i];
//     });
//     return keyed;
//   });
// }

// function buildGradeSection(apiData, selectedGradeTests = []) {
//   const gradeTests =
//     apiData.gradeTests?.length > 0
//       ? apiData.gradeTests
//       : selectedGradeTests.map((t, i) => testToColumnMeta(t, i, 'G'));

//   const gradeTable = apiData.tables?.find((t) => t.tableType === 'grade');

//   let columnMetas = [];
//   if (gradeTable?.testColumns?.length) {
//     columnMetas = gradeTable.testColumns.map((col, i) => ({
//       testId: String(col.testId),
//       code: gradeTests[i]?.code || col.columnLabel || `G${i + 1}`,
//       header: gradeTests[i]?.code || col.columnLabel || `G${i + 1}`,
//     }));
//   } else if (gradeTests.length) {
//     columnMetas = gradeTests.map((t, i) =>
//       typeof t.code === 'string'
//         ? { testId: String(t.id || t.testId || ''), code: t.code, header: t.code }
//         : testToColumnMeta(t, i, 'G')
//     );
//   }

//   if (!columnMetas.length) return null;

//   let rows = [];
//   if (gradeTable?.subjectRows?.length) {
//     rows = buildGradeRowsFromTable(gradeTable, gradeTests);
//   } else if (Object.keys(apiData.subjectWiseGrades || {}).length) {
//     rows = Object.keys(apiData.subjectWiseGrades).map((subject) => {
//       const data = apiData.subjectWiseGrades[subject] || {};
//       const grades = columnMetas.map((col) => displayMark(data[col.code]));
//       const keyed = { subject, grades };
//       columnMetas.forEach((col, i) => {
//         keyed[col.code] = grades[i];
//       });
//       return keyed;
//     });
//   } else if (selectedGradeTests.length) {
//     const names = new Set();
//     selectedGradeTests.forEach((t) => {
//       (t.subjects || []).forEach((s) => {
//         if (normalizeSubjectType(s.type) === 'grade') names.add(s.name);
//       });
//     });
//     rows = [...names].map((subject) => {
//       const grades = columnMetas.map(() => '-');
//       const keyed = { subject, grades };
//       columnMetas.forEach((col, i) => {
//         keyed[col.code] = grades[i];
//       });
//       return keyed;
//     });
//   }

//   return { columns: columnMetas, rows };
// }

// function normalizeSectionRows(section, kind) {
//   if (!section?.columns?.length) return section;
//   const codes = section.columns.map((c) => c.code);
//   const rows = (section.rows || []).map((row) => {
//     if (kind === 'marks' && row.marks?.length === codes.length) return row;
//     if (kind === 'grade' && row.grades?.length === codes.length) return row;
//     if (kind === 'marks') {
//       const marks = codes.map((code) => displayMark(row[code]));
//       return { ...row, marks, total: row.total ?? sumMarks(marks) };
//     }
//     const grades = codes.map((code) => displayMark(row[code]));
//     return { ...row, grades };
//   });
//   return { ...section, rows, footerColspan: section.footerColspan ?? section.columns.length + 1 };
// }

// /** Process API response + UI-selected tests into final report card model */
// // export const normalizeReportCard = (apiData, selectedTests = []) => {
// //   if (!apiData) return null;

// //   const { marksBasedTests, gradeBasedTests } = splitTestsByCategory(selectedTests);

// //   if (typeof console !== 'undefined' && selectedTests.length) {
// //     console.log('Selected Tests:', selectedTests);
// //     console.log('Marks Tests:', marksBasedTests);
// //     console.log('Grade Tests:', gradeBasedTests);
// //     console.log('API marksTests:', apiData.marksTests);
// //     console.log('API gradeTests:', apiData.gradeTests);
// //     console.log('API tables:', apiData.tables?.map((t) => t.tableType));
// //   }

// //   let marksSection =
// //     apiData.marksSection?.columns?.length > 0
// //       ? normalizeSectionRows(apiData.marksSection, 'marks')
// //       : null;
// //   let gradeSection =
// //     apiData.gradeSection?.columns?.length > 0
// //       ? normalizeSectionRows(apiData.gradeSection, 'grade')
// //       : null;

// //   if (!marksSection) {
// //     marksSection = buildMarksSection(apiData, marksBasedTests);
// //   }
// //   if (!gradeSection) {
// //     gradeSection = buildGradeSection(apiData, gradeBasedTests);
// //   }

// //   if (marksSection && !marksSection.footerColspan) {
// //     marksSection.footerColspan = marksSection.columns.length + 1;
// //   }

// //   return {
// //     school: {
// //       name: apiData.school?.name || apiData.school?.schoolName,
// //       schoolName: apiData.school?.schoolName || apiData.school?.name,
// //       address: apiData.school?.address || '',
// //       contact: apiData.school?.contact || '',
// //       logo: apiData.school?.logo || '',
// //     },
// //     student: {
// //       ...apiData.student,
// //       admissionNo: apiData.student?.admissionNo || apiData.student?.rollNo,
// //     },
// //     academicYear: apiData.academicYear || '',
// //     marksTests: apiData.marksTests?.length ? apiData.marksTests : marksBasedTests,
// //     gradeTests: apiData.gradeTests?.length ? apiData.gradeTests : gradeBasedTests,
// //     marksSection,
// //     gradeSection,
// //     passPercentage: apiData.passPercentage,
// //   };
// // };



// export function normalizeReportCard(reportData) {
//   if (!reportData?.tables) return null;

//   const student = reportData.student || {};
//   const school = reportData.schoolHeader || {};

//   const marksTable = reportData.tables.find(
//     (t) => t.tableType === "marks"
//   );

//   const gradeTable = reportData.tables.find(
//     (t) => t.tableType === "grade"
//   );

//   const formatMarks = marksTable?.tests?.map((test) => {
//     const row = {
//       subject: null,
//     };

//     test.subjects.forEach((s) => {
//       if (!row.subject) row.subject = s.name;

//       row[test.testName] = s.obtained;
//     });

//     row.total = test.totalObtained;

//     return row;
//   });

//   const formatGrade = gradeTable?.tests?.map((test) => {
//     const row = {
//       subject: null,
//     };

//     test.subjects.forEach((s) => {
//       if (!row.subject) row.subject = s.name;

//       row[test.testName] = s.display;
//     });

//     return row;
//   });

//   return {
//     student,
//     school,

//     marksSection: {
//       title: marksTable?.title,
//       columns: marksTable?.tests?.map((t) => t.testName) || [],
//       rows: formatMarks || [],
//       grandTotal: marksTable?.grandTotal,
//       percentage: marksTable?.grandPercentage,
//     },

//     gradeSection: {
//       title: gradeTable?.title,
//       columns: gradeTable?.tests?.map((t) => t.testName) || [],
//       rows: formatGrade || [],
//     },
//   };
// }



/**
 * Report data processing — builds marks/grade table structures for PDF render.
 */

const MARKS_EXAM_TYPES = new Set([
  'MARKS',
  'MARK',
  'MARK_BASED',
  'MARK-BASED',
  'MARKBASED',
  'MARK_BASED_TEST',
]);

const GRADE_EXAM_TYPES = new Set([
  'GRADE',
  'GRADES',
  'GRADE_BASED',
  'GRADE-BASED',
  'GRADEBASED',
  'GRADE_BASED_TEST',
]);

const normalizeExamType = (examType) =>
  (examType || '').toString().trim().toUpperCase().replace(/\s+/g, '_');

const normalizeSubjectType = (type) =>
  (type || '').toString().trim().toLowerCase();

export const isMarksBasedTest = (test) => {
  if (!test) return false;
  const et = normalizeExamType(test.examType);
  const tt = normalizeExamType(test.type || test.testType);
  if (MARKS_EXAM_TYPES.has(et) || MARKS_EXAM_TYPES.has(tt)) return true;
  if (GRADE_EXAM_TYPES.has(et) && !GRADE_EXAM_TYPES.has(tt)) {
    return (test.subjects || []).some((s) => normalizeSubjectType(s.type) === 'marks');
  }
  const subs = test.subjects || [];
  if (!subs.length) return false;
  return subs.some((s) => normalizeSubjectType(s.type) === 'marks');
};

export const isGradeBasedTest = (test) => {
  if (!test) return false;
  const et = normalizeExamType(test.examType);
  const tt = normalizeExamType(test.type || test.testType);
  if (GRADE_EXAM_TYPES.has(et) || GRADE_EXAM_TYPES.has(tt)) return true;
  if (MARKS_EXAM_TYPES.has(et) && !MARKS_EXAM_TYPES.has(tt)) {
    return (test.subjects || []).some((s) => normalizeSubjectType(s.type) === 'grade');
  }
  const subs = test.subjects || [];
  if (!subs.length) return false;
  return subs.some((s) => normalizeSubjectType(s.type) === 'grade');
};

/** Separate selected tests — uses examType, testType, and subject types */
export const splitTestsByCategory = (tests = []) => {
  const marksBasedTests = [];
  const gradeBasedTests = [];

  tests.forEach((test) => {
    const marks = isMarksBasedTest(test);
    const grade = isGradeBasedTest(test);
    if (marks) marksBasedTests.push(test);
    if (grade) gradeBasedTests.push(test);
  });

  return { marksBasedTests, gradeBasedTests };
};

const displayMark = (v) => {
  if (v === '' || v == null || v === undefined) return '-';
  if (v === 'AB' || v === 'ab') return 'AB';
  return String(v);
};

const sumMarks = (values) =>
  values.reduce((sum, v) => {
    if (v === '-' || v === 'AB' || v === '' || v == null) return sum;
    const n = Number(v);
    return sum + (Number.isNaN(n) ? 0 : n);
  }, 0);

const testToColumnMeta = (test, index, prefix) => {
  const name = (test.testName || test.name || '').trim();
  const code = test.code || name || `${prefix}${index + 1}`;
  return {
    testId: String(test._id || test.id || ''),
    code,
    header: code,
    name,
  };
};

function buildMarksRowsFromTable(marksTable, columnMetas) {
  if (!marksTable?.testColumns?.length) return [];

  const columns = marksTable.testColumns.map((col, i) => ({
    testId: String(col.testId),
    code: columnMetas[i]?.code || col.columnLabel || `M${i + 1}`,
  }));

  const subjectNames = new Set();
  (marksTable.subjectRows || []).forEach((r) => subjectNames.add(r.subjectName));

  return [...subjectNames].map((subject) => {
    const row = marksTable.subjectRows.find((r) => r.subjectName === subject);
    const marks = columns.map((col) => {
      const cell = row?.cells?.[col.testId];
      const v = cell?.display ?? cell?.obtained;
      return displayMark(v);
    });
    const total = row?.totalMarks ?? sumMarks(marks);
    const keyed = { subject, marks, total };
    columns.forEach((col, i) => {
      keyed[col.code] = marks[i];
    });
    return keyed;
  });
}

function buildMarksRowsFromSubjectWise(subjectWiseMarks, columnCodes) {
  const subjects = Object.keys(subjectWiseMarks || {});
  return subjects.map((subject) => {
    const data = subjectWiseMarks[subject] || {};
    const marks = columnCodes.map((code) => displayMark(data[code]));
    const total = data.total ?? sumMarks(marks);
    const keyed = { subject, marks, total };
    columnCodes.forEach((code, i) => {
      keyed[code] = marks[i];
    });
    return keyed;
  });
}

function collectMarksSubjects(marksTests, apiData) {
  const names = new Set();
  marksTests.forEach((t) => {
    (t.subjects || []).forEach((s) => {
      if (normalizeSubjectType(s.type) === 'marks') names.add(s.name);
    });
  });
  Object.keys(apiData.subjectWiseMarks || {}).forEach((n) => names.add(n));
  const marksTable = apiData.tables?.find((t) => t.tableType === 'marks');
  (marksTable?.subjectRows || []).forEach((r) => names.add(r.subjectName));
  return [...names];
}

function buildMarksSection(apiData, selectedMarksTests = []) {
  const marksTests =
    apiData.marksTests?.length > 0
      ? apiData.marksTests
      : selectedMarksTests.map((t, i) => testToColumnMeta(t, i, 'M'));

  const marksTable = apiData.tables?.find((t) => t.tableType === 'marks');

  let columnMetas = [];
  if (marksTable?.testColumns?.length) {
    columnMetas = marksTable.testColumns.map((col, i) => ({
      testId: String(col.testId),
      code: marksTests[i]?.code || col.columnLabel || `M${i + 1}`,
      header: marksTests[i]?.code || col.columnLabel || `M${i + 1}`,
    }));
  } else if (marksTests.length) {
    columnMetas = marksTests.map((t, i) =>
      typeof t.code === 'string'
        ? { testId: String(t.id || t.testId || ''), code: t.code, header: t.code }
        : testToColumnMeta(t, i, 'M')
    );
  }

  if (!columnMetas.length) return null;

  let rows = [];
  if (marksTable?.subjectRows?.length) {
    rows = buildMarksRowsFromTable(marksTable, marksTests);
  } else if (Object.keys(apiData.subjectWiseMarks || {}).length) {
    rows = buildMarksRowsFromSubjectWise(
      apiData.subjectWiseMarks,
      columnMetas.map((c) => c.code)
    );
  } else if (selectedMarksTests.length) {
    const subjects = collectMarksSubjects(selectedMarksTests, apiData);
    rows = subjects.map((subject) => {
      const marks = columnMetas.map(() => '-');
      const keyed = { subject, marks, total: 0 };
      columnMetas.forEach((col, i) => {
        keyed[col.code] = marks[i];
      });
      return keyed;
    });
  }

  const grandTotal =
    marksTable?.grandTotal ?? rows.reduce((s, r) => s + (Number(r.total) || 0), 0);
  const percentage = marksTable?.grandPercentage ?? 0;
  const passPct = apiData.passPercentage ?? 33;
  const overallResult =
    marksTable?.overallResult ??
    (percentage >= passPct ? 'PASS' : 'FAIL');

  return {
    columns: columnMetas,
    rows,
    footer: {
      grandTotal,
      percentage,
      overallResult: String(overallResult).toUpperCase().includes('PASS')
        ? 'PASS'
        : 'FAIL',
    },
    footerColspan: columnMetas.length + 1,
  };
}

function buildGradeRowsFromTable(gradeTable, columnMetas) {
  if (!gradeTable?.testColumns?.length) return [];

  const columns = gradeTable.testColumns.map((col, i) => ({
    testId: String(col.testId),
    code: columnMetas[i]?.code || col.columnLabel || `G${i + 1}`,
  }));

  const subjectNames = new Set();
  (gradeTable.subjectRows || []).forEach((r) => subjectNames.add(r.subjectName));

  return [...subjectNames].map((subject) => {
    const row = gradeTable.subjectRows.find((r) => r.subjectName === subject);
    const grades = columns.map((col) => {
      const cell = row?.cells?.[col.testId];
      const v = cell?.display ?? cell?.grade;
      return displayMark(v);
    });
    const keyed = { subject, grades };
    columns.forEach((col, i) => {
      keyed[col.code] = grades[i];
    });
    return keyed;
  });
}

function buildGradeSection(apiData, selectedGradeTests = []) {
  const gradeTests =
    apiData.gradeTests?.length > 0
      ? apiData.gradeTests
      : selectedGradeTests.map((t, i) => testToColumnMeta(t, i, 'G'));

  const gradeTable = apiData.tables?.find((t) => t.tableType === 'grade');

  let columnMetas = [];
  if (gradeTable?.testColumns?.length) {
    columnMetas = gradeTable.testColumns.map((col, i) => ({
      testId: String(col.testId),
      code: gradeTests[i]?.code || col.columnLabel || `G${i + 1}`,
      header: gradeTests[i]?.code || col.columnLabel || `G${i + 1}`,
    }));
  } else if (gradeTests.length) {
    columnMetas = gradeTests.map((t, i) =>
      typeof t.code === 'string'
        ? { testId: String(t.id || t.testId || ''), code: t.code, header: t.code }
        : testToColumnMeta(t, i, 'G')
    );
  }

  if (!columnMetas.length) return null;

  let rows = [];
  if (gradeTable?.subjectRows?.length) {
    rows = buildGradeRowsFromTable(gradeTable, gradeTests);
  } else if (Object.keys(apiData.subjectWiseGrades || {}).length) {
    rows = Object.keys(apiData.subjectWiseGrades).map((subject) => {
      const data = apiData.subjectWiseGrades[subject] || {};
      const grades = columnMetas.map((col) => displayMark(data[col.code]));
      const keyed = { subject, grades };
      columnMetas.forEach((col, i) => {
        keyed[col.code] = grades[i];
      });
      return keyed;
    });
  } else if (selectedGradeTests.length) {
    const names = new Set();
    selectedGradeTests.forEach((t) => {
      (t.subjects || []).forEach((s) => {
        if (normalizeSubjectType(s.type) === 'grade') names.add(s.name);
      });
    });
    rows = [...names].map((subject) => {
      const grades = columnMetas.map(() => '-');
      const keyed = { subject, grades };
      columnMetas.forEach((col, i) => {
        keyed[col.code] = grades[i];
      });
      return keyed;
    });
  }

  return { columns: columnMetas, rows };
}

function normalizeSectionRows(section, kind) {
  if (!section?.columns?.length) return section;
  const codes = section.columns.map((c) => c.code);
  const rows = (section.rows || []).map((row) => {
    if (kind === 'marks' && row.marks?.length === codes.length) return row;
    if (kind === 'grade' && row.grades?.length === codes.length) return row;
    if (kind === 'marks') {
      const marks = codes.map((code) => displayMark(row[code]));
      return { ...row, marks, total: row.total ?? sumMarks(marks) };
    }
    const grades = codes.map((code) => displayMark(row[code]));
    return { ...row, grades };
  });
  return { ...section, rows, footerColspan: section.footerColspan ?? section.columns.length + 1 };
}

const getTableTests = (table) => {
  if (!table) return [];
  if (Array.isArray(table.tests) && table.tests.length) return table.tests;
  if (Array.isArray(table.testColumns) && table.testColumns.length) {
    return table.testColumns.map((col) => ({
      testId: col.testId,
      testName: col.testName || col.columnLabel || col.code || col.testId,
      subjects: col.subjects || [],
      columnLabel: col.columnLabel,
    }));
  }
  return [];
};

const getTestLabel = (test) => test?.testName || test?.columnLabel || test?.code || String(test?.testId || '');

const buildSectionRows = (table, kind) => {
  if (!table) return [];
  const tests = getTableTests(table);
  if (!tests.length) return [];

  const subjectNames = [
    ...new Set(
      (table.subjectRows || []).flatMap((row) => [row.subjectName])
    ),
  ];

  return subjectNames.map((subjectName) => {
    const row = { subject: subjectName };
    let totalObtained = 0;
    let totalMax = 0;

    tests.forEach((test) => {
      const subjectRow = (table.subjectRows || []).find((r) => r.subjectName === subjectName);
      const cell = subjectRow?.cells?.[String(test.testId)] || {};
      const value = kind === 'marks' ? cell.display ?? cell.obtained : cell.display ?? cell.grade;
      row[getTestLabel(test)] = displayMark(value);

      if (kind === 'marks') {
        if (cell.obtained != null && cell.obtained !== '' && cell.obtained !== 'AB') {
          totalObtained += Number(cell.obtained) || 0;
        }
        totalMax += cell.max ?? 0;
      }
    });

    if (kind === 'marks') {
      row.total = totalMax > 0 ? `${totalObtained}/${totalMax}` : displayMark(totalObtained);
    }

    return row;
  });
};

/** Process API response into final report card model */
export function normalizeReportCard(reportData) {
  if (!reportData?.tables) return null;

  const student = reportData.student || {};
  const school = reportData.schoolHeader || reportData.school || {};

  const marksTable = reportData.tables.find((t) => t.tableType === 'marks');
  const gradeTable = reportData.tables.find((t) => t.tableType === 'grade');

  const marksTests = getTableTests(marksTable);
  const gradeTests = getTableTests(gradeTable);

  return {
    student,
    school,

    marksSection: marksTable
      ? {
          title: marksTable.title || 'Marks Based Tests',
          columns: marksTests.map(getTestLabel),
          rows: buildSectionRows(marksTable, 'marks'),
          grandTotal: marksTable.grandTotal,
          grandMax: marksTable.grandMax,
          percentage: marksTable.grandPercentage,
          grandGrade: marksTable.grandGrade,
          showTotal: marksTable.showTotal !== false,
        }
      : null,

    gradeSection: gradeTable
      ? {
          title: gradeTable.title || 'Grade Based Tests',
          columns: gradeTests.map(getTestLabel),
          rows: buildSectionRows(gradeTable, 'grade'),
          showTotal: gradeTable.showTotal !== false,
        }
      : null,
  };
}
