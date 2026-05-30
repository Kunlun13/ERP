

// import React, { useState, useRef } from 'react';

// /* ══════════════════════════════════════════════════════════
//    GRADE CONVERSION HELPERS
// ══════════════════════════════════════════════════════════ */
// /**
//  * Convert a numeric mark to a letter grade.
//  * fullMarks is the maximum for that cell so we can compute %.
//  * Falls back to absolute thresholds (out of 100) if fullMarks unknown.
//  */
// function markToGrade(value, fullMarks) {
//   if (value === null || value === undefined || value === '' || value === '-' || value === '—') return '—';
//   if (String(value).toUpperCase() === 'AB') return 'AB';
//   const num = Number(value);
//   if (Number.isNaN(num)) return String(value);
//   const max = Number(fullMarks) || 100;
//   const pct = (num / max) * 100;
//   if (pct >= 91) return 'A+';
//   if (pct >= 76) return 'A';
//   if (pct >= 61) return 'B+';
//   if (pct >= 46) return 'B';
//   if (pct >= 33) return 'C';
//   if (pct >= 21) return 'D';
//   return 'E';
// }

// const GRADE_COLORS = {
//   'A+': '#1a8a4a', A: '#27ae60', 'B+': '#2980b9',
//   B: '#1a5276', C: '#b8860b', D: '#e67e22', E: '#c0392b',
// };

// /* ══════════════════════════════════════════════════════════
//    CONSTANTS / STATIC DATA
// ══════════════════════════════════════════════════════════ */
// const GRADE_SCALE = [
//   { g: 'A+', r: '91–100', bg: '#1a8a4a' },
//   { g: 'A',  r: '76–90',  bg: '#27ae60' },
//   { g: 'B+', r: '61–75',  bg: '#2980b9' },
//   { g: 'B',  r: '46–60',  bg: '#1a5276' },
//   { g: 'C',  r: '33–45',  bg: '#b8860b' },
//   { g: 'D',  r: '21–32',  bg: '#e67e22' },
//   { g: 'E',  r: '00–20',  bg: '#c0392b' },
// ];

// const GRADE_PALETTES = [
//   { head: '#4a235a', sub: '#7d3c98' },
//   { head: '#1a3a6b', sub: '#2471a3' },
//   { head: '#145a32', sub: '#1e8449' },
//   { head: '#6e2f1a', sub: '#ba4a00' },
// ];
// const palette = (i) => GRADE_PALETTES[i % GRADE_PALETTES.length];

// const EMPTY_VALS = new Set(['-', '—', '', null, undefined]);

// /* ══════════════════════════════════════════════════════════
//    SMALL UI HELPERS
// ══════════════════════════════════════════════════════════ */
// const Td = ({ children, cls = '', style, colSpan }) => (
//   <td colSpan={colSpan} style={style}
//       className={`border border-gray-600 px-[6px] py-[3px] text-[10px] leading-snug ${cls}`}>
//     {children ?? '—'}
//   </td>
// );

// const Th = ({ children, cls = '', style, colSpan, rowSpan }) => (
//   <th colSpan={colSpan} rowSpan={rowSpan} style={style}
//       className={`border border-gray-600 px-[6px] py-[4px] text-[9.5px] font-bold leading-snug ${cls}`}>
//     {children}
//   </th>
// );

// const Logo = ({ label }) => (
//   <div style={{
//     width: 64, height: 64, borderRadius: '50%', border: '2px solid #555',
//     background: '#fef9e7', display: 'flex', alignItems: 'center',
//     justifyContent: 'center', fontSize: 8, color: '#777',
//     textAlign: 'center', flexShrink: 0,
//   }}>{label}</div>
// );

// const SecBar = ({ children, bg = '#1a5276' }) => (
//   <div style={{
//     background: bg, color: '#fff', fontSize: 10, fontWeight: 700,
//     textTransform: 'uppercase', letterSpacing: '0.06em', padding: '3px 7px',
//   }}>{children}</div>
// );

// const InfoRow = ({ l1, v1, l2, v2 }) => (
//   <tr>
//     <td className="border border-gray-500 px-[6px] py-[3px] text-[9px] font-semibold leading-snug"
//         style={{ background: '#d6e4f7', width: '22%' }}>{l1}</td>
//     <td className="border border-gray-500 px-[6px] py-[3px] text-[10px] leading-snug"
//         style={{ width: '28%' }}>{v1 || '—'}</td>
//     <td className="border border-gray-500 px-[6px] py-[3px] text-[9px] font-semibold leading-snug"
//         style={{ background: '#d6e4f7', width: '22%' }}>{l2}</td>
//     <td className="border border-gray-500 px-[6px] py-[3px] text-[10px] leading-snug"
//         style={{ width: '28%' }}>{v2 || '—'}</td>
//   </tr>
// );

// /* ══════════════════════════════════════════════════════════
//    MARKS TABLE
//    • First column: Full Marks (always numeric, never converted)
//    • Toggle button: convert score cells ↔ grade letters
//    • Last data row: per-column sum of obtained marks
// ══════════════════════════════════════════════════════════ */
// function MarksTable({ marksSection }) {
//   const [showGrades, setShowGrades] = useState(false);

//   if (!marksSection?.columns?.length) return null;

//   const {
//     columns, rows = [],
//     grandTotal, grandMax, percentage, grandGrade, showTotal,
//   } = marksSection;

//   const showTotCol = showTotal !== false;

//   /* ── per-subject full marks ──────────────────────────────
//      rows[i].fullMarks or rows[i]['Full Marks'] or default 100  */
//   const getFullMarks = (row) =>
//     row.fullMarks ?? row['Full Marks'] ?? row.maxMarks ?? 100;

//   /* ── compute column sums (numeric only) ───────────────── */
//   const colSums = columns.map((col) =>
//     rows.reduce((sum, row) => {
//       const v = row[col];
//       if (v === null || v === undefined || v === '' || v === '-' || v === '—') return sum;
//       if (String(v).toUpperCase() === 'AB') return sum;
//       const n = Number(v);
//       return sum + (Number.isNaN(n) ? 0 : n);
//     }, 0)
//   );
//   const fullMarksSum = rows.reduce((s, r) => s + (Number(getFullMarks(r)) || 0), 0);
//   const totalSum = rows.reduce((s, r) => {
//     const t = r.total;
//     if (!t) return s;
//     // total may be "86/100" or just 86
//     const num = Number(String(t).split('/')[0]);
//     return s + (Number.isNaN(num) ? 0 : num);
//   }, 0);

