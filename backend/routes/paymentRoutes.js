// routes/paymentRoutes.js
import express from 'express';
import { processPayPalPayment, processMpesaPayment } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/paypal/:id', protect, processPayPalPayment);
router.post('/mpesa/:id', protect, processMpesaPayment);

export default router;