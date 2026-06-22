import { Router } from 'express';
import { getNews, createNews, updateNews, deleteNews } from '../controllers/news.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/news', getNews); // public
router.post('/admin/news', authMiddleware, createNews);
router.patch('/admin/news/:id', authMiddleware, updateNews);
router.delete('/admin/news/:id', authMiddleware, deleteNews);

export default router;