//   /* ── cell renderer ─────────────────────────────────────── */
//   const renderCell = (row, col) => {
//     const raw = row[col] ?? '—';
//     if (!showGrades) return raw;
//     const fm = getFullMarks(row);
//     const grade = markToGrade(raw, fm);
//     const color = GRADE_COLORS[grade];
//     return (
//       <span style={{ fontWeight: 700, color: color || '#111' }}>{grade}</span>
//     );
//   };

//   return (
//     <section style={{ marginBottom: 6 }}>
//       {/* Header bar + toggle button */}
//       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
//                     background: '#1a5276', padding: '3px 7px' }}>
//         <span style={{ color: '#fff', fontSize: 10, fontWeight: 700,
//                        textTransform: 'uppercase', letterSpacing: '0.06em' }}>
//           छात्र प्रगति तालिका / Student Progress Table
//         </span>
//         {/* Toggle button — hidden when printing/exporting */}
//         <button
//           className="no-print"
//           onClick={() => setShowGrades((g) => !g)}
//           style={{
//             fontSize: 9, fontWeight: 700, padding: '2px 10px',
//             borderRadius: 3, border: '1.5px solid #fff', cursor: 'pointer',
//             background: showGrades ? '#fff' : 'transparent',
//             color: showGrades ? '#1a5276' : '#fff',
//             letterSpacing: '0.04em', transition: 'all 0.15s',
//           }}
//         >
//           {showGrades ? '📊 Show Marks' : '🔡 Convert to Grade'}
//         </button>
//       </div>

//       <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto' }}>
//         <thead>
//           <tr style={{ background: '#1a5276' }}>
//             <Th style={{ background: '#1a5276', textAlign: 'left', width: '20%', color: '#fff' }}>
//               विषय / Subject
//             </Th>
//             {/* Full Marks — always first data column */}
//             <Th style={{ background: '#2471a3', textAlign: 'center', width: '7%', color: '#fff' }}>
//               Full Marks
//             </Th>
//             {columns.map((col) => (
//               <Th key={col} style={{ background: '#1a5276', textAlign: 'center',
//                                      minWidth: 56, color: '#fff' }}>
//                 {col}
//               </Th>
//             ))}
//             {showTotCol && (
//               <Th style={{ background: '#1a5276', textAlign: 'center',
//                            width: '10%', color: '#fff' }}>
//                 कुल / Total
//               </Th>
//             )}
//           </tr>
//         </thead>
//         <tbody>
//           {rows.map((row, i) => (
//             <tr key={i} style={{ background: i % 2 === 0 ? '#f4f9ff' : '#fff' }}>
//               <Td cls="font-medium">{row.subject}</Td>
//               <Td cls="text-center font-semibold" style={{ background: '#eaf3fb' }}>
//                 {getFullMarks(row)}
//               </Td>
//               {columns.map((col) => (
//                 <Td key={col} cls="text-center">{renderCell(row, col)}</Td>
//               ))}
//               {showTotCol && <Td cls="text-center font-bold">{row.total ?? '—'}</Td>}
//             </tr>
//           ))}

//           {/* ── Column sums row ────────────────────────────── */}
//           <tr style={{ background: '#e8f4fd', fontWeight: 700 }}>
//             <Td cls="font-extrabold text-[9.5px]">कुल योग / Sum</Td>
//             <Td cls="text-center font-extrabold" style={{ background: '#d0e8f8' }}>
//               {fullMarksSum || '—'}
//             </Td>
//             {colSums.map((s, i) => (
//               <Td key={i} cls="text-center font-bold">{s}</Td>
//             ))}
//             {showTotCol && (
//               <Td cls="text-center font-bold">{totalSum || '—'}</Td>
//             )}
//           </tr>

//           {/* ── Grand total footer ──────────────────────────── */}
//           <tr style={{ background: '#fef9c3' }}>
//             <Td colSpan={columns.length + 2} cls="font-extrabold text-[10px]">
//               Grand Total
//               {grandTotal != null && grandMax != null && ` : ${grandTotal}/${grandMax}`}
//               {percentage != null && ` (${Number(percentage).toFixed(1)}%)`}
//             </Td>
//             {showTotCol && (
//               <Td cls="text-center font-extrabold" style={{ fontSize: 13 }}>
//                 {grandGrade || '—'}
//               </Td>
//             )}
//           </tr>
//         </tbody>
//       </table>
//     </section>
//   );
// }

// /* ══════════════════════════════════════════════════════════
//    SINGLE GRADE TEST TABLE
// ══════════════════════════════════════════════════════════ */
// function SingleGradeTable({ testName, rows, idx }) {
//   const { head, sub } = palette(idx);
//   return (
//     <div style={{ flex: '1 1 0', minWidth: 0 }}>
//       <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//         <thead>
//           <tr>
//             <Th colSpan={2}
//                 style={{ background: head, color: '#fff', textAlign: 'center',
//                          fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
//               {testName}
//             </Th>
//           </tr>
//           <tr>
//             <Th style={{ background: sub, color: '#fff', textAlign: 'left', width: '75%' }}>
//               विषय / Subject
//             </Th>
//             <Th style={{ background: sub, color: '#fff', textAlign: 'center' }}>ग्रेड</Th>
//           </tr>
//         </thead>
//         <tbody>
//           {rows.map((r, i) => (
//             <tr key={i} style={{ background: i % 2 === 0 ? '#f9f4fd' : '#fff' }}>
//               <Td>{r.subject}</Td>
//               <Td cls="text-center font-bold"
//                   style={{ color: GRADE_COLORS[r.grade] || '#111' }}>
//                 {r.grade}
//               </Td>
//             </tr>
//           ))}
//           {rows.length === 0 && (
//             <tr><Td colSpan={2} cls="text-center" style={{ color: '#aaa' }}>No data</Td></tr>
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// }

// /* ══════════════════════════════════════════════════════════
//    GRADE SECTION  —  one table per test, side by side
// ══════════════════════════════════════════════════════════ */
// function GradeTables({ gradeSection }) {
//   if (!gradeSection?.columns?.length) return null;
//   const { columns, rows = [] } = gradeSection;

