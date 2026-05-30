import { Router } from 'express';
import {
  getSettings,
  updateSettings,
  getActivities,
  getDashboardStats,
} from '../controllers/settingsController.js';
import { protect } from '../middleware/auth.js';
import { requireSession } from '../middleware/sessionGuard.js';
import { uploadLogo } from '../middleware/upload.js';

const router = Router();

router.use(protect, requireSession);
router.get('/', getSettings);
router.put('/', uploadLogo, updateSettings);
router.get('/activities', getActivities);
router.get('/dashboard', getDashboardStats);

export default router;
