import User from '../models/User.js';
import asyncHandler from 'express-async-handler';
import { v2 as cloudinary } from 'cloudinary';

// @desc    Get all users (Admin)
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password');
  res.json({
    success: true,
    count: users.length,
    users
  });
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
    .select('-password')
    .populate('products', 'name price images')
    .populate('orders', 'totalPrice isPaid isDelivered createdAt');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json({
    success: true,
    user
  });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Handle avatar upload
  let avatarUrl = user.avatar;
  if (req.file) {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'agriCart/avatars',
      width: 150,
      crop: 'scale'
    });
    avatarUrl = result.secure_url;
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      ...req.body,
      avatar: avatarUrl
    },
    { new: true, runValidators: true }
  ).select('-password');

  res.json({
    success: true,
    user: updatedUser
  });
});

// @desc    Get user by ID (Admin)
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json({
    success: true,
    user
  });
});

// @desc    Update user (Admin)
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).select('-password');

  res.json({
    success: true,
    user: updatedUser
  });
});

// @desc    Delete user (Admin)
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Delete avatar from Cloudinary if not default
  if (!user.avatar.includes('default-avatar')) {
    const publicId = user.avatar.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(`agriCart/avatars/${publicId}`);
  }

  await user.remove();

  res.json({
    success: true,
    message: 'User removed successfully'
  });
});

// @desc    Toggle user active status (Admin)
// @route   PUT /api/users/:id/active
// @access  Private/Admin
export const toggleUserActive = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.isActive = !user.isActive;
  await user.save();

  res.json({
    success: true,
    isActive: user.isActive,
    message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`
  });
});