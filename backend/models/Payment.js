// models/Payment.js
import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['M-Pesa', 'Credit Card', 'PayPal', 'Bank Transfer', 'Cash on Delivery'],
    default: 'M-Pesa'
  },
  mpesaTransaction: {
    checkoutRequestID: String,
    merchantRequestID: String,
    mpesaReceiptNumber: String,
    transactionDate: String,
    phoneNumber: String,
    amount: Number,
    status: {
      type: String,
      enum: ['pending', 'successful', 'failed', 'cancelled'],
      default: 'pending'
    },
    resultCode: Number,
    resultDesc: String
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'successful', 'failed', 'cancelled'],
    default: 'pending'
  },
  paymentDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;