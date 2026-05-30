import { Router } from 'express';
import {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  getClasses,
  exportStudents,
  importStudents,
  uploadStudentDocument,
  getStudentDocuments,
  deleteStudentDocument,
} from '../controllers/studentController.js';
import { protect } from '../middleware/auth.js';
import { requireSession } from '../middleware/sessionGuard.js';
import { uploadStudentPhoto, uploadStudentDocument as uploadDocumentMiddleware } from '../middleware/upload.js';

const router = Router();

router.use(protect, requireSession);
router.get('/', getStudents);
router.get('/classes', getClasses);
router.get('/export', exportStudents);
router.post('/import', importStudents);
router.get('/:id', getStudent);
router.post('/', uploadStudentPhoto, createStudent);
router.put('/:id', uploadStudentPhoto, updateStudent);
router.delete('/:id', deleteStudent);

// Document routes
router.post('/:id/documents', uploadDocumentMiddleware, uploadStudentDocument);
router.get('/:id/documents', getStudentDocuments);
router.delete('/:id/documents/:documentId', deleteStudentDocument);

export default router;
