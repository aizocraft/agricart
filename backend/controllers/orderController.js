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
      return res.status(400).json({ message: 'No order items provided' });
    }

    // Validate product existence and stock
    const products = await Product.find({ 
      _id: { $in: orderItems.map(item => item.product) } 
    });

    if (products.length !== orderItems.length) {
      const missingProducts = orderItems.filter(
        item => !products.some(p => p._id.equals(item.product))
      );
      return res.status(404).json({ 
        message: 'Some products not found',
        missingProducts: missingProducts.map(item => item.product)
      });
    }

    // Check stock availability
    const outOfStockItems = orderItems.filter(item => {
      const product = products.find(p => p._id.equals(item.product));
      return product.stock < item.quantity;
    });

    if (outOfStockItems.length > 0) {
      return res.status(400).json({
        message: 'Some products are out of stock',
        outOfStockItems: outOfStockItems.map(item => ({
          product: item.product,
          requested: item.quantity,
          available: products.find(p => p._id.equals(item.product)).stock
        }))
      });
    }

    // Create order
    const order = new Order({
      user: req.user._id,
      orderItems: orderItems.map(item => ({
        ...item,
        product: item.product,
        price: products.find(p => p._id.equals(item.product)).price
      })),
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    // Save order
    const createdOrder = await order.save();

    // Update stock and notify farmers
    await Promise.all(orderItems.map(async (item) => {
      const product = await Product.findById(item.product);
      product.stock -= item.quantity;
      await product.save();
      
      // Notify farmer about the order (via socket.io if implemented)
      if (req.io) {
        req.io.to(product.farmer.toString()).emit('newOrder', {
          orderId: createdOrder._id,
          productId: product._id,
          quantity: item.quantity
        });
      }
    }));

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
      .populate('user', 'name email')
      .populate('orderItems.product', 'name price image');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify user is owner or admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching order' });
  }
};

// @desc    Get logged-in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching user orders' });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'id name')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching all orders' });
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify user is owner or admin
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.payer?.email_address || req.body.phone,
    };

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error updating order payment' });
  }
};

// @desc    Update order to delivered (Admin or Farmer)
// @route   PUT /api/orders/:id/deliver
// @access  Private/Farmer or Admin
const updateOrderToDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Authorization check
    if (req.user.role === 'farmer') {
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
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Admin or farmer access only'
      });
    }

    // Update order status
    order.isDelivered = true;
    order.deliveredAt = Date.now();
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

// Single export statement at the end
export {
  createOrder,
  getOrderById,
  getUserOrders,
  getOrders,
  updateOrderToPaid,
  updateOrderToDelivered
};