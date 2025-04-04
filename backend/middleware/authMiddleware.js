import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import asyncHandler from 'express-async-handler';

export const protect = asyncHandler(async (req, res, next) => {
  let token;
  
  // Check for token in Authorization header or cookies
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from DB and attach to request
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized, user not found');
    }

    // Check if user is active
    if (!req.user.isActive) {
      res.status(403);
      throw new Error('Account deactivated, please contact admin');
    }

    next();
  } catch (error) {
    res.status(401);
    throw new Error('Not authorized, token failed');
  }
});

// Farmer-only access
export const farmerOnly = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'farmer') {
    res.status(403);
    throw new Error('Farmer access only');
  }
  next();
});

// Admin-only access
export const adminOnly = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Admin access only');
  }
  next();
});

// Buyer-only access
export const buyerOnly = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'buyer') {
    res.status(403);
    throw new Error('Buyer access only');
  }
  next();
});