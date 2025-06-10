// routes/paymentRoutes.js
import express from 'express';
import { protect, farmerOnly, adminOnly } from '../middleware/authMiddleware.js';
import {
  initiateMpesaPayment,
  mpesaCallbackHandler,
  checkPaymentStatus
} from '../controllers/paymentController.js';

const router = express.Router();

// M-Pesa payment routes
router.post('/mpesa-stk-push', protect, initiateMpesaPayment);
router.post('/mpesa-callback', mpesaCallbackHandler);
router.get('/status/:paymentId', protect, checkPaymentStatus);

export default router;