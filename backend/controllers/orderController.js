import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    // Validate required fields
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'No order items provided' 
      });
    }

    // Validate product existence
    const products = await Product.find({ 
      _id: { $in: orderItems.map(item => item.product) } 
    }).populate('farmer', 'name phone farmName');

    if (products.length !== orderItems.length) {
      const missingProducts = orderItems.filter(
        item => !products.some(p => p._id.equals(item.product))
      );
      return res.status(404).json({ 
        success: false,
        message: 'Some products not found',
        missingProducts: missingProducts.map(item => item.product)
      });
    }

    // Check stock availability (but don't deduct yet)
    const outOfStockItems = orderItems.filter(item => {
      const product = products.find(p => p._id.equals(item.product));
      return product.stock < item.quantity;
    });

    if (outOfStockItems.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Some products are out of stock',
        outOfStockItems: outOfStockItems.map(item => ({
          product: item.product,
          name: products.find(p => p._id.equals(item.product)).name,
          requested: item.quantity,
          available: products.find(p => p._id.equals(item.product)).stock
        }))
      });
    }

    // Create order with all required details
    const order = new Order({
      user: req.user._id,
      orderItems: orderItems.map(item => {
        const product = products.find(p => p._id.equals(item.product));
        return {
          product: item.product,
          name: product.name,
          image: product.images[0],
          quantity: item.quantity,
          price: product.price,
          farmName: product.farmer.farmName,
          farmerPhone: product.farmer.phone
        };
      }),
      shippingAddress: {
        ...shippingAddress,
        phone: shippingAddress.phone || req.user.phone
      },
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      inventoryUpdated: false // Inventory will be updated when paid
    });

    const createdOrder = await order.save();

    res.status(201).json({
      success: true,
      order: createdOrder,
      message: 'Order created successfully'
    });

  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error creating order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email avatar')
      .populate({
        path: 'orderItems.product',
        select: 'name price images farmer',
        populate: {
          path: 'farmer',
          select: 'name avatar farmName phone'
        }
      });

    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    // Authorization check
    const isAdmin = req.user.role === 'admin';
    const isFarmer = req.user.role === 'farmer';
    const isBuyer = order.user._id.equals(req.user._id);
    
    if (!isAdmin && !isBuyer && !isFarmer) {
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized to view this order' 
      });
    }

    // For farmers, verify they have products in this order
    if (isFarmer && !isAdmin) {
      const hasProducts = order.orderItems.some(item => 
        item.product.farmer._id.equals(req.user._id)
      );
      if (!hasProducts) {
        return res.status(403).json({ 
          success: false,
          message: 'Not authorized - no farmer products in this order' 
        });
      }
    }

    res.json({
      success: true,
      order
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message || 'Error fetching order' 
    });
  }
};

// @desc    Get logged-in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'orderItems.product',
        select: 'name images farmer',
        populate: {
          path: 'farmer',
          select: 'name farmName'
        }
      });

    res.json({
      success: true,
      orders,
      count: orders.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message || 'Error fetching user orders' 
    });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email')
      .populate({
        path: 'orderItems.product',
        select: 'name images farmer',
        populate: {
          path: 'farmer',
          select: 'name farmName'
        }
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders,
      count: orders.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message || 'Error fetching all orders' 
    });
  }
};

