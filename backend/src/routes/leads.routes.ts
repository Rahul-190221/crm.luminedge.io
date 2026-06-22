import express from 'express';
import {
  getLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  addFollowUp,
  updateLeadStage,
  getBDMs,
  importLeads,
  getLeadStats,
  assignLeads
} from '../controllers/leads.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';

const router = express.Router();

// Lead CRUD routes
router.get('/', authenticateToken, authorizeRoles('admin', 'bdm'), getLeads);
router.get('/stats', authenticateToken, authorizeRoles('admin', 'bdm'), getLeadStats);
router.get('/bdms', authenticateToken, authorizeRoles('admin', 'bdm'), getBDMs);
router.get('/:id', authenticateToken, authorizeRoles('admin', 'bdm'), getLead);
router.post('/', authenticateToken, authorizeRoles('admin', 'bdm'), createLead);
router.post('/import', authenticateToken, authorizeRoles('admin'), importLeads);
router.post('/assign', authenticateToken, authorizeRoles('admin'), assignLeads);
router.patch('/:id', authenticateToken, authorizeRoles('admin', 'bdm'), updateLead);
router.patch('/:id/stage', authenticateToken, authorizeRoles('admin', 'bdm'), updateLeadStage);
router.patch('/:id/follow-up', authenticateToken, authorizeRoles('admin', 'bdm'), addFollowUp);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteLead);

export default router;
