import { Router } from 'express';
import { getAvailableSchedules } from '../controllers/schedules.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Disable HTTP/edge caching — this route is auth-gated and its response must never be
// served from a cache that doesn't vary by the Authorization header (see dashboard.routes.ts).
router.use((_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  next();
});

router.get('/', authenticateToken, getAvailableSchedules);

export default router;
