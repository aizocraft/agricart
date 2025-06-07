import express from 'express';
import {
  createOrder,
  getOrderById,
  getUserOrders,
  getOrders,
  getFarmerOrders,
  updateOrderToPaid,
  updateOrderToDelivered
} from '../controllers/orderController.js';
import { protect, adminOnly, farmerOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createOrder)
  .get(protect, adminOnly, getOrders);

router.route('/myorders').get(protect, getUserOrders);
router.route('/farmer/myorders').get(protect, farmerOnly, getFarmerOrders);

router.route('/:id')
  .get(protect, getOrderById);

router.route('/:id/pay')
  .put(protect, updateOrderToPaid);

router.route('/:id/deliver')
  .put(protect, updateOrderToDelivered); // Both admin and farmer can deliver

export default router;