//   const tables = columns.map((testName) => {
//     const tableRows = rows
//       .map((row) => ({ subject: row.subject, grade: row[testName] ?? '—' }))
//       .filter((r) => r.subject && !EMPTY_VALS.has(r.grade));
//     return { testName, rows: tableRows };
//   });

//   return (
//     <section style={{ marginBottom: 6 }}>
//       <SecBar bg="#4a235a">ग्रेड प्रगति / Grade Progress</SecBar>
//       <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start', flexWrap: 'wrap' }}>
//         {tables.map((t, i) => (
//           <SingleGradeTable key={t.testName} testName={t.testName} rows={t.rows} idx={i} />
//         ))}
//       </div>
//     </section>
//   );
// }

// /* ══════════════════════════════════════════════════════════
//    PDF EXPORT  — html2canvas → jsPDF
//    Works directly on the .src-sheet element.
//    The "no-print" class hides the toggle button from the export.
// ══════════════════════════════════════════════════════════ */
// async function exportToPDF(sheetEl, filename = 'report-card.pdf') {
//   if (!sheetEl) throw new Error('Sheet element not found');

//   // Dynamically load libs if not already present
//   const loadScript = (src) =>
//     new Promise((res, rej) => {
//       if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
//       const s = document.createElement('script');
//       s.src = src;
//       s.onload = res;
//       s.onerror = rej;
//       document.head.appendChild(s);
//     });

//   await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
//   await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');

//   // Temporarily hide no-print elements
//   const noPrint = sheetEl.querySelectorAll('.no-print');
//   noPrint.forEach((el) => { el.style.visibility = 'hidden'; });

//   try {
//     const canvas = await window.html2canvas(sheetEl, {
//       scale: 2,
//       useCORS: true,
//       backgroundColor: '#ffffff',
//       logging: false,
//     });

//     const imgData = canvas.toDataURL('image/png');
//     const { jsPDF } = window.jspdf;
//     const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

//     const pageW = pdf.internal.pageSize.getWidth();
//     const pageH = pdf.internal.pageSize.getHeight();
//     const imgW = pageW;
//     const imgH = (canvas.height / canvas.width) * imgW;

//     // If content taller than one page, split across pages
//     let yPos = 0;
//     while (yPos < imgH) {
//       if (yPos > 0) pdf.addPage();
//       pdf.addImage(imgData, 'PNG', 0, -yPos, imgW, imgH);
//       yPos += pageH;
//     }

//     pdf.save(filename);
//   } finally {
//     noPrint.forEach((el) => { el.style.visibility = ''; });
//   }
// }

// /* ══════════════════════════════════════════════════════════
//    MAIN COMPONENT
// ══════════════════════════════════════════════════════════ */
// export default function StudentReportCard({ data, onDownloadPDF }) {
//   const sheetRef = useRef(null);

//   if (!data) return null;

//   const { student = {}, school = {}, marksSection, gradeSection } = data;

//   const schoolName = student.schoolName || school.name || 'School Name Here';
//   const schoolAddr = [student.block || school.block, student.district || school.district]
//     .filter(Boolean).join(', ') || 'Block, District, State';
//   const session   = data.session   || '2024–25';
//   const className = data.className || student.class || '';

//   const handlePDF = async () => {
//     if (onDownloadPDF) { onDownloadPDF(); return; }
//     const st = student;
//     const fname = `report-${st.rollNo || st.name || 'student'}.pdf`;
//     await exportToPDF(sheetRef.current, fname);
//   };

//   return (
//     <>
//       {/* ── Action bar (outside the printable sheet) ─────── */}
//       <div className="no-print"
//            style={{ display: 'flex', gap: 8, marginBottom: 8, justifyContent: 'flex-end' }}>
//         <button
//           onClick={handlePDF}
//           style={{
//             fontSize: 11, fontWeight: 700, padding: '5px 16px',
//             borderRadius: 4, border: 'none', cursor: 'pointer',
//             background: '#1a5276', color: '#fff', display: 'flex',
//             alignItems: 'center', gap: 6,
//           }}
//         >
//           ⬇ Download PDF
//         </button>
//         <button
//           onClick={() => {
//             const noPrint = sheetRef.current?.querySelectorAll('.no-print');
//             noPrint?.forEach((el) => { el.style.display = 'none'; });
//             window.print();
//             noPrint?.forEach((el) => { el.style.display = ''; });
//           }}
//           style={{
//             fontSize: 11, fontWeight: 700, padding: '5px 16px',
//             borderRadius: 4, border: '1.5px solid #1a5276', cursor: 'pointer',
//             background: '#fff', color: '#1a5276', display: 'flex',
//             alignItems: 'center', gap: 6,
//           }}
//         >
//           🖨 Print
//         </button>
//       </div>

//       {/* ── A4 Sheet ─────────────────────────────────────── */}
//       <div
//         ref={sheetRef}
//         className="src-sheet bg-white text-gray-900"
//         style={{
//           width: 794, minHeight: 1000,
//           margin: '0 auto', padding: '18px 22px',
//           fontFamily: '"Times New Roman", Times, serif',
//           fontSize: 11, border: '3px double #1a1a1a',
//           boxSizing: 'border-box', position: 'relative', overflow: 'hidden',
//         }}
//       >
//         {/* watermark */}
//         <div style={{
//           position: 'absolute', top: '50%', left: '50%',
//           transform: 'translate(-50%,-50%) rotate(-30deg)',
//           fontSize: 88, fontWeight: 900, color: '#1a5276', opacity: 0.04,
//           pointerEvents: 'none', zIndex: 0, whiteSpace: 'nowrap',
//         }}>MPSEC</div>

//         <div style={{ position: 'relative', zIndex: 1 }}>

//           {/* ── HEADER ──────────────────────────────────── */}
//           <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
//             <Logo label="State Logo" />
//             <div style={{ flex: 1, textAlign: 'center' }}>
//               <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
//                             letterSpacing: '0.06em', color: '#1a3a6b' }}>
//                 राज्य शिक्षा केन्द्र (म.प्र.) | State Education Centre (M.P.)
//               </div>
//               <div style={{ fontSize: 16, fontWeight: 900, letterSpacing: '0.12em',
//                             textTransform: 'uppercase', color: '#1a3a6b', margin: '3px 0' }}>
//                 Holistic Progress Report
//               </div>
//               <div style={{ fontSize: 11, fontWeight: 700, color: '#1a5276' }}>
//                 कक्षा / Class :&nbsp;<u>{className || '—'}</u>
//                 &nbsp;&nbsp;|&nbsp;&nbsp;
//                 सत्र / Session :&nbsp;<u>{session}</u>
//               </div>
//             </div>
//             <Logo label="School Logo" />
//           </div>

