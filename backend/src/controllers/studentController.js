// // import asyncHandler from '../utils/asyncHandler.js';
// // import ApiError from '../utils/ApiError.js';
// // import Student from '../models/Student.js';
// // import StudentDocument from '../models/StudentDocument.js';
// // import { logActivity } from '../services/activityService.js';
// // import { cascadeDeleteStudent, cleanupOrphanMarks } from '../services/cascadeService.js';
// // import { ACTIVITY_TYPES } from '../config/constants.js';
// // import { getStudentAnalysis } from '../services/analyticsService.js';
// // import fs from 'fs';
// // import path from 'path';

// // export const getStudents = asyncHandler(async (req, res) => {
// //   const { class: className, search, page = 1, limit = 20 } = req.query;
// //   const query = { sessionId: req.sessionId, isActive: true };

// //   if (className) query.class = className;
// //   if (search) {
// //     query.$or = [
// //       { name: { $regex: search, $options: 'i' } },
// //       { rollNo: { $regex: search, $options: 'i' } },
// //     ];
// //   }

// //   const skip = (parseInt(page) - 1) * parseInt(limit);
// //   const [students, total] = await Promise.all([
// //     Student.find(query).sort({ rollNo: 1 }).skip(skip).limit(parseInt(limit)),
// //     Student.countDocuments(query),
// //   ]);

// //   res.json({
// //     success: true,
// //     data: students,
// //     pagination: {
// //       page: parseInt(page),
// //       limit: parseInt(limit),
// //       total,
// //       pages: Math.ceil(total / parseInt(limit)),
// //     },
// //   });
// // });

// // export const getStudent = asyncHandler(async (req, res) => {
// //   const student = await Student.findOne({
// //     _id: req.params.id,
// //     sessionId: req.sessionId,
// //     isActive: true,
// //   });
// //   if (!student) throw ApiError.notFound('Student not found');

// //   const analysis = await getStudentAnalysis(req.sessionId, student._id);

// //   res.json({
// //     success: true,
// //     data: { student, marksSummary: analysis?.testPerformance ?? [] },
// //   });
// // });

// // export const createStudent = asyncHandler(async (req, res) => {
// //   const data = { ...req.body, sessionId: req.sessionId, createdBy: req.user._id, isActive: true };

// //   // Handle multiple image files
// //   if (req.files && typeof req.files === 'object') {
// //     Object.entries(req.files).forEach(([fieldName, files]) => {
// //       if (Array.isArray(files) && files.length > 0) {
// //         data[fieldName] = `/uploads/students/${files[0].filename}`;
// //       }
// //     });
// //   }

// //   // Get standard field keys to exclude from customFields
// //   const standardFields = ['name', 'rollNo', 'class', 'section', 'fatherName', 'motherName', 'mobileNo', 'email', 'address', 'dob', 'gender', 'bloodGroup', 'photo', 'customFields'];
  
// //   // Collect custom fields (any field not in the standard list)
// //   const customFields = {};
// //   Object.entries(data).forEach(([key, value]) => {
// //     if (!standardFields.includes(key) && value && typeof value === 'string' && !key.endsWith('Card') && !key.endsWith('Certificate') && key !== 'otherDocument') {
// //       customFields[key] = value;
// //     }
// //   });

// //   // Store image fields separately (they're already in data)
// //   const imageFields = {};
// //   Object.entries(data).forEach(([key, value]) => {
// //     if ((key.endsWith('Card') || key.endsWith('Certificate') || key === 'otherDocument') && value) {
// //       imageFields[key] = value;
// //     }
// //   });

// //   // Store custom fields if any exist
// //   if (Object.keys(customFields).length > 0) {
// //     data.customFields = customFields;
// //   }

// //   // Store image field paths in customFields as well for document tracking
// //   if (Object.keys(imageFields).length > 0) {
// //     data.customFields = { ...data.customFields, ...imageFields };
// //   }

// //   // Remove custom field keys from data (they'll be in customFields map)
// //   Object.keys(customFields).forEach((key) => delete data[key]);

// //   // Handle legacy customFields JSON string format
// //   if (req.body.customFields && typeof req.body.customFields === 'string') {
// //     try {
// //       data.customFields = { ...data.customFields, ...JSON.parse(req.body.customFields) };
// //     } catch {
// //       // Ignore if JSON parsing fails
// //     }
// //   }

// //   const activeDuplicate = await Student.findOne({
// //     sessionId: req.sessionId,
// //     class: data.class,
// //     rollNo: data.rollNo,
// //     isActive: true,
// //   });
// //   if (activeDuplicate) {
// //     throw ApiError.badRequest(
// //       `Roll number ${data.rollNo} already exists in class ${data.class} for this session`
// //     );
// //   }

// //   // Remove soft-deleted records that block the same roll number
// //   await Student.deleteMany({
// //     sessionId: req.sessionId,
// //     class: data.class,
// //     rollNo: data.rollNo,
// //     isActive: false,
// //   });

