import express from 'express';
import {
  getUsers,
  getUserProfile,
  updateUserProfile,
  getUserById,
  updateUser,
  deleteUser,
  toggleUserActive
} from '../controllers/userController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { upload } from '../utils/uploadMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, adminOnly, getUsers);

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, upload.single('avatar'), updateUserProfile);

router.route('/:id')
  .get(protect, adminOnly, getUserById)
  .put(protect, adminOnly, updateUser)
  .delete(protect, adminOnly, deleteUser);

router.put('/:id/active', protect, adminOnly, toggleUserActive);

export default router;