//           {/* school banner */}
//           <div style={{ borderTop: '2px solid #1a1a1a', borderBottom: '2px solid #1a1a1a',
//                         background: '#eaf0fb', textAlign: 'center',
//                         padding: '4px 0', marginBottom: 5 }}>
//             <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
//                           letterSpacing: '0.05em' }}>{schoolName}</div>
//             <div style={{ fontSize: 9, color: '#555' }}>{schoolAddr}</div>
//           </div>

//           {/* ── STUDENT INFO ────────────────────────────── */}
//           <div style={{ display: 'flex', gap: 0, marginBottom: 5 }}>
//             <table style={{ flex: 1, borderCollapse: 'collapse',
//                             tableLayout: 'fixed', fontSize: 9 }}>
//               <tbody>
//                 <InfoRow l1="पिता का नाम / Father"    v1={student.fatherName}
//                          l2="माता का नाम / Mother"    v2={student.motherName} />
//                 <InfoRow l1="जन्म तिथि (अंक) / DOB"  v1={student.dob}
//                          l2="जन्म तिथि (शब्द) / DOB" v2={student.dobWords} />
//                 <InfoRow l1="समग्र आईडी / Samagra ID" v1={student.samgraId}
//                          l2="रोल नं. / Roll No"        v2={student.rollNo} />
//                 <InfoRow l1="समग्र नाम / Samagra Name" v1={student.samgraName}
//                          l2="आधार आईडी / Aadhaar"     v2={student.aadhaarId} />
//                 <InfoRow l1="पंजी क्र. / Scholar No"  v1={student.scholarNo}
//                          l2="DISE Code"                v2={student.dise} />
//                 <InfoRow l1="दिव्यांग / Special Need" v1={student.specialNeed || 'No'}
//                          l2="जिला / District"          v2={student.district} />
//                 <InfoRow l1="विद्यालय / School"       v1={student.schoolName}
//                          l2="ब्लॉक / Block"           v2={student.block} />
//               </tbody>
//             </table>

//             {/* photo */}
//             <div style={{ width: 104, border: '1px solid #555', display: 'flex',
//                           flexDirection: 'column', alignItems: 'center',
//                           justifyContent: 'center', gap: 4, padding: 4 }}>
//               {student.photo
//                 ? <img src={student.photo} alt="Student"
//                        style={{ width: 86, height: 104, objectFit: 'cover',
//                                 border: '1px solid #aaa' }} />
//                 : (
//                   <div style={{ width: 86, height: 104, border: '1px solid #aaa',
//                                 background: '#f5f5f5', display: 'flex',
//                                 flexDirection: 'column', alignItems: 'center',
//                                 justifyContent: 'center', color: '#bbb', fontSize: 8.5 }}>
//                     <svg width="30" height="30" viewBox="0 0 24 24" fill="none"
//                          stroke="currentColor" strokeWidth="1.5">
//                       <circle cx="12" cy="8" r="4" />
//                       <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
//                     </svg>
//                     Photo
//                   </div>
//                 )}
//               <span style={{ fontSize: 8, fontWeight: 700, color: '#fff',
//                              background: '#1a5276', padding: '2px 10px', borderRadius: 2 }}>
//                 {student.category || 'General'}
//               </span>
//             </div>
//           </div>

//           {/* ── MARKS TABLE ─────────────────────────────── */}
//           <MarksTable marksSection={marksSection} />

//           {/* ── GRADE TABLES ────────────────────────────── */}
//           <GradeTables gradeSection={gradeSection} />

//           {/* ── GRADE SCALE ─────────────────────────────── */}
//           <section style={{ marginBottom: 5 }}>
//             <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//               <thead>
//                 <tr>
//                   <th colSpan={GRADE_SCALE.length}
//                       style={{ background: '#1a5276', color: '#fff', fontSize: 9.5,
//                                fontWeight: 700, textAlign: 'center', padding: '3px 4px',
//                                border: '1px solid #444', textTransform: 'uppercase',
//                                letterSpacing: '0.05em' }}>
//                     ग्रेड प्रतिशत मापक / Grade Percentage Scale
//                   </th>
//                 </tr>
//                 <tr>
//                   {GRADE_SCALE.map(({ g, bg }) => (
//                     <th key={g} style={{ background: bg, color: '#fff', fontSize: 10,
//                                          fontWeight: 700, textAlign: 'center',
//                                          padding: '3px 4px', border: '1px solid #444' }}>
//                       {g}
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 <tr>
//                   {GRADE_SCALE.map(({ g, r }) => (
//                     <td key={g} style={{ textAlign: 'center', fontSize: 9.5,
//                                          padding: '3px 4px', border: '1px solid #444' }}>
//                       {r}
//                     </td>
//                   ))}
//                 </tr>
//               </tbody>
//             </table>
//           </section>

//           {/* ── RESULT ──────────────────────────────────── */}
//           <div style={{ border: '2px solid #555', padding: '6px 12px',
//                         background: '#eafaf1', textAlign: 'center', marginBottom: 10 }}>
//             <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
//                           letterSpacing: '0.1em', color: '#1a6b3a', marginBottom: 3 }}>
//               परीक्षा परिणाम / Exam Result
//             </div>
//             <div style={{ display: 'flex', justifyContent: 'center', gap: 30, fontSize: 10.5 }}>
//               <span>
//                 <span style={{ fontWeight: 600 }}>परिणाम / Result: </span>
//                 <span style={{ fontWeight: 900, color: '#1a6b3a' }}>
//                   {data.result?.examResult || marksSection?.footer?.overallResult || '—'}
//                 </span>
//               </span>
//               <span>
//                 <span style={{ fontWeight: 600 }}>वर्तमान कक्षा / Current Class: </span>
//                 <span style={{ fontWeight: 700 }}>{data.result?.currentClass || className || '—'}</span>
//               </span>
//               <span>
//                 <span style={{ fontWeight: 600 }}>प्रोन्नति / Promoted To: </span>
//                 <span style={{ fontWeight: 900, color: '#1a3a6b' }}>{data.result?.promotedTo || '—'}</span>
//               </span>
//             </div>
//           </div>