// @desc    Get farmer's orders
// @route   GET /api/orders/farmer/myorders
// @access  Private/Farmer
const getFarmerOrders = async (req, res) => {
  try {
    // Find products belonging to this farmer
    const farmerProducts = await Product.find({ farmer: req.user._id });
    const productIds = farmerProducts.map(p => p._id);

    // Find orders containing these products
    const orders = await Order.find({
      'orderItems.product': { $in: productIds }
    })
    .populate('user', 'name email')
    .populate({
      path: 'orderItems.product',
      select: 'name images price',
      match: { farmer: req.user._id }
    })
    .sort({ createdAt: -1 });

    // Filter out null products after population
    const filteredOrders = orders.map(order => ({
      ...order.toObject(),
      orderItems: order.orderItems.filter(item => item.product)
    }));

    res.json({
      success: true,
      orders: filteredOrders,
      count: filteredOrders.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message || 'Error fetching farmer orders' 
    });
  }
};
 

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const order = await Order.findById(req.params.id).session(session);

    if (!order) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    // Verify user is owner or admin
    if (!order.user.equals(req.user._id) && req.user.role !== 'admin') {
      await session.abortTransaction();
      session.endSession();
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized to update this order' 
      });
    }

    // If order is already paid, return without changes
    if (order.isPaid) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        success: false,
        message: 'Order is already paid' 
      });
    }

    // Check stock availability before proceeding with payment
    const products = await Product.find({
      _id: { $in: order.orderItems.map(item => item.product) }
    }).session(session);

    const outOfStockItems = order.orderItems.filter(item => {
      const product = products.find(p => p._id.equals(item.product));
      return product.stock < item.quantity;
    });

    if (outOfStockItems.length > 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Cannot complete payment - some products are now out of stock',
        outOfStockItems: outOfStockItems.map(item => ({
          product: item.product,
          name: products.find(p => p._id.equals(item.product)).name,
          requested: item.quantity,
          available: products.find(p => p._id.equals(item.product)).stock
        }))
      });
    }

    // Handle different payment methods
    switch (order.paymentMethod) {
      case 'M-Pesa':
        // For M-Pesa, verify the payment record exists and is successful
        const payment = await Payment.findOne({
          order: order._id,
          status: 'successful'
        }).session(session);

        if (!payment) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({ 
            success: false,
            message: 'No successful M-Pesa payment found for this order' 
          });
        }

        // Use M-Pesa payment details
        order.paymentResult = {
          id: payment.mpesaTransaction.mpesaReceiptNumber,
          status: 'completed',
          update_time: payment.mpesaTransaction.transactionDate,
          phone: payment.mpesaTransaction.phoneNumber
        };
        break;

      case 'Cash on Delivery':
        // For COD, just mark as paid without payment verification
        order.paymentResult = {
          status: 'completed',
          update_time: new Date().toISOString(),
          phone: req.user.phone
        };
        break;

      default:
        // For other payment methods (Credit Card, PayPal, Bank Transfer)
        if (!req.body.id || !req.body.status) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({ 
            success: false,
            message: 'Payment verification details are required for this payment method' 
          });
        }

        order.paymentResult = {
          id: req.body.id,
          status: req.body.status,
          update_time: req.body.update_time || new Date().toISOString(),
          email_address: req.body.payer?.email_address,
          phone: req.body.payer?.phone_number || req.user.phone
        };
    }

    // Update inventory only if not already updated (for M-Pesa it's done in callback)
    if (!order.inventoryUpdated) {
      await Promise.all(order.orderItems.map(async (item) => {
        const product = await Product.findById(item.product).session(session);
        product.stock -= item.quantity;
        await product.save({ session });
        
        // Notify farmer
        if (req.io && product.farmer) {
          req.io.to(product.farmer.toString()).emit('newOrder', {
            orderId: order._id,
            productId: product._id,
            quantity: item.quantity,
            buyerName: req.user.name
          });
        }
      }));
    }

    // Update order status
    order.isPaid = true;
    order.paidAt = Date.now();
    order.status = 'Processing';
    order.inventoryUpdated = true;

    const updatedOrder = await order.save({ session });
    await session.commitTransaction();
    session.endSession();

    // Notify user about successful payment
    if (req.io) {
      req.io.to(order.user.toString()).emit('orderPaid', {
        orderId: order._id,
        paidAt: order.paidAt,
        paymentMethod: order.paymentMethod
      });
    }

    res.json({
      success: true,
      order: updatedOrder,
      message: 'Order payment updated successfully'
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error('Payment update error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Error updating order payment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};



// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin or Farmer
const updateOrderToDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    // Authorization check
    const isAdmin = req.user.role === 'admin';
    const isFarmer = req.user.role === 'farmer';

    if (isFarmer) {
      const farmerProducts = await Product.find({
        _id: { $in: order.orderItems.map(item => item.product) },
        farmer: req.user._id
      });

      if (farmerProducts.length === 0) {
        return res.status(403).json({ 
          success: false,
          message: 'Not authorized - no farmer products in this order'
        });
      }
    } else if (!isAdmin) {
      return res.status(403).json({ 
        success: false,
        message: 'Admin or farmer access only'
      });
    }

    // Update order status
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.status = 'Delivered';
    const updatedOrder = await order.save();

    // Notify buyer
    if (req.io) {
      req.io.to(order.user.toString()).emit('orderDelivered', {
        orderId: order._id,
        deliveredAt: order.deliveredAt
      });
    }

    res.json({
      success: true,
      order: updatedOrder,
      message: 'Order marked as delivered'
    });

  } catch (error) {
    console.error('Delivery update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order delivery status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const order = await Order.findById(req.params.id).session(session);

    if (!order) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    // Authorization - only buyer or admin can cancel
    if (!order.user.equals(req.user._id)) {
      if (req.user.role !== 'admin') {
        await session.abortTransaction();
        session.endSession();
        return res.status(401).json({ 
          success: false,
          message: 'Not authorized to cancel this order' 
        });
      }
    }

    // Check if order can be cancelled
    if (order.status === 'Delivered') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        success: false,
        message: 'Cannot cancel already delivered order' 
      });
    }

    if (order.status === 'Cancelled') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        success: false,
        message: 'Order is already cancelled' 
      });
    }

    // Update order status
    order.status = 'Cancelled';
    order.cancelledAt = Date.now();
    order.cancelledBy = req.user._id;
    
    // Only restore stock if inventory was previously updated (order was paid)
    if (order.inventoryUpdated) {
      await Promise.all(order.orderItems.map(async (item) => {
        const product = await Product.findById(item.product).session(session);
        if (product) {
          product.stock += item.quantity;
          await product.save({ session });
        }
      }));
    }

    const updatedOrder = await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Notify relevant parties
    if (req.io) {
      // Notify buyer
      req.io.to(order.user.toString()).emit('orderCancelled', {
        orderId: order._id,
        cancelledAt: order.cancelledAt
      });

      // Notify farmers
      const farmerIds = [...new Set(
        order.orderItems.map(item => item.product.farmer?.toString()).filter(Boolean)
      )];
      farmerIds.forEach(farmerId => {
        req.io.to(farmerId).emit('farmerOrderCancelled', {
          orderId: order._id,
          cancelledBy: req.user.name,
          cancelledAt: order.cancelledAt
        });
      });
    }

    res.json({
      success: true,
      order: updatedOrder,
      message: 'Order cancelled successfully'
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error('Order cancellation error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error cancelling order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export {
  createOrder,
  getOrderById,
  getUserOrders,
  getOrders,
  getFarmerOrders,
  updateOrderToPaid,
  updateOrderToDelivered,
  cancelOrder
};