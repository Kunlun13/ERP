import { Router } from 'express';
import {
  getSessions,
  createSession,
  getSession,
  updateSession,
  deleteSession,
} from '../controllers/sessionController.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = Router();

router.use(protect);
router.get('/', getSessions);
router.post('/', authorize(ROLES.ADMIN, ROLES.TEACHER), createSession);
router.get('/:id', getSession);
router.put('/:id', authorize(ROLES.ADMIN, ROLES.TEACHER), updateSession);
router.delete('/:id', authorize(ROLES.ADMIN), deleteSession);

export default router;