//           {/* ── SIGNATURES ──────────────────────────────── */}
//           <div style={{ display: 'flex', justifyContent: 'space-between',
//                         alignItems: 'flex-end', marginTop: 6 }}>
//             <div style={{ textAlign: 'center' }}>
//               <div style={{ borderBottom: '1px solid #444', width: 165, height: 32, marginBottom: 3 }} />
//               <div style={{ fontSize: 9 }}>कक्षा अध्यापक के हस्ताक्षर</div>
//               <div style={{ fontSize: 9, fontWeight: 700 }}>Signature of Class Teacher</div>
//             </div>
//             <div style={{ fontSize: 8, color: '#bbb', textAlign: 'center' }}>
//               School Management System
//             </div>
//             <div style={{ textAlign: 'center' }}>
//               <div style={{ borderBottom: '1px solid #444', width: 165, height: 32, marginBottom: 3 }} />
//               <div style={{ fontSize: 9 }}>प्रधानाचार्य के हस्ताक्षर एवं मुहर</div>
//               <div style={{ fontSize: 9, fontWeight: 700 }}>Signature &amp; Stamp – Head of Institution</div>
//             </div>
//           </div>

//         </div>
//       </div>
//     </>
//   );
// }


/**
 * StudentReportCard.jsx
 * Holistic Progress Report – Madhya Pradesh State Education Centre
 *
 * Changes in this version:
 *  1. PDF export uses html2canvas + jsPDF — captures ONLY the .src-sheet element
 *     (header to footer/signatures), never the action buttons
 *  2. html2canvas loaded eagerly so colors render faithfully on first click
 *  3. allowTaint: true + foreignObjectRendering: false for full color fidelity
 *  4. .no-print elements set to visibility:hidden during export (no layout shift)
 *  5. Marks table: "Full Marks" first column + per-column sum row at bottom
 *  6. Toggle button (Marks ↔ Grade) converts score cells into grade letters
 *     (Full Marks column and the sum row are always excluded from conversion)
 *
 * Props:
 *   data – exact output of normalizeReportCard() from reportUtils.js
 *   onDownloadPDF – optional override; if omitted the built-in html2canvas export is used
 */

import React, { useState, useRef } from 'react';

/* ══════════════════════════════════════════════════════════
   GRADE CONVERSION HELPERS
══════════════════════════════════════════════════════════ */
/**
 * Convert a numeric mark to a letter grade.
 * fullMarks is the maximum for that cell so we can compute %.
 * Falls back to absolute thresholds (out of 100) if fullMarks unknown.
 */
function markToGrade(value, fullMarks) {
  if (value === null || value === undefined || value === '' || value === '-' || value === '—') return '—';
  if (String(value).toUpperCase() === 'AB') return 'AB';
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  const max = Number(fullMarks) || 100;
  const pct = (num / max) * 100;
  if (pct >= 91) return 'A+';
  if (pct >= 76) return 'A';
  if (pct >= 61) return 'B+';
  if (pct >= 46) return 'B';
  if (pct >= 33) return 'C';
  if (pct >= 21) return 'D';
  return 'E';
}

const GRADE_COLORS = {
  'A+': '#1a8a4a', A: '#27ae60', 'B+': '#2980b9',
  B: '#1a5276', C: '#b8860b', D: '#e67e22', E: '#c0392b',
};

/* ══════════════════════════════════════════════════════════
   CONSTANTS / STATIC DATA
══════════════════════════════════════════════════════════ */
const GRADE_SCALE = [
  { g: 'A+', r: '91–100', bg: '#1a8a4a' },
  { g: 'A',  r: '76–90',  bg: '#27ae60' },
  { g: 'B+', r: '61–75',  bg: '#2980b9' },
  { g: 'B',  r: '46–60',  bg: '#1a5276' },
  { g: 'C',  r: '33–45',  bg: '#b8860b' },
  { g: 'D',  r: '21–32',  bg: '#e67e22' },
  { g: 'E',  r: '00–20',  bg: '#c0392b' },
];

const GRADE_PALETTES = [
  { head: '#4a235a', sub: '#7d3c98' },
  { head: '#1a3a6b', sub: '#2471a3' },
  { head: '#145a32', sub: '#1e8449' },
  { head: '#6e2f1a', sub: '#ba4a00' },
];
const palette = (i) => GRADE_PALETTES[i % GRADE_PALETTES.length];

const EMPTY_VALS = new Set(['-', '—', '', null, undefined]);

/* ══════════════════════════════════════════════════════════
   SMALL UI HELPERS
══════════════════════════════════════════════════════════ */
const Td = ({ children, cls = '', style, colSpan }) => (
  <td colSpan={colSpan} style={style}
      className={`border border-gray-600 px-[6px] py-[3px] text-[10px] leading-snug ${cls}`}>
    {children ?? '—'}
  </td>
);

const Th = ({ children, cls = '', style, colSpan, rowSpan }) => (
  <th colSpan={colSpan} rowSpan={rowSpan} style={style}
      className={`border border-gray-600 px-[6px] py-[4px] text-[9.5px] font-bold leading-snug ${cls}`}>
    {children}
  </th>
);

const Logo = ({ label }) => (
  <div style={{
    width: 64, height: 64, borderRadius: '50%', border: '2px solid #555',
    background: '#fef9e7', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: 8, color: '#777',
    textAlign: 'center', flexShrink: 0,
  }}>{label}</div>
);

const SecBar = ({ children, bg = '#1a5276' }) => (
  <div style={{
    background: bg, color: '#fff', fontSize: 10, fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.06em', padding: '3px 7px',
  }}>{children}</div>
);

const InfoRow = ({ l1, v1, l2, v2 }) => (
  <tr>
    <td className="border border-gray-500 px-[6px] py-[3px] text-[9px] font-semibold leading-snug"
        style={{ background: '#d6e4f7', width: '22%' }}>{l1}</td>
    <td className="border border-gray-500 px-[6px] py-[3px] text-[10px] leading-snug"
        style={{ width: '28%' }}>{v1 || '—'}</td>
    <td className="border border-gray-500 px-[6px] py-[3px] text-[9px] font-semibold leading-snug"
        style={{ background: '#d6e4f7', width: '22%' }}>{l2}</td>
    <td className="border border-gray-500 px-[6px] py-[3px] text-[10px] leading-snug"
        style={{ width: '28%' }}>{v2 || '—'}</td>
  </tr>
);

