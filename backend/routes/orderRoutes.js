import express from 'express';
import {
  createOrder,
  getOrderById,
  getUserOrders,
  getOrders,
  updateOrderToPaid,
  updateOrderToDelivered
} from '../controllers/orderController.js';
import { protect, adminOnly, farmerOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createOrder) // Buyer creates order
  .get(protect, adminOnly, getOrders); // Admin gets all orders

router.route('/myorders').get(protect, getUserOrders); // Buyer gets their orders

router.route('/:id')
  .get(protect, getOrderById); // Get order details

router.route('/:id/pay')
  .put(protect, updateOrderToPaid); // Update order to paid

router.route('/:id/deliver')
  .put(protect, farmerOnly, updateOrderToDelivered); // Farmer marks as delivered

export default router;