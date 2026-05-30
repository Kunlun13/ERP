import { Router } from 'express';
import {
  getTests,
  getTest,
  createTest,
  updateTest,
  deleteTest,
} from '../controllers/testController.js';
import { protect } from '../middleware/auth.js';
import { requireSession } from '../middleware/sessionGuard.js';

const router = Router();

router.use(protect, requireSession);
router.get('/', getTests);
router.get('/:id', getTest);
router.post('/', createTest);
router.put('/:id', updateTest);
router.delete('/:id', deleteTest);

export default router;