// //   const student = await Student.create(data);

// //   await logActivity({
// //     userId: req.user._id,
// //     sessionId: req.sessionId,
// //     action: ACTIVITY_TYPES.CREATE,
// //     module: 'students',
// //     description: `Added student ${student.name}`,
// //     metadata: { studentId: student._id },
// //   });

// //   res.status(201).json({ success: true, data: student });
// // });

// // export const updateStudent = asyncHandler(async (req, res) => {
// //   const updates = { ...req.body, updatedBy: req.user._id };

// //   // Handle multiple image files
// //   if (req.files && typeof req.files === 'object') {
// //     Object.entries(req.files).forEach(([fieldName, files]) => {
// //       if (Array.isArray(files) && files.length > 0) {
// //         updates[fieldName] = `/uploads/students/${files[0].filename}`;
// //       }
// //     });
// //   }

// //   // Get standard field keys to exclude from customFields
// //   const standardFields = ['name', 'rollNo', 'class', 'section', 'fatherName', 'motherName', 'mobileNo', 'email', 'address', 'dob', 'gender', 'bloodGroup', 'photo', 'customFields', 'updatedBy'];
  
// //   // Collect custom fields (any field not in the standard list)
// //   const customFields = {};
// //   Object.entries(updates).forEach(([key, value]) => {
// //     if (!standardFields.includes(key) && value && typeof value === 'string' && !key.endsWith('Card') && !key.endsWith('Certificate') && key !== 'otherDocument') {
// //       customFields[key] = value;
// //     }
// //   });

// //   // Store image fields separately (they're already in updates)
// //   const imageFields = {};
// //   Object.entries(updates).forEach(([key, value]) => {
// //     if ((key.endsWith('Card') || key.endsWith('Certificate') || key === 'otherDocument') && value) {
// //       imageFields[key] = value;
// //     }
// //   });

// //   // Store custom fields if any exist
// //   if (Object.keys(customFields).length > 0) {
// //     updates.customFields = customFields;
// //   }

// //   // Store image field paths in customFields as well for document tracking
// //   if (Object.keys(imageFields).length > 0) {
// //     updates.customFields = { ...updates.customFields, ...imageFields };
// //   }

// //   // Remove custom field keys from updates (they'll be in customFields map)
// //   Object.keys(customFields).forEach((key) => delete updates[key]);

// //   // Handle legacy customFields JSON string format
// //   if (req.body.customFields && typeof req.body.customFields === 'string') {
// //     try {
// //       updates.customFields = { ...updates.customFields, ...JSON.parse(req.body.customFields) };
// //     } catch {
// //       // Ignore if JSON parsing fails
// //     }
// //   }

// //   const student = await Student.findOneAndUpdate(
// //     { _id: req.params.id, sessionId: req.sessionId },
// //     updates,
// //     { new: true, runValidators: true }
// //   );

// //   if (!student) throw ApiError.notFound('Student not found');

// //   res.json({ success: true, data: student });
// // });

// // export const deleteStudent = asyncHandler(async (req, res) => {
// //   const student = await Student.findOne({
// //     _id: req.params.id,
// //     sessionId: req.sessionId,
// //     isActive: true,
// //   });

// //   if (!student) throw ApiError.notFound('Student not found');

// //   const { marksDeleted } = await cascadeDeleteStudent(req.sessionId, student._id);
// //   await cleanupOrphanMarks(req.sessionId);

// //   // Hard delete so roll number can be reused (soft delete blocked unique index)
// //   await Student.findByIdAndDelete(student._id);

// //   await logActivity({
// //     userId: req.user._id,
// //     sessionId: req.sessionId,
// //     action: ACTIVITY_TYPES.DELETE,
// //     module: 'students',
// //     description: `Deleted student ${student.name} and ${marksDeleted} mark record(s)`,
// //     metadata: { studentId: student._id, marksDeleted },
// //   });

// //   res.json({
// //     success: true,
// //     message: 'Student and all related marks deleted',
// //     data: { marksDeleted },
// //   });
// // });

// // export const getClasses = asyncHandler(async (req, res) => {
// //   const classes = await Student.distinct('class', { sessionId: req.sessionId, isActive: true });
// //   res.json({ success: true, data: classes.sort() });
// // });

// // export const exportStudents = asyncHandler(async (req, res) => {
// //   const students = await Student.find({ sessionId: req.sessionId, isActive: true }).sort('class rollNo');
// //   res.json({ success: true, data: students });
// // });

// // export const importStudents = asyncHandler(async (req, res) => {
// //   const { students } = req.body;
// //   if (!Array.isArray(students) || students.length === 0) {
// //     throw ApiError.badRequest('Students array is required');
// //   }

// //   const docs = students.map((s) => ({
// //     ...s,
// //     sessionId: req.sessionId,
// //     createdBy: req.user._id,
// //   }));

