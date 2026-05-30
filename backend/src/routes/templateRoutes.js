import { Router } from 'express';
import { getTemplate, saveTemplate } from '../controllers/templateController.js';
import { protect } from '../middleware/auth.js';
import { requireSession } from '../middleware/sessionGuard.js';

const router = Router();

router.use(protect, requireSession);
router.get('/', getTemplate);
router.put('/', saveTemplate);

export default router;
