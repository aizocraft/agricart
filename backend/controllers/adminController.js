import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

// Get System Statistics
export const getStats = async (req, res) => {
  try {
    const usersCount = await User.countDocuments();
    const productsCount = await Product.countDocuments();
    const ordersCount = await Order.countDocuments();
    const totalSales = await Order.aggregate([
      { $group: { _id: null, totalSales: { $sum: '$totalPrice' } } }
    ]);

    res.json({
      usersCount,
      productsCount,
      ordersCount,
      totalSales: totalSales[0]?.totalSales || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update User Role
export const updateUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = req.body.role;
    await user.save();
    res.json({ message: 'User role updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete User
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.remove();
    res.json({ message: 'User removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};