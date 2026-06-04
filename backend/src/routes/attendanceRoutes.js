import { Router } from 'express';
import {
  saveAttendance,
  getAttendance,
  getStudentAttendance,
} from '../controllers/attendanceController.js';
import { protect } from '../middleware/auth.js';
import { requireSession } from '../middleware/sessionGuard.js';

const router = Router();

router.use(protect, requireSession);

router.post('/', saveAttendance);
router.get('/', getAttendance);
router.get('/student/:studentId', getStudentAttendance);

export default router;