/* ══════════════════════════════════════════════════════════
   MARKS TABLE
   • First column: Full Marks (always numeric, never converted)
   • Toggle button: convert score cells ↔ grade letters
   • Last data row: per-column sum of obtained marks
══════════════════════════════════════════════════════════ */
function MarksTable({ marksSection }) {
  const [showGrades, setShowGrades] = useState(false);

  if (!marksSection?.columns?.length) return null;

  const {
    columns, rows = [],
    grandTotal, grandMax, percentage, grandGrade, showTotal,
  } = marksSection;

  const showTotCol = showTotal !== false;

  /* ── per-subject full marks ──────────────────────────────
     rows[i].fullMarks or rows[i]['Full Marks'] or default 100  */
  const getFullMarks = (row) =>
    row.fullMarks ?? row['Full Marks'] ?? row.maxMarks ?? 100;

  /* ── compute column sums (numeric only) ───────────────── */
  const colSums = columns.map((col) =>
    rows.reduce((sum, row) => {
      const v = row[col];
      if (v === null || v === undefined || v === '' || v === '-' || v === '—') return sum;
      if (String(v).toUpperCase() === 'AB') return sum;
      const n = Number(v);
      return sum + (Number.isNaN(n) ? 0 : n);
    }, 0)
  );
  const fullMarksSum = rows.reduce((s, r) => s + (Number(getFullMarks(r)) || 0), 0);
  const totalSum = rows.reduce((s, r) => {
    const t = r.total;
    if (!t) return s;
    const num = Number(String(t).split('/')[0]);
    return s + (Number.isNaN(num) ? 0 : num);
  }, 0);

  /* ── cell renderer ─────────────────────────────────────── */
  const renderCell = (row, col) => {
    const raw = row[col] ?? '—';
    if (!showGrades) return raw;
    const fm = getFullMarks(row);
    const grade = markToGrade(raw, fm);
    const color = GRADE_COLORS[grade];
    return (
      <span style={{ fontWeight: 700, color: color || '#111' }}>{grade}</span>
    );
  };

  return (
    <section style={{ marginBottom: 6 }}>
      {/* Header bar + toggle button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: '#1a5276', padding: '3px 7px' }}>
        <span style={{ color: '#fff', fontSize: 10, fontWeight: 700,
                       textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          छात्र प्रगति तालिका / Student Progress Table
        </span>
        {/* Toggle button — hidden when printing/exporting */}
        <button
          className="no-print"
          onClick={() => setShowGrades((g) => !g)}
          style={{
            fontSize: 9, fontWeight: 700, padding: '2px 10px',
            borderRadius: 3, border: '1.5px solid #fff', cursor: 'pointer',
            background: showGrades ? '#fff' : 'transparent',
            color: showGrades ? '#1a5276' : '#fff',
            letterSpacing: '0.04em', transition: 'all 0.15s',
          }}
        >
          {showGrades ? '📊 Show Marks' : '🔡 Convert to Grade'}
        </button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto' }}>
        <thead>
          <tr style={{ background: '#1a5276' }}>
            <Th style={{ background: '#1a5276', textAlign: 'left', width: '20%', color: '#fff' }}>
              विषय / Subject
            </Th>
            {/* Full Marks — always first data column */}
            <Th style={{ background: '#2471a3', textAlign: 'center', width: '7%', color: '#fff' }}>
              Full Marks
            </Th>
            {columns.map((col) => (
              <Th key={col} style={{ background: '#1a5276', textAlign: 'center',
                                     minWidth: 56, color: '#fff' }}>
                {col}
              </Th>
            ))}
            {showTotCol && (
              <Th style={{ background: '#1a5276', textAlign: 'center',
                           width: '10%', color: '#fff' }}>
                कुल / Total
              </Th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? '#f4f9ff' : '#fff' }}>
              <Td cls="font-medium">{row.subject}</Td>
              <Td cls="text-center font-semibold" style={{ background: '#eaf3fb' }}>
                {getFullMarks(row)}
              </Td>
              {columns.map((col) => (
                <Td key={col} cls="text-center">{renderCell(row, col)}</Td>
              ))}
              {showTotCol && <Td cls="text-center font-bold">{row.total ?? '—'}</Td>}
            </tr>
          ))}

          {/* ── Column sums row ────────────────────────────── */}
          <tr style={{ background: '#e8f4fd', fontWeight: 700 }}>
            <Td cls="font-extrabold text-[9.5px]">कुल योग / Sum</Td>
            <Td cls="text-center font-extrabold" style={{ background: '#d0e8f8' }}>
              {fullMarksSum || '—'}
            </Td>
            {colSums.map((s, i) => (
              <Td key={i} cls="text-center font-bold">{s}</Td>
            ))}
            {showTotCol && (
              <Td cls="text-center font-bold">{totalSum || '—'}</Td>
            )}
          </tr>

          {/* ── Grand total footer ──────────────────────────── */}
          <tr style={{ background: '#fef9c3' }}>
            <Td colSpan={columns.length + 2} cls="font-extrabold text-[10px]">
              Grand Total
              {grandTotal != null && grandMax != null && ` : ${grandTotal}/${grandMax}`}
              {percentage != null && ` (${Number(percentage).toFixed(1)}%)`}
            </Td>
            {showTotCol && (
              <Td cls="text-center font-extrabold" style={{ fontSize: 13 }}>
                {grandGrade || '—'}
              </Td>
            )}
          </tr>
        </tbody>
      </table>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   SINGLE GRADE TEST TABLE