// //   const result = await Student.insertMany(docs, { ordered: false }).catch((err) => {
// //     return { inserted: err.insertedDocs || [], errors: err.writeErrors?.length || 0 };
// //   });

// //   res.status(201).json({
// //     success: true,
// //     data: Array.isArray(result) ? result : result.inserted,
// //     message: `Imported ${Array.isArray(result) ? result.length : result.inserted?.length || 0} students`,
// //   });
// // });

// // // Document management
// // export const uploadStudentDocument = asyncHandler(async (req, res) => {
// //   const { id } = req.params;
// //   const { documentType, title } = req.body;

// //   if (!documentType) {
// //     if (req.file) fs.unlinkSync(req.file.path);
// //     throw ApiError.badRequest('Document type is required');
// //   }

// //   const student = await Student.findOne({
// //     _id: id,
// //     sessionId: req.sessionId,
// //     isActive: true,
// //   });

// //   if (!student) {
// //     if (req.file) fs.unlinkSync(req.file.path);
// //     throw ApiError.notFound('Student not found');
// //   }

// //   if (!req.file) {
// //     throw ApiError.badRequest('Document file is required');
// //   }

// //   const document = await StudentDocument.create({
// //     studentId: student._id,
// //     sessionId: req.sessionId,
// //     documentType,
// //     title: title || documentType,
// //     filePath: `/uploads/documents/${req.file.filename}`,
// //     fileName: req.file.originalname,
// //     fileSize: req.file.size,
// //     mimeType: req.file.mimetype,
// //     uploadedBy: req.user._id,
// //   });

// //   await logActivity({
// //     userId: req.user._id,
// //     sessionId: req.sessionId,
// //     action: ACTIVITY_TYPES.CREATE,
// //     module: 'student-documents',
// //     description: `Uploaded ${documentType} document for student ${student.name}`,
// //     metadata: { studentId: student._id, documentId: document._id },
// //   });

// //   res.status(201).json({ success: true, data: document });
// // });

// // export const getStudentDocuments = asyncHandler(async (req, res) => {
// //   const { id } = req.params;

// //   const student = await Student.findOne({
// //     _id: id,
// //     sessionId: req.sessionId,
// //     isActive: true,
// //   });

// //   if (!student) throw ApiError.notFound('Student not found');

// //   const documents = await StudentDocument.find({
// //     studentId: student._id,
// //     sessionId: req.sessionId,
// //   }).sort({ createdAt: -1 });

// //   res.json({ success: true, data: documents });
// // });

// // export const deleteStudentDocument = asyncHandler(async (req, res) => {
// //   const { id, documentId } = req.params;

// //   const student = await Student.findOne({
// //     _id: id,
// //     sessionId: req.sessionId,
// //     isActive: true,
// //   });

// //   if (!student) throw ApiError.notFound('Student not found');

// //   const document = await StudentDocument.findOneAndDelete({
// //     _id: documentId,
// //     studentId: student._id,
// //     sessionId: req.sessionId,
// //   });

// //   if (!document) throw ApiError.notFound('Document not found');

// //   // Delete file from disk
// //   try {
// //     const filePath = path.join(
// //       process.cwd(),
// //       'backend',
// //       document.filePath.replace(/^\//, '')
// //     );
// //     if (fs.existsSync(filePath)) {
// //       fs.unlinkSync(filePath);
// //     }
// //   } catch (err) {
// //     console.error('Error deleting document file:', err);
// //   }

// //   await logActivity({
// //     userId: req.user._id,
// //     sessionId: req.sessionId,
// //     action: ACTIVITY_TYPES.DELETE,
// //     module: 'student-documents',
// //     description: `Deleted ${document.documentType} document for student ${student.name}`,
// //     metadata: { studentId: student._id, documentId: document._id },
// //   });

// //   res.json({ success: true, message: 'Document deleted successfully' });
// // });



// import asyncHandler from '../utils/asyncHandler.js';
// import ApiError from '../utils/ApiError.js';
// import Student from '../models/Student.js';
// import StudentDocument from '../models/StudentDocument.js';
// import { logActivity } from '../services/activityService.js';
// import { cascadeDeleteStudent, cleanupOrphanMarks } from '../services/cascadeService.js';
// import { ACTIVITY_TYPES } from '../config/constants.js';
// import { getStudentAnalysis } from '../services/analyticsService.js';
// import fs from 'fs';
// import path from 'path';

// // Fields that are stored as top-level Student model properties.
// // Everything else goes into customFields map (text) or top-level (images).
// const STANDARD_FIELDS = new Set([
//   'name', 'rollNo', 'class', 'section',
//   'fatherName', 'motherName', 'mobileNo',
//   'email', 'address', 'dob', 'gender',
//   'bloodGroup', 'photo', 'customFields',
//   'sessionId', 'createdBy', 'updatedBy', 'isActive',
// ]);

