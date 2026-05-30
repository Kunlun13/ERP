import { Router } from 'express';
import { classAnalysis, studentAnalysis } from '../controllers/analyticsController.js';
import { protect } from '../middleware/auth.js';
import { requireSession } from '../middleware/sessionGuard.js';

const router = Router();

router.use(protect, requireSession);
router.get('/class', classAnalysis);
router.get('/student/:studentId', studentAnalysis);

export default router;
