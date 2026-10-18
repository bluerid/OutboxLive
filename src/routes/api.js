import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import postsRouter from './posts.js';
import usersRouter from './users.js';

const router = Router();

// Example API route
router.get('/status', (req, res) => {
  res.json({ status: 'ok' });
});

// Posts routes
router.use('/posts', postsRouter);
router.use('/users', authenticateToken, usersRouter);

export default router;