// /**
//  * Attach uploaded files to the data object.
//  * upload.any() gives req.files as a flat array:
//  *   [{ fieldname: 'photo', filename: '...' }, { fieldname: 'aadhaarCard', filename: '...' }, ...]
//  */
// function attachUploadedFiles(data, files) {
//   if (!Array.isArray(files)) return;
//   files.forEach(({ fieldname, filename }) => {
//     data[fieldname] = `/uploads/students/${filename}`;
//   });
// }

// /**
//  * Separate body fields into:
//  *  - standard fields  → stay at top level of data
//  *  - uploaded image fields → already set by attachUploadedFiles, stay at top level
//  *  - everything else  → goes into data.customFields
//  */
// function separateCustomFields(data, uploadedFieldNames) {
//   const customFields = { ...(data.customFields || {}) };

//   Object.keys(data).forEach((key) => {
//     if (STANDARD_FIELDS.has(key)) return;          // keep at top level
//     if (uploadedFieldNames.has(key)) return;        // image field, keep at top level
//     const value = data[key];
//     if (value !== undefined && value !== null && value !== '') {
//       customFields[key] = value;
//     }
//     delete data[key];
//   });

//   if (Object.keys(customFields).length > 0) {
//     data.customFields = customFields;
//   }
// }

// export const getStudents = asyncHandler(async (req, res) => {
//   const { class: className, search, page = 1, limit = 20 } = req.query;
//   const query = { sessionId: req.sessionId, isActive: true };

//   if (className) query.class = className;
//   if (search) {
//     query.$or = [
//       { name: { $regex: search, $options: 'i' } },
//       { rollNo: { $regex: search, $options: 'i' } },
//     ];
//   }

//   const skip = (parseInt(page) - 1) * parseInt(limit);
//   const [students, total] = await Promise.all([
//     Student.find(query).sort({ rollNo: 1 }).skip(skip).limit(parseInt(limit)),
//     Student.countDocuments(query),
//   ]);

//   res.json({
//     success: true,
//     data: students,
//     pagination: {
//       page: parseInt(page),
//       limit: parseInt(limit),
//       total,
//       pages: Math.ceil(total / parseInt(limit)),
//     },
//   });
// });

// export const getStudent = asyncHandler(async (req, res) => {
//   const student = await Student.findOne({
//     _id: req.params.id,
//     sessionId: req.sessionId,
//     isActive: true,
//   });
//   if (!student) throw ApiError.notFound('Student not found');

//   const analysis = await getStudentAnalysis(req.sessionId, student._id);

//   res.json({
//     success: true,
//     data: { student, marksSummary: analysis?.testPerformance ?? [] },
//   });
// });

// export const createStudent = asyncHandler(async (req, res) => {
//   const data = {
//     ...req.body,
//     sessionId: req.sessionId,
//     createdBy: req.user._id,
//     isActive: true,
//   };

//   // 1. Attach all uploaded files (works for any field name from dynamic templates)
//   attachUploadedFiles(data, req.files);
//   const uploadedFieldNames = new Set((req.files || []).map((f) => f.fieldname));

//   // 2. Handle legacy customFields JSON string (e.g. from import or old clients)
//   if (typeof req.body.customFields === 'string') {
//     try {
//       data.customFields = JSON.parse(req.body.customFields);
//     } catch {
//       // ignore malformed JSON
//     }
//   }

//   // 3. Move non-standard, non-image body fields into customFields
//   separateCustomFields(data, uploadedFieldNames);

//   // 4. Duplicate roll number check
//   const activeDuplicate = await Student.findOne({
//     sessionId: req.sessionId,
//     class: data.class,
//     rollNo: data.rollNo,
//     isActive: true,
//   });
//   if (activeDuplicate) {
//     throw ApiError.badRequest(
//       `Roll number ${data.rollNo} already exists in class ${data.class} for this session`
//     );
//   }

//   // 5. Remove soft-deleted records that would block the same roll number
//   await Student.deleteMany({
//     sessionId: req.sessionId,
//     class: data.class,
//     rollNo: data.rollNo,
//     isActive: false,
//   });

//   const student = await Student.create(data);

//   await logActivity({
//     userId: req.user._id,
//     sessionId: req.sessionId,
//     action: ACTIVITY_TYPES.CREATE,
//     module: 'students',
//     description: `Added student ${student.name}`,
//     metadata: { studentId: student._id },
//   });

//   res.status(201).json({ success: true, data: student });
// });

// export const updateStudent = asyncHandler(async (req, res) => {
//   const updates = { ...req.body, updatedBy: req.user._id };

//   // 1. Attach all uploaded files
//   attachUploadedFiles(updates, req.files);
//   const uploadedFieldNames = new Set((req.files || []).map((f) => f.fieldname));

