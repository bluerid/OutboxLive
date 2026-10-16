import { Router } from 'express';
import postsRouter from './posts.js';

const router = Router();

// Example API route
router.get('/status', (req, res) => {
  res.json({ status: 'ok' });
});

// Posts routes
router.use('/posts', postsRouter);

export default router;
