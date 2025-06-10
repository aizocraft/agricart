// controllers/paymentController.js
import axios from 'axios';
import crypto from 'crypto';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import User from '../models/User.js';

// M-Pesa configuration (should be in environment variables)
const MPESA_CONFIG = {
  CONSUMER_KEY: process.env.MPESA_CONSUMER_KEY,
  CONSUMER_SECRET: process.env.MPESA_CONSUMER_SECRET,
  BUSINESS_SHORT_CODE: process.env.MPESA_BUSINESS_SHORT_CODE,
  PASSKEY: process.env.MPESA_PASSKEY,
  TRANSACTION_TYPE: 'CustomerPayBillOnline',
  CALLBACK_URL: process.env.MPESA_CALLBACK_URL || `${process.env.BASE_URL}/api/payments/mpesa-callback`,
  ACCOUNT_REFERENCE: 'Agricart',
  TRANSACTION_DESC: 'Payment for Agricart Order'
};

// Generate M-Pesa access token
const generateMpesaToken = async () => {
  try {
    const auth = Buffer.from(`${MPESA_CONFIG.CONSUMER_KEY}:${MPESA_CONFIG.CONSUMER_SECRET}`).toString('base64');
    const response = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      headers: {
        Authorization: `Basic ${auth}`
      }
    });
    return response.data.access_token;
  } catch (error) {
    console.error('Error generating M-Pesa token:', error);
    throw new Error('Failed to generate M-Pesa access token');
  }
};

// Generate M-Pesa password
const generateMpesaPassword = () => {
  const timestamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, -4);
  const password = Buffer.from(`${MPESA_CONFIG.BUSINESS_SHORT_CODE}${MPESA_CONFIG.PASSKEY}${timestamp}`).toString('base64');
  return { password, timestamp };
};

// @desc    Initiate M-Pesa STK Push payment
// @route   POST /api/payments/mpesa-stk-push
// @access  Private
const initiateMpesaPayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { orderId, phoneNumber } = req.body;
    const user = req.user;

    // Validate input
    if (!orderId || !phoneNumber) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Order ID and phone number are required'
      });
    }

    // Validate phone number format (2547XXXXXXXX)
    if (!/^2547\d{8}$/.test(phoneNumber)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format. Use format 2547XXXXXXXX'
      });
    }

    // Get the order
    const order = await Order.findById(orderId).session(session);
    if (!order) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify order belongs to user
    if (!order.user.equals(user._id)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        success: false,
        message: 'Not authorized to pay for this order'
      });
    }

    // Check if order is already paid
    if (order.isPaid) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Order is already paid'
      });
    }

    // Check payment method
    if (order.paymentMethod !== 'M-Pesa') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Order payment method is not M-Pesa'
      });
    }

    // Generate M-Pesa credentials
    const token = await generateMpesaToken();
    const { password, timestamp } = generateMpesaPassword();

    // Create payment record
    const payment = new Payment({
      order: order._id,
      user: user._id,
      paymentMethod: 'M-Pesa',
      amount: order.totalPrice,
      status: 'pending'
    });

    // STK Push request payload
    const stkPushPayload = {
      BusinessShortCode: MPESA_CONFIG.BUSINESS_SHORT_CODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: MPESA_CONFIG.TRANSACTION_TYPE,
      Amount: order.totalPrice,
      PartyA: phoneNumber,
      PartyB: MPESA_CONFIG.BUSINESS_SHORT_CODE,
      PhoneNumber: phoneNumber,
      CallBackURL: MPESA_CONFIG.CALLBACK_URL,
      AccountReference: MPESA_CONFIG.ACCOUNT_REFERENCE,
      TransactionDesc: MPESA_CONFIG.TRANSACTION_DESC
    };

    // Send STK Push request
    const response = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      stkPushPayload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Save M-Pesa transaction details
    payment.mpesaTransaction = {
      checkoutRequestID: response.data.CheckoutRequestID,
      merchantRequestID: response.data.MerchantRequestID,
      phoneNumber: phoneNumber,
      amount: order.totalPrice,
      status: 'pending'
    };

    await payment.save({ session });
    await session.commitTransaction();
    session.endSession();

    res.json({
      success: true,
      message: 'M-Pesa payment initiated successfully',
      checkoutRequestID: response.data.CheckoutRequestID,
      paymentId: payment._id
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error('M-Pesa payment initiation error:', error);
    const errorMessage = error.response?.data?.errorMessage || error.message || 'Failed to initiate M-Pesa payment';
    
    res.status(500).json({
      success: false,
      message: errorMessage
    });
  }
};

// @desc    M-Pesa callback handler
// @route   POST /api/payments/mpesa-callback
// @access  Public (called by Safaricom)
const mpesaCallbackHandler = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const callbackData = req.body;
    
    // Validate callback data
    if (!callbackData.Body.stkCallback) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Invalid callback data'
      });
    }

    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = callbackData.Body.stkCallback;

    // Find payment record
    const payment = await Payment.findOne({
      'mpesaTransaction.checkoutRequestID': CheckoutRequestID
    }).session(session);

    if (!payment) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }

    // Update payment status based on result code
    if (ResultCode === 0) {
      // Success case
      const metadata = CallbackMetadata.Item.reduce((acc, item) => {
        acc[item.Name] = item.Value;
        return acc;
      }, {});

      payment.mpesaTransaction = {
        ...payment.mpesaTransaction,
        mpesaReceiptNumber: metadata.MpesaReceiptNumber,
        transactionDate: metadata.TransactionDate,
        amount: metadata.Amount,
        phoneNumber: metadata.PhoneNumber,
        status: 'successful',
        resultCode: ResultCode,
        resultDesc: ResultDesc
      };

      payment.status = 'successful';

      // Update order status
      const order = await Order.findById(payment.order).session(session);
      if (order) {
        order.isPaid = true;
        order.paidAt = new Date();
        order.status = 'Processing';
        order.paymentResult = {
          id: metadata.MpesaReceiptNumber,
          status: 'completed',
          update_time: metadata.TransactionDate,
          phone: metadata.PhoneNumber
        };

        await order.save({ session });

        // Deduct product quantities
        await Promise.all(order.orderItems.map(async (item) => {
          const product = await mongoose.model('Product').findById(item.product).session(session);
          if (product) {
            product.stock -= item.quantity;
            await product.save({ session });
          }
        }));
      }

    } else {
      // Failed case
      payment.mpesaTransaction = {
        ...payment.mpesaTransaction,
        status: 'failed',
        resultCode: ResultCode,
        resultDesc: ResultDesc
      };

      payment.status = 'failed';
    }

    await payment.save({ session });
    await session.commitTransaction();
    session.endSession();

    // Send success response to M-Pesa
    res.json({
      ResultCode: 0,
      ResultDesc: 'Callback processed successfully'
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error('M-Pesa callback processing error:', error);
    res.status(500).json({
      ResultCode: 1,
      ResultDesc: 'Error processing callback'
    });
  }
};

// @desc    Check M-Pesa payment status
// @route   GET /api/payments/status/:paymentId
// @access  Private
const checkPaymentStatus = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId)
      .populate('order')
      .populate('user', 'name email');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }

    // Verify user owns this payment
    if (!payment.user.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this payment'
      });
    }

    res.json({
      success: true,
      payment
    });

  } catch (error) {
    console.error('Payment status check error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking payment status'
    });
  }
};

export {
  initiateMpesaPayment,
  mpesaCallbackHandler,
  checkPaymentStatus
};