//   // 2. Handle legacy customFields JSON string
//   if (typeof req.body.customFields === 'string') {
//     try {
//       updates.customFields = JSON.parse(req.body.customFields);
//     } catch {
//       // ignore
//     }
//   }

//   // 3. Move non-standard, non-image body fields into customFields
//   separateCustomFields(updates, uploadedFieldNames);

//   const student = await Student.findOneAndUpdate(
//     { _id: req.params.id, sessionId: req.sessionId },
//     updates,
//     { new: true, runValidators: true }
//   );

//   if (!student) throw ApiError.notFound('Student not found');

//   res.json({ success: true, data: student });
// });

// export const deleteStudent = asyncHandler(async (req, res) => {
//   const student = await Student.findOne({
//     _id: req.params.id,
//     sessionId: req.sessionId,
//     isActive: true,
//   });

//   if (!student) throw ApiError.notFound('Student not found');

//   const { marksDeleted } = await cascadeDeleteStudent(req.sessionId, student._id);
//   await cleanupOrphanMarks(req.sessionId);

//   // Hard delete so roll number can be reused
//   await Student.findByIdAndDelete(student._id);

//   await logActivity({
//     userId: req.user._id,
//     sessionId: req.sessionId,
//     action: ACTIVITY_TYPES.DELETE,
//     module: 'students',
//     description: `Deleted student ${student.name} and ${marksDeleted} mark record(s)`,
//     metadata: { studentId: student._id, marksDeleted },
//   });

//   res.json({
//     success: true,
//     message: 'Student and all related marks deleted',
//     data: { marksDeleted },
//   });
// });

// export const getClasses = asyncHandler(async (req, res) => {
//   const classes = await Student.distinct('class', { sessionId: req.sessionId, isActive: true });
//   res.json({ success: true, data: classes.sort() });
// });

// export const exportStudents = asyncHandler(async (req, res) => {
//   const students = await Student.find({ sessionId: req.sessionId, isActive: true }).sort('class rollNo');
//   res.json({ success: true, data: students });
// });

// export const importStudents = asyncHandler(async (req, res) => {
//   const { students } = req.body;
//   if (!Array.isArray(students) || students.length === 0) {
//     throw ApiError.badRequest('Students array is required');
//   }

//   const docs = students.map((s) => ({
//     ...s,
//     sessionId: req.sessionId,
//     createdBy: req.user._id,
//   }));

//   const result = await Student.insertMany(docs, { ordered: false }).catch((err) => {
//     return { inserted: err.insertedDocs || [], errors: err.writeErrors?.length || 0 };
//   });

//   res.status(201).json({
//     success: true,
//     data: Array.isArray(result) ? result : result.inserted,
//     message: `Imported ${Array.isArray(result) ? result.length : result.inserted?.length || 0} students`,
//   });
// });

// // ─── Document management ────────────────────────────────────────────────────

// export const uploadStudentDocument = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   const { documentType, title } = req.body;

//   if (!documentType) {
//     if (req.file) fs.unlinkSync(req.file.path);
//     throw ApiError.badRequest('Document type is required');
//   }

//   const student = await Student.findOne({
//     _id: id,
//     sessionId: req.sessionId,
//     isActive: true,
//   });

//   if (!student) {
//     if (req.file) fs.unlinkSync(req.file.path);
//     throw ApiError.notFound('Student not found');
//   }

//   if (!req.file) {
//     throw ApiError.badRequest('Document file is required');
//   }

//   const document = await StudentDocument.create({
//     studentId: student._id,
//     sessionId: req.sessionId,
//     documentType,
//     title: title || documentType,
//     filePath: `/uploads/documents/${req.file.filename}`,
//     fileName: req.file.originalname,
//     fileSize: req.file.size,
//     mimeType: req.file.mimetype,
//     uploadedBy: req.user._id,
//   });

//   await logActivity({
//     userId: req.user._id,
//     sessionId: req.sessionId,
//     action: ACTIVITY_TYPES.CREATE,
//     module: 'student-documents',
//     description: `Uploaded ${documentType} document for student ${student.name}`,
//     metadata: { studentId: student._id, documentId: document._id },
//   });

//   res.status(201).json({ success: true, data: document });
// });

// export const getStudentDocuments = asyncHandler(async (req, res) => {
//   const { id } = req.params;

//   const student = await Student.findOne({
//     _id: id,
//     sessionId: req.sessionId,
//     isActive: true,
//   });

//   if (!student) throw ApiError.notFound('Student not found');

//   const documents = await StudentDocument.find({
//     studentId: student._id,
//     sessionId: req.sessionId,
//   }).sort({ createdAt: -1 });

//   res.json({ success: true, data: documents });
// });

// export const deleteStudentDocument = asyncHandler(async (req, res) => {
//   const { id, documentId } = req.params;

//   const student = await Student.findOne({
//     _id: id,
//     sessionId: req.sessionId,
//     isActive: true,
//   });

