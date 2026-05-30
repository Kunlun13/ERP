import { Router } from 'express';
import authRoutes from './authRoutes.js';
import sessionRoutes from './sessionRoutes.js';
import templateRoutes from './templateRoutes.js';
import studentRoutes from './studentRoutes.js';
import testRoutes from './testRoutes.js';
import markRoutes from './markRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import reportRoutes from './reportRoutes.js';
import settingsRoutes from './settingsRoutes.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'School ERP API is running' });
});

router.use('/auth', authRoutes);
router.use('/sessions', sessionRoutes);
router.use('/templates', templateRoutes);
router.use('/students', studentRoutes);
router.use('/tests', testRoutes);
router.use('/marks', markRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/reports', reportRoutes);
router.use('/settings', settingsRoutes);

export default router;
