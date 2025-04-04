import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { 
    expiresIn: '30d' 
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, farmName, location, phone } = req.body;

  // Basic validation
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please include all required fields');
  }

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Additional validation for farmers
  if (role === 'farmer') {
    if (!farmName || !location) {
      res.status(400);
      throw new Error('Farmers must provide farm name and location');
    }
  }

  // Create user object based on role
  const userData = {
    name,
    email,
    password,
    role: role || 'buyer'
  };

  // Add farmer-specific fields if role is farmer
  if (role === 'farmer') {
    userData.farmName = farmName;
    userData.location = location;
    if (phone) userData.phone = phone;
  }

  // Create user
  const user = await User.create(userData);

  if (user) {
    const token = generateToken(user._id);
    
    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        farmName: user.farmName,
        location: user.location,
        phone: user.phone,
        avatar: user.avatar
      }
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate request
  if (!email || !password) {
    res.status(400);
    throw new Error('Please include email and password');
  }

  // Check for user and include password field
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  // Verify password
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  // Generate token
  const token = generateToken(user._id);

  res.json({
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      farmName: user.farmName,
      location: user.location,
      phone: user.phone,
      avatar: user.avatar
    }
  });
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json({
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      farmName: user.farmName,
      location: user.location,
      phone: user.phone,
      avatar: user.avatar
    }
  });
});