//   if (!student) throw ApiError.notFound('Student not found');

//   const document = await StudentDocument.findOneAndDelete({
//     _id: documentId,
//     studentId: student._id,
//     sessionId: req.sessionId,
//   });

//   if (!document) throw ApiError.notFound('Document not found');

//   // Delete file from disk
//   try {
//     const filePath = path.join(
//       process.cwd(),
//       'backend',
//       document.filePath.replace(/^\//, '')
//     );
//     if (fs.existsSync(filePath)) {
//       fs.unlinkSync(filePath);
//     }
//   } catch (err) {
//     console.error('Error deleting document file:', err);
//   }

//   await logActivity({
//     userId: req.user._id,
//     sessionId: req.sessionId,
//     action: ACTIVITY_TYPES.DELETE,
//     module: 'student-documents',
//     description: `Deleted ${document.documentType} document for student ${student.name}`,
//     metadata: { studentId: student._id, documentId: document._id },
//   });

//   res.json({ success: true, message: 'Document deleted successfully' });
// });



import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import Student from '../models/Student.js';
import StudentDocument from '../models/StudentDocument.js';
import StudentFieldTemplate from '../models/StudentFieldTemplate.js';
import { logActivity } from '../services/activityService.js';
import { cascadeDeleteStudent, cleanupOrphanMarks } from '../services/cascadeService.js';
import { ACTIVITY_TYPES } from '../config/constants.js';
import { getStudentAnalysis } from '../services/analyticsService.js';
import fs from 'fs';
import path from 'path';

// ── Standard fields stored as top-level Student document properties ─────────
// Everything the template defines outside this set goes into customFields map.
const STANDARD_FIELDS = new Set([
  'name', 'rollNo', 'class', 'section',
  'fatherName', 'motherName', 'mobileNo',
  'email', 'address', 'dob', 'gender',
  'bloodGroup', 'photo', 'customFields',
  'sessionId', 'createdBy', 'updatedBy', 'isActive',
]);

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Attach uploaded files (from upload.any()) to the data object.
 * req.files is a flat array: [{ fieldname, filename }, ...]
 */
function attachUploadedFiles(data, files) {
  if (!Array.isArray(files)) return;
  files.forEach((file) => {
    // Cloudinary stores the URL in file.path
    data[file.fieldname] = file.path || `/uploads/students/${file.filename}`;
  });
}

/**
 * Move non-standard, non-image body fields into data.customFields.
 * uploadedFieldNames is a Set of field names that have image files attached
 * (they stay at the top level of the Student document).
 */
function separateCustomFields(data, uploadedFieldNames) {
  const customFields = { ...(data.customFields || {}) };

  Object.keys(data).forEach((key) => {
    if (STANDARD_FIELDS.has(key))    return; // top-level standard field
    if (uploadedFieldNames.has(key)) return; // uploaded image field, keep top-level
    const value = data[key];
    if (value !== undefined && value !== null && value !== '') {
      customFields[key] = value;
    }
    delete data[key];
  });

  if (Object.keys(customFields).length > 0) {
    data.customFields = customFields;
  }
}

/**
 * Fetch the latest saved template for the session and return only the field
 * keys it defines.  Falls back to null when no template exists (no filtering).
 */
async function getTemplateFieldKeys(sessionId) {
  const template = await StudentFieldTemplate.findOne({ sessionId }).lean();
  if (!template || !Array.isArray(template.fields)) return null;
  return new Set(template.fields.map((f) => f.key));
}

/**
 * Strip any body / customFields keys that are NOT in the latest template.
 * This ensures a new student is created with only the currently-saved template fields.
 *
 * @param {object}   data              - Mutable data object being built
 * @param {Set}      templateFieldKeys - Keys allowed by the template
 * @param {Set}      uploadedFieldNames- Keys that have an image upload
 */
function enforceTemplateFields(data, templateFieldKeys, uploadedFieldNames) {
  if (!templateFieldKeys) return; // no template → allow everything (backward-compat)

  // Filter top-level standard fields not in the template
  Object.keys(data).forEach((key) => {
    // Always preserve system/internal fields
    if (['sessionId', 'createdBy', 'updatedBy', 'isActive', 'customFields'].includes(key)) return;
    // rollNo and class are always required for the student record
    if (['rollNo', 'class', 'section'].includes(key)) return;

    if (!templateFieldKeys.has(key)) {
      delete data[key];
    }
  });

  // Filter custom fields not in the template
  if (data.customFields && typeof data.customFields === 'object') {
    Object.keys(data.customFields).forEach((key) => {
      if (!templateFieldKeys.has(key)) {
        delete data.customFields[key];
      }
    });
  }
}

// ── Controllers ───────────────────────────────────────────────────────────────

