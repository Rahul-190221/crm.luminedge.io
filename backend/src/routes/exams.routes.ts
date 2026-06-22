import express from 'express';
import { getExams, getExam, createExam, updateExam, deleteExam } from '../controllers/exams.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', authenticateToken, getExams);
router.get('/:id', authenticateToken, getExam);
router.post('/', authenticateToken, createExam);
router.patch('/:id', authenticateToken, updateExam);
router.delete('/:id', authenticateToken, deleteExam);

export default router;
