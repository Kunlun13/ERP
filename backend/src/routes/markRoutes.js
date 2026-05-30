import { Router } from 'express';
import {
  getMarksByTest,
  getMarksByStudent,
  saveMarks,
  bulkSaveMarks,
} from '../controllers/markController.js';
import { protect } from '../middleware/auth.js';
import { requireSession } from '../middleware/sessionGuard.js';

const router = Router();

router.use(protect, requireSession);
router.get('/', getMarksByTest);
router.get('/student/:studentId', getMarksByStudent);
router.post('/', saveMarks);
router.post('/bulk', bulkSaveMarks);

export default router;