export const getStudents = asyncHandler(async (req, res) => {
  const { class: className, search, page = 1, limit = 20 } = req.query;
  const query = { sessionId: req.sessionId, isActive: true };

  if (className) query.class = className;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { rollNo: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [students, total] = await Promise.all([
    Student.find(query).sort({ rollNo: 1 }).skip(skip).limit(parseInt(limit)),
    Student.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: students,
    pagination: {
      page:  parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

export const getStudent = asyncHandler(async (req, res) => {
  const student = await Student.findOne({
    _id: req.params.id,
    sessionId: req.sessionId,
    isActive: true,
  });
  if (!student) throw ApiError.notFound('Student not found');

  // Also return the latest template so the frontend can render dynamic fields
  const template = await StudentFieldTemplate.findOne({ sessionId: req.sessionId }).lean();

  const analysis = await getStudentAnalysis(req.sessionId, student._id);

  res.json({
    success: true,
    data: {
      student,
      template: template || null,
      marksSummary: analysis?.testPerformance ?? [],
    },
  });
});

export const createStudent = asyncHandler(async (req, res) => {
  const data = {
    ...req.body,
    sessionId: req.sessionId,
    createdBy: req.user._id,
    isActive:  true,
  };

  // 1. Attach all uploaded files (supports any field name from dynamic templates)
  attachUploadedFiles(data, req.files);
  const uploadedFieldNames = new Set((req.files || []).map((f) => f.fieldname));

  // 2. Handle legacy customFields JSON string (e.g. from import or old clients)
  if (typeof req.body.customFields === 'string') {
    try {
      data.customFields = JSON.parse(req.body.customFields);
    } catch {
      // ignore malformed JSON
    }
  }

  // 2a. Validate required fields
  const requiredFields = ['name', 'rollNo', 'class'];
  const missingFields = [];
  requiredFields.forEach((field) => {
    const value = data[field];
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      missingFields.push(field);
    }
  });

  if (missingFields.length > 0) {
    throw ApiError.badRequest(
      `Missing required fields: ${missingFields.join(', ')}`
    );
  }

  // 3. Move non-standard, non-image body fields into customFields map
  separateCustomFields(data, uploadedFieldNames);

  // 4. Enforce latest template — strip any field not in current template
  const templateFieldKeys = await getTemplateFieldKeys(req.sessionId);
  enforceTemplateFields(data, templateFieldKeys, uploadedFieldNames);

  // 5. Validate template-defined required fields
  if (templateFieldKeys) {
    const template = await StudentFieldTemplate.findOne({ sessionId: req.sessionId }).lean();
    const requiredTemplateFields = template?.fields?.filter((f) => f.required) || [];
    
    const templateErrors = [];
    requiredTemplateFields.forEach((field) => {
      const isStandardField = STANDARD_FIELDS.has(field.key);
      const value = isStandardField ? data[field.key] : data.customFields?.[field.key];
      
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        templateErrors.push(field.label || field.key);
      }
    });

    if (templateErrors.length > 0) {
      throw ApiError.badRequest(
        `Missing required fields: ${templateErrors.join(', ')}`
      );
    }
  }

  // 6. Duplicate roll number check (active students only)
  const activeDuplicate = await Student.findOne({
    sessionId: req.sessionId,
    class:     data.class,
    rollNo:    data.rollNo,
    isActive:  true,
  });
  if (activeDuplicate) {
    throw ApiError.badRequest(
      `Roll number ${data.rollNo} already exists in class ${data.class} for this session`
    );
  }

  // 7. Remove soft-deleted records that would block the same roll number
  await Student.deleteMany({
    sessionId: req.sessionId,
    class:     data.class,
    rollNo:    data.rollNo,
    isActive:  false,
  });

  const student = await Student.create(data);

  await logActivity({
    userId:      req.user._id,
    sessionId:   req.sessionId,
    action:      ACTIVITY_TYPES.CREATE,
    module:      'students',
    description: `Added student ${student.name}`,
    metadata:    { studentId: student._id },
  });

  res.status(201).json({ success: true, data: student });
});

export const updateStudent = asyncHandler(async (req, res) => {
  const updates = { ...req.body, updatedBy: req.user._id };

  // 1. Attach all uploaded files
  attachUploadedFiles(updates, req.files);
  const uploadedFieldNames = new Set((req.files || []).map((f) => f.fieldname));

  // 2. Handle legacy customFields JSON string
  if (typeof req.body.customFields === 'string') {
    try {
      updates.customFields = JSON.parse(req.body.customFields);
    } catch {
      // ignore
    }
  }

  // 3. Move non-standard, non-image body fields into customFields
  separateCustomFields(updates, uploadedFieldNames);

  const student = await Student.findOneAndUpdate(
    { _id: req.params.id, sessionId: req.sessionId },
    updates,
    { new: true, runValidators: true }
  );

  if (!student) throw ApiError.notFound('Student not found');

  await logActivity({
    userId:      req.user._id,
    sessionId:   req.sessionId,
    action:      ACTIVITY_TYPES.UPDATE,
    module:      'students',
    description: `Updated student ${student.name}`,
    metadata:    { studentId: student._id },
  });

  res.json({ success: true, data: student });
});

export const deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findOne({
    _id: req.params.id,
    sessionId: req.sessionId,
    isActive: true,
  });

  if (!student) throw ApiError.notFound('Student not found');

  const { marksDeleted } = await cascadeDeleteStudent(req.sessionId, student._id);
  await cleanupOrphanMarks(req.sessionId);

  // Hard delete so roll number can be reused
  await Student.findByIdAndDelete(student._id);

  await logActivity({
    userId:      req.user._id,
    sessionId:   req.sessionId,
    action:      ACTIVITY_TYPES.DELETE,
    module:      'students',
    description: `Deleted student ${student.name} and ${marksDeleted} mark record(s)`,
    metadata:    { studentId: student._id, marksDeleted },
  });

  res.json({
    success: true,
    message: 'Student and all related marks deleted',
    data: { marksDeleted },
  });
});

export const getClasses = asyncHandler(async (req, res) => {
  const classes = await Student.distinct('class', { sessionId: req.sessionId, isActive: true });
  res.json({ success: true, data: classes.sort() });
});

export const exportStudents = asyncHandler(async (req, res) => {
  const students = await Student.find({ sessionId: req.sessionId, isActive: true }).sort('class rollNo');
  res.json({ success: true, data: students });
});

export const importStudents = asyncHandler(async (req, res) => {
  const { students } = req.body;
  if (!Array.isArray(students) || students.length === 0) {
    throw ApiError.badRequest('Students array is required');
  }

  const docs = students.map((s) => ({
    ...s,
    sessionId: req.sessionId,
    createdBy: req.user._id,
  }));

  const result = await Student.insertMany(docs, { ordered: false }).catch((err) => {
    return { inserted: err.insertedDocs || [], errors: err.writeErrors?.length || 0 };
  });

  res.status(201).json({
    success: true,
    data:    Array.isArray(result) ? result : result.inserted,
    message: `Imported ${Array.isArray(result) ? result.length : result.inserted?.length || 0} students`,
  });
});

// ── Document management ───────────────────────────────────────────────────────

export const uploadStudentDocument = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { documentType, title } = req.body;

  if (!documentType) {
    throw ApiError.badRequest('Document type is required');
  }

  const student = await Student.findOne({
    _id: id,
    sessionId: req.sessionId,
    isActive: true,
  });

  if (!student) {
    throw ApiError.notFound('Student not found');
  }

  if (!req.file) throw ApiError.badRequest('Document file is required');

  // Cloudinary stores the URL in req.file.path
  const document = await StudentDocument.create({
    studentId:    student._id,
    sessionId:    req.sessionId,
    documentType,
    title:        title || documentType,
    filePath:     req.file.path || `/uploads/documents/${req.file.filename}`,
    fileName:     req.file.originalname,
    fileSize:     req.file.size,
    mimeType:     req.file.mimetype,
    uploadedBy:   req.user._id,
  });

  await logActivity({
    userId:      req.user._id,
    sessionId:   req.sessionId,
    action:      ACTIVITY_TYPES.CREATE,
    module:      'student-documents',
    description: `Uploaded ${documentType} document for student ${student.name}`,
    metadata:    { studentId: student._id, documentId: document._id },
  });

  res.status(201).json({ success: true, data: document });
});

