// routes/adminRoutes.js
import express from 'express';
import { getStats, getUsers, updateUserRole, deleteUser } from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, adminOnly, getStats);
router.get('/users', protect, adminOnly, getUsers);
router.route('/users/:id')
  .put(protect, adminOnly, updateUserRole)
  .delete(protect, adminOnly, deleteUser);

export default router;