══════════════════════════════════════════════════════════ */
function SingleGradeTable({ testName, rows, idx }) {
  const { head, sub } = palette(idx);
  return (
    <div style={{ flex: '1 1 0', minWidth: 0 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <Th colSpan={2}
                style={{ background: head, color: '#fff', textAlign: 'center',
                         fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {testName}
            </Th>
          </tr>
          <tr>
            <Th style={{ background: sub, color: '#fff', textAlign: 'left', width: '75%' }}>
              विषय / Subject
            </Th>
            <Th style={{ background: sub, color: '#fff', textAlign: 'center' }}>ग्रेड</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? '#f9f4fd' : '#fff' }}>
              <Td>{r.subject}</Td>
              <Td cls="text-center font-bold"
                  style={{ color: GRADE_COLORS[r.grade] || '#111' }}>
                {r.grade}
              </Td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><Td colSpan={2} cls="text-center" style={{ color: '#aaa' }}>No data</Td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   GRADE SECTION  —  one table per test, side by side
══════════════════════════════════════════════════════════ */
function GradeTables({ gradeSection }) {
  if (!gradeSection?.columns?.length) return null;
  const { columns, rows = [] } = gradeSection;

  const tables = columns.map((testName) => {
    const tableRows = rows
      .map((row) => ({ subject: row.subject, grade: row[testName] ?? '—' }))
      .filter((r) => r.subject && !EMPTY_VALS.has(r.grade));
    return { testName, rows: tableRows };
  });

  return (
    <section style={{ marginBottom: 6 }}>
      <SecBar bg="#4a235a">ग्रेड प्रगति / Grade Progress</SecBar>
      <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {tables.map((t, i) => (
          <SingleGradeTable key={t.testName} testName={t.testName} rows={t.rows} idx={i} />
        ))}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   PDF EXPORT  — html2canvas → jsPDF
   ─────────────────────────────────────────────────────────
   KEY FIX: captures ONLY the .src-sheet element (the A4 div),
   which excludes the Download/Print action buttons entirely.
   • allowTaint: true  — preserves all colored backgrounds
   • foreignObjectRendering: false — avoids blank-page bug in Chrome
   • .no-print visibility:hidden during capture (no layout shift)
   • Multi-page: splits tall sheets across A4 pages automatically
══════════════════════════════════════════════════════════ */
async function exportToPDF(sheetEl, filename = 'report-card.pdf') {
  if (!sheetEl) throw new Error('Sheet element not found');

  // Dynamically load libs if not already present
  const loadScript = (src) =>
    new Promise((res, rej) => {
      if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
      const s = document.createElement('script');
      s.src = src;
      s.onload = res;
      s.onerror = rej;
      document.head.appendChild(s);
    });

  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');

  // Hide no-print elements without changing layout (visibility vs display)
  const noPrint = sheetEl.querySelectorAll('.no-print');
  noPrint.forEach((el) => { el.style.visibility = 'hidden'; });

  try {
    const canvas = await window.html2canvas(sheetEl, {
      scale: 2,
      useCORS: true,
      allowTaint: true,               // ← preserves all background colors
      foreignObjectRendering: false,  // ← avoids blank-page bug in Chrome
      backgroundColor: '#ffffff',
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const imgW = pageW;
    const imgH = (canvas.height / canvas.width) * imgW;

    // Split content across pages if taller than one A4 page
    let yPos = 0;
    while (yPos < imgH) {
      if (yPos > 0) pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, -yPos, imgW, imgH);
      yPos += pageH;
    }

    pdf.save(filename);
  } finally {
    // Always restore visibility
    noPrint.forEach((el) => { el.style.visibility = ''; });
  }
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
export default function StudentReportCard({ data, onDownloadPDF }) {
  const sheetRef = useRef(null);

  if (!data) return null;

  const { student = {}, school = {}, marksSection, gradeSection } = data;

  const schoolName = student.schoolName || school.name || 'School Name Here';
  const schoolAddr = [student.block || school.block, student.district || school.district]
    .filter(Boolean).join(', ') || 'Block, District, State';
  const session   = data.session   || '2024–25';
  const className = data.className || student.class || '';

  const handlePDF = async () => {
    if (onDownloadPDF) { onDownloadPDF(); return; }
    const st = student;
    const fname = `report-${st.rollNo || st.name || 'student'}.pdf`;
    // sheetRef.current points to the A4 sheet div ONLY — buttons are outside it
    await exportToPDF(sheetRef.current, fname);
  };

  return (
    <>
      {/* ── Action bar (outside the printable sheet, never captured in PDF) ── */}
      <div className="no-print"
           style={{ display: 'flex', gap: 8, marginBottom: 8, justifyContent: 'flex-end' }}>
        <button
          onClick={handlePDF}
          style={{
            fontSize: 11, fontWeight: 700, padding: '5px 16px',
            borderRadius: 4, border: 'none', cursor: 'pointer',
            background: '#1a5276', color: '#fff', display: 'flex',
            alignItems: 'center', gap: 6,
          }}
        >
          ⬇ Download PDF
        </button>
        <button
          onClick={() => {
            const noPrint = sheetRef.current?.querySelectorAll('.no-print');
            noPrint?.forEach((el) => { el.style.display = 'none'; });
            window.print();
            noPrint?.forEach((el) => { el.style.display = ''; });
          }}
          style={{
            fontSize: 11, fontWeight: 700, padding: '5px 16px',
            borderRadius: 4, border: '1.5px solid #1a5276', cursor: 'pointer',
            background: '#fff', color: '#1a5276', display: 'flex',
            alignItems: 'center', gap: 6,
          }}
        >
          🖨 Print
        </button>
      </div>

      {/* ── A4 Sheet — sheetRef captures this element ONLY ─────────────────── */}
      <div
        ref={sheetRef}
        className="src-sheet bg-white text-gray-900"
        style={{
          width: 794, minHeight: 1000,
          margin: '0 auto', padding: '18px 22px',
          fontFamily: '"Times New Roman", Times, serif',
          fontSize: 11, border: '3px double #1a1a1a',
          boxSizing: 'border-box', position: 'relative', overflow: 'hidden',
        }}
      >
        {/* watermark */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%) rotate(-30deg)',
          fontSize: 88, fontWeight: 900, color: '#1a5276', opacity: 0.04,
          pointerEvents: 'none', zIndex: 0, whiteSpace: 'nowrap',
        }}>MPSEC</div>

        <div style={{ position: 'relative', zIndex: 1 }}>

          {/* ── HEADER ──────────────────────────────────── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Logo label="State Logo" />
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                            letterSpacing: '0.06em', color: '#1a3a6b' }}>
                राज्य शिक्षा केन्द्र (म.प्र.) | State Education Centre (M.P.)
              </div>
              <div style={{ fontSize: 16, fontWeight: 900, letterSpacing: '0.12em',
                            textTransform: 'uppercase', color: '#1a3a6b', margin: '3px 0' }}>
                Holistic Progress Report
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#1a5276' }}>
                कक्षा / Class :&nbsp;<u>{className || '—'}</u>
                &nbsp;&nbsp;|&nbsp;&nbsp;
                सत्र / Session :&nbsp;<u>{session}</u>
              </div>
            </div>
            <Logo label="School Logo" />
          </div>

          {/* school banner */}
          <div style={{ borderTop: '2px solid #1a1a1a', borderBottom: '2px solid #1a1a1a',
                        background: '#eaf0fb', textAlign: 'center',
                        padding: '4px 0', marginBottom: 5 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                          letterSpacing: '0.05em' }}>{schoolName}</div>
            <div style={{ fontSize: 9, color: '#555' }}>{schoolAddr}</div>
          </div>

          {/* ── STUDENT INFO ────────────────────────────── */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 5 }}>
            <table style={{ flex: 1, borderCollapse: 'collapse',
                            tableLayout: 'fixed', fontSize: 9 }}>
              <tbody>
                <InfoRow l1="पिता का नाम / Father"    v1={student.fatherName}
                         l2="माता का नाम / Mother"    v2={student.motherName} />
                <InfoRow l1="जन्म तिथि (अंक) / DOB"  v1={student.dob}
                         l2="जन्म तिथि (शब्द) / DOB" v2={student.dobWords} />
                <InfoRow l1="समग्र आईडी / Samagra ID" v1={student.samgraId}
                         l2="रोल नं. / Roll No"        v2={student.rollNo} />
                <InfoRow l1="समग्र नाम / Samagra Name" v1={student.samgraName}
                         l2="आधार आईडी / Aadhaar"     v2={student.aadhaarId} />
                <InfoRow l1="पंजी क्र. / Scholar No"  v1={student.scholarNo}
                         l2="DISE Code"                v2={student.dise} />
                <InfoRow l1="दिव्यांग / Special Need" v1={student.specialNeed || 'No'}
                         l2="जिला / District"          v2={student.district} />
                <InfoRow l1="विद्यालय / School"       v1={student.schoolName}
                         l2="ब्लॉक / Block"           v2={student.block} />
              </tbody>
            </table>

            {/* photo */}
            <div style={{ width: 104, border: '1px solid #555', display: 'flex',
                          flexDirection: 'column', alignItems: 'center',
                          justifyContent: 'center', gap: 4, padding: 4 }}>
              {student.photo
                ? <img src={student.photo} alt="Student"
                       style={{ width: 86, height: 104, objectFit: 'cover',
                                border: '1px solid #aaa' }} />
                : (
                  <div style={{ width: 86, height: 104, border: '1px solid #aaa',
                                background: '#f5f5f5', display: 'flex',
                                flexDirection: 'column', alignItems: 'center',
                                justifyContent: 'center', color: '#bbb', fontSize: 8.5 }}>
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" strokeWidth="1.5">
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                    </svg>
                    Photo
                  </div>
                )}
              <span style={{ fontSize: 8, fontWeight: 700, color: '#fff',
                             background: '#1a5276', padding: '2px 10px', borderRadius: 2 }}>
                {student.category || 'General'}
              </span>
            </div>
          </div>

          {/* ── MARKS TABLE ─────────────────────────────── */}
          <MarksTable marksSection={marksSection} />

          {/* ── GRADE TABLES ────────────────────────────── */}
          <GradeTables gradeSection={gradeSection} />

          {/* ── GRADE SCALE ─────────────────────────────── */}
          <section style={{ marginBottom: 5 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th colSpan={GRADE_SCALE.length}
                      style={{ background: '#1a5276', color: '#fff', fontSize: 9.5,
                               fontWeight: 700, textAlign: 'center', padding: '3px 4px',
                               border: '1px solid #444', textTransform: 'uppercase',
                               letterSpacing: '0.05em' }}>
                    ग्रेड प्रतिशत मापक / Grade Percentage Scale
                  </th>
                </tr>
                <tr>
                  {GRADE_SCALE.map(({ g, bg }) => (
                    <th key={g} style={{ background: bg, color: '#fff', fontSize: 10,
                                         fontWeight: 700, textAlign: 'center',
                                         padding: '3px 4px', border: '1px solid #444' }}>
                      {g}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {GRADE_SCALE.map(({ g, r }) => (
                    <td key={g} style={{ textAlign: 'center', fontSize: 9.5,
                                         padding: '3px 4px', border: '1px solid #444' } }>
                      {r}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </section>

          {/* ── RESULT ──────────────────────────────────── */}
          <div style={{ border: '2px solid #555', padding: '6px 12px',
                        background: '#eafaf1', textAlign: 'center', marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                          letterSpacing: '0.1em', color: '#1a6b3a', marginBottom: 3 }}>
              परीक्षा परिणाम / Exam Result
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 30, fontSize: 10.5 }}>
              <span>
                <span style={{ fontWeight: 600 }}>परिणाम / Result: </span>
                <span style={{ fontWeight: 900, color: '#1a6b3a' }}>
                  {data.result?.examResult || marksSection?.footer?.overallResult || '—'}
                </span>
              </span>
              <span>
                <span style={{ fontWeight: 600 }}>वर्तमान कक्षा / Current Class: </span>
                <span style={{ fontWeight: 700 }}>{data.result?.currentClass || className || '—'}</span>
              </span>
              <span>
                <span style={{ fontWeight: 600 }}>प्रोन्नति / Promoted To: </span>
                <span style={{ fontWeight: 900, color: '#1a3a6b' }}>{data.result?.promotedTo || '—'}</span>
              </span>
            </div>
          </div>

          {/* ── SIGNATURES ──────────────────────────────── */}
          <div style={{ display: 'flex', justifyContent: 'space-between',
                        alignItems: 'flex-end', marginTop: 6 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ borderBottom: '1px solid #444', width: 165, height: 32, marginBottom: 3 }} />
              <div style={{ fontSize: 9 }}>कक्षा अध्यापक के हस्ताक्षर</div>
              <div style={{ fontSize: 9, fontWeight: 700 }}>Signature of Class Teacher</div>
            </div>
            <div style={{ fontSize: 8, color: '#bbb', textAlign: 'center' }}>
              School Management System
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ borderBottom: '1px solid #444', width: 165, height: 32, marginBottom: 3 }} />
              <div style={{ fontSize: 9 }}>प्रधानाचार्य के हस्ताक्षर एवं मुहर</div>
              <div style={{ fontSize: 9, fontWeight: 700 }}>Signature &amp; Stamp – Head of Institution</div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}