export const getStudentDocuments = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const student = await Student.findOne({
    _id: id,
    sessionId: req.sessionId,
    isActive: true,
  });

  if (!student) throw ApiError.notFound('Student not found');

  const documents = await StudentDocument.find({
    studentId: student._id,
    sessionId: req.sessionId,
  }).sort({ createdAt: -1 });

  res.json({ success: true, data: documents });
});

export const deleteStudentDocument = asyncHandler(async (req, res) => {
  const { id, documentId } = req.params;

  const student = await Student.findOne({
    _id: id,
    sessionId: req.sessionId,
    isActive: true,
  });

  if (!student) throw ApiError.notFound('Student not found');

  const document = await StudentDocument.findOneAndDelete({
    _id:       documentId,
    studentId: student._id,
    sessionId: req.sessionId,
  });

  if (!document) throw ApiError.notFound('Document not found');

  try {
    const filePath = path.join(process.cwd(), 'backend', document.filePath.replace(/^\//, ''));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (err) {
    console.error('Error deleting document file:', err);
  }

  await logActivity({
    userId:      req.user._id,
    sessionId:   req.sessionId,
    action:      ACTIVITY_TYPES.DELETE,
    module:      'student-documents',
    description: `Deleted ${document.documentType} document for student ${student.name}`,
    metadata:    { studentId: student._id, documentId: document._id },
  });

  res.json({ success: true, message: 'Document deleted successfully' });
});