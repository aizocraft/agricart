import Product from '../models/Product.js';
import { v2 as cloudinary } from 'cloudinary';
import mongoose from 'mongoose';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Helper function to upload images
const uploadImages = async (imageFiles) => {
  const uploadPromises = imageFiles.map(async (image) => {
    const result = await cloudinary.uploader.upload(image, {
      folder: 'agriCart/products',
      crop: 'scale'
    });
    return result.secure_url;
  });
  return Promise.all(uploadPromises);
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Farmer
export const createProduct = async (req, res) => {
  try {
    const { name, price, description, category, subCategory, stock, organic } = req.body;
    let images = [];

    if (req.files && req.files.length > 0) {
      images = await uploadImages(req.files.map(file => file.path));
    }

    const farmer = await mongoose.model('User').findById(req.user.id);
    if (!farmer) {
      return res.status(404).json({ success: false, message: 'Farmer not found' });
    }

    const product = await Product.create({
      name,
      price,
      description,
      category,
      subCategory,
      images,
      farmer: req.user.id,
      stock,
      location: farmer.location,
      organic
    });

    res.status(201).json({
      success: true,
      product
    });

  } catch (error) {
    console.error('Product creation error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error creating product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get all products with filtering
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    // Filtering
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach(el => delete queryObj[el]);

    // Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    
    let query = Product.find(JSON.parse(queryStr));

    // Search
    if (req.query.search) {
      query = query.find({
        $or: [
          { name: { $regex: req.query.search, $options: 'i' } },
          { description: { $regex: req.query.search, $options: 'i' } }
        ]
      });
    }

    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    const products = await query;
    const total = await Product.countDocuments(JSON.parse(queryStr));

    res.json({
      success: true,
      count: products.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      products
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching products',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }

    res.json({
      success: true,
      product
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Farmer
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }

    // Verify ownership
    if (product.farmer.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to update this product' 
      });
    }

    // Handle image updates
    let images = product.images;
    if (req.files && req.files.length > 0) {
      // Delete old images from Cloudinary
      const deletePromises = product.images.map(async (image) => {
        const publicId = image.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`agriCart/products/${publicId}`);
      });
      await Promise.all(deletePromises);
      
      // Upload new images
      images = await uploadImages(req.files.map(file => file.path));
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        images
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      product: updatedProduct
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error updating product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Farmer
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }

    // Verify ownership
    if (product.farmer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to delete this product' 
      });
    }

    // Delete images from Cloudinary
    const deletePromises = product.images.map(async (image) => {
      const publicId = image.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`agriCart/products/${publicId}`);
    });
    await Promise.all(deletePromises);

    await product.remove();

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error deleting product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Public
export const getProductsByCategory = async (req, res) => {
  try {
    const products = await Product.find({ 
      category: req.params.category 
    });

    res.json({
      success: true,
      count: products.length,
      products
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching products by category',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get farmer's products
// @route   GET /api/products/farmer/:id
// @access  Public
export const getFarmerProducts = async (req, res) => {
  try {
    const products = await Product.find({ 
      farmer: req.params.id 
    });

    res.json({
      success: true,
      count: products.length,
      products
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching farmer products',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};