import { Router } from 'express';
import { login, register, getMe, updateProfile, logout } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { uploadProfile } from '../middleware/upload.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, uploadProfile, updateProfile);
router.post('/logout', protect, logout);

export default router;
