import { Router } from 'express';
import {
  getTemplates,
  getTemplate,
  saveTemplate,
  createTemplate,
  deleteTemplate,
  generateReport,
} from '../controllers/reportController.js';
import { protect } from '../middleware/auth.js';
import { requireSession } from '../middleware/sessionGuard.js';

const router = Router();

router.use(protect, requireSession);
router.get('/templates', getTemplates);
router.get('/templates/:id', getTemplate);
router.post('/templates', createTemplate);
router.put('/templates/:id', saveTemplate);
router.delete('/templates/:id', deleteTemplate);
router.post('/generate', generateReport);